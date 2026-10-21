import type { BlockedStep, Capability, EntryId, Inputs, Likelihood, PathStep, SimResult, ZoneId } from './types.ts'
import { buildSite } from './site.ts'
import { resolveEntry } from './entry.ts'
import { blockReason, canCross, crossReason, effectiveStrength, rankOf, weaker } from './conduits.ts'
import { bandFor, exposure } from './score.ts'
import { safetyRule, spreadReason, entryReason as ER } from '../content/copy.ts'
import { normalise } from './inputs.ts'

interface Candidate {
  zone: ZoneId
  asset?: string
  depth: number
  lik: Likelihood
  step: PathStep
  order: number
}

/**
 * Deterministic most-likely-route search (spec 7.4, graded). Each zone is reached by its most likely route:
 * a route is only as likely as its weakest step, and ties go to the shorter route. Same inputs, same result.
 */
export function simulate(rawInputs: Inputs, entry: EntryId, capability: Capability): SimResult {
  const inputs = normalise(rawInputs)
  const site = buildSite(inputs)
  const res = resolveEntry(inputs, entry)
  // C10: commodity crews rarely bother with vendor or supply chain routes.
  let entryLik: Likelihood = res.likelihood
  let entryText = res.reason
  if (capability === 1 && (entry === 'vendor_account' || entry === 'poisoned_update') && entryLik === 'likely') {
    entryLik = 'possible'
    entryText = `${res.reason} ${ER.commodityVendor}`
  }
  const landedOnEws = res.landing.some((l) => l.asset === 'L3-ews')
  const path: PathStep[] = []
  const blocked: BlockedStep[] = []
  const reachedZones = new Set<ZoneId>()
  const reachedAssets = new Set<string>()
  const zoneLikelihood: Partial<Record<ZoneId, Likelihood>> = {}
  const assetLikelihood: Record<string, Likelihood> = {}
  const depthOf = new Map<ZoneId, number>()
  const viaCredsInto = new Set<ZoneId>()

  if (res.succeeded) {
    const pending: Candidate[] = []
    let order = 0
    for (const l of res.landing) {
      if (!site.zones.includes(l.zone)) continue
      pending.push({ ...l, depth: 0, lik: entryLik, step: { kind: 'entry', to: l.zone, reason: entryText, likelihood: entryLik }, order: order++ })
    }

    while (pending.length) {
      // Most likely first, then fewest steps, then discovery order (keeps it deterministic).
      pending.sort((a, b) => rankOf(b.lik) - rankOf(a.lik) || a.depth - b.depth || a.order - b.order)
      const { zone, asset, depth, lik, step } = pending.shift()!
      if (reachedZones.has(zone)) continue
      reachedZones.add(zone)
      depthOf.set(zone, depth)
      zoneLikelihood[zone] = lik
      path.push(step)
      if (step.kind === 'cross' && step.viaCreds) viaCredsInto.add(zone)

      const zoneAssets = site.assets.filter((a) => a.zone === zone)
      const landingAsset = zoneAssets.find((a) => a.id === asset) ?? zoneAssets[0]
      const reach = (id: string) => {
        reachedAssets.add(id)
        assetLikelihood[id] = lik
      }
      if (res.restrictToSingleAsset) {
        // Zero trust session: one named asset, no onward movement.
        reach(landingAsset.id)
        break
      }
      if (site.intraSpread[zone] === 'open') {
        zoneAssets.forEach((a) => reach(a.id))
        if (zoneAssets.length > 1) path.push({ kind: 'spread', to: zone, reason: spreadReason.open(zone), likelihood: lik })
      } else {
        reach(landingAsset.id)
        if (zoneAssets.length > 1) path.push({ kind: 'spread', to: zone, reason: spreadReason.restricted(zone, inputs.architecture !== 'microsegmented'), likelihood: lik })
      }

      const reachedHere = site.assets.filter((a) => a.zone === zone && reachedAssets.has(a.id))
      for (const c of site.conduits.filter((c) => c.from === zone)) {
        if (reachedZones.has(c.to) || !site.zones.includes(c.to)) continue
        const eff = effectiveStrength(c, inputs, entry, reachedHere)
        const x = canCross(c, eff, { capability, inputs, entry, ewsReached: reachedAssets.has('L3-ews'), landedOnEws })
        if (x.ok) {
          const routeLik = weaker(lik, x.likelihood)
          pending.push({
            zone: c.to,
            depth: depth + 1,
            lik: routeLik,
            step: { kind: 'cross', from: zone, to: c.to, reason: crossReason(c, eff, inputs, x.viaFlow, x.viaCreds, x.likelihood), likelihood: x.likelihood, viaCreds: x.viaCreds },
            order: order++,
          })
        } else if (!blocked.some((b) => b.from === zone && b.to === c.to)) {
          blocked.push({ from: zone, to: c.to, reason: blockReason(c, eff, inputs, x.commodity) })
        }
      }
    }
  }

  if (res.succeeded && !res.restrictToSingleAsset) {
    // Unpatchable devices: once within reach, known weaknesses make them likely, not just possible.
    // Combination rules override single answers, so a zone reached only by reusing shared logins (C3) keeps its level.
    for (const a of site.assets) if (a.legacy && assetLikelihood[a.id] === 'possible' && !viaCredsInto.has(a.zone)) assetLikelihood[a.id] = 'likely'

    // C5: safety is only likely safe with a dedicated zone, the key in run, and devices cloaked or segmented per asset.
    const prot = [inputs.sisZone === 'dedicated', inputs.sisKeySwitch === 'run', inputs.visibility === 'cloaked' || inputs.architecture === 'microsegmented'].filter(Boolean).length
    const sisAssets = site.assets.filter((a) => a.zone === 'SIS')
    const current = zoneLikelihood.SIS
    let target: Likelihood | undefined = current
    // Used as a ceiling: three protections keep safety likely safe, two cap it at possible; otherwise the attack path decides.
    if (prot === 3) target = undefined
    else if (target && prot === 2) target = weaker(target, 'possible')
    if (target !== current) {
      // Replace the safety part of the picture with the rule's result.
      for (let k = path.length - 1; k >= 0; k--) if (path[k].to === 'SIS') path.splice(k, 1)
      for (let k = blocked.length - 1; k >= 0; k--) if (blocked[k].to === 'SIS') blocked.splice(k, 1)
      sisAssets.forEach((a) => {
        reachedAssets.delete(a.id)
        delete assetLikelihood[a.id]
      })
      reachedZones.delete('SIS')
      delete zoneLikelihood.SIS
      const from: ZoneId = zoneLikelihood.L1 ? 'L1' : 'L2'
      if (target) {
        reachedZones.add('SIS')
        zoneLikelihood.SIS = target
        sisAssets.forEach((a) => {
          reachedAssets.add(a.id)
          assetLikelihood[a.id] = target!
        })
        path.push({ kind: 'cross', from, to: 'SIS', reason: safetyRule.reached(target, prot), likelihood: target })
      } else if (current) {
        blocked.push({ from, to: 'SIS', reason: safetyRule.safe })
      }
    }
  }

  // A zone reached later through another route is not "blocked" in the final picture.
  const finalBlocked = blocked.filter((b) => !reachedZones.has(b.to))
  let score = exposure(site, assetLikelihood)
  if (res.succeeded) {
    // C4: on a flat network any foothold reaches control. C10: a nation-state is never fully contained.
    if (inputs.architecture === 'flat') score = Math.max(score, 70)
    if (capability === 3) score = Math.max(score, 10)
  }
  return {
    entry,
    entrySucceeded: res.succeeded,
    entryLikelihood: entryLik,
    entryReason: entryText,
    entryZones: res.landing.map((l) => l.zone).filter((z) => site.zones.includes(z)),
    reachedAssetIds: [...reachedAssets],
    reachedZones: [...reachedZones],
    zoneLikelihood,
    assetLikelihood,
    path,
    blocked: finalBlocked,
    exposureScore: score,
    band: bandFor(score),
    sisReached: reachedZones.has('SIS'),
    sisLogicChangeable: reachedZones.has('SIS') && inputs.sisKeySwitch === 'program',
    l1Reached: reachedZones.has('L1'),
    stepsToControl: depthOf.has('L1') ? depthOf.get('L1')! : null,
    capability,
    site,
  }
}

/** Most likely reach of each asset across several runs (used by the replays). */
export function mergeAssetLikelihood(runs: SimResult[]): Record<string, Likelihood> {
  const out: Record<string, Likelihood> = {}
  for (const r of runs)
    for (const [id, l] of Object.entries(r.assetLikelihood)) if (!out[id] || rankOf(l) > rankOf(out[id])) out[id] = l
  return out
}

export const ALL_ENTRIES: EntryId[] = ['phished_login', 'stolen_remote_cred', 'infected_usb', 'poisoned_update', 'vendor_account']

const likRank = (r: SimResult, z: ZoneId) => {
  const l = r.zoneLikelihood[z]
  return l ? rankOf(l) : 0
}

/** Main result: run every entry point and return all runs plus the worst case. */
export function worstCase(inputs: Inputs, capability: Capability = 2) {
  const runs = ALL_ENTRIES.map((e) => simulate(inputs, e, capability))
  const worst = runs.reduce((w, r) => {
    if (r.exposureScore !== w.exposureScore) return r.exposureScore > w.exposureScore ? r : w
    if (r.sisLogicChangeable !== w.sisLogicChangeable) return r.sisLogicChangeable ? r : w
    if (likRank(r, 'SIS') !== likRank(w, 'SIS')) return likRank(r, 'SIS') > likRank(w, 'SIS') ? r : w
    // Same reach: the faster route to control is the worse case.
    const rs = r.stepsToControl ?? 99
    const ws = w.stepsToControl ?? 99
    return rs < ws ? r : w
  })
  return { worst, runs }
}
