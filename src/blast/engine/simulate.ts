import type { BlockedStep, Capability, EntryId, Inputs, PathStep, SimResult, ZoneId } from './types.ts'
import { buildSite } from './site.ts'
import { resolveEntry } from './entry.ts'
import { blockReason, canCross, crossReason, effectiveStrength } from './conduits.ts'
import { bandFor, exposure } from './score.ts'
import { spreadReason } from '../content/copy.ts'
import { normalise } from './inputs.ts'

/** Deterministic breadth-first attack path search (spec 7.4). Same inputs, same result. */
export function simulate(rawInputs: Inputs, entry: EntryId, capability: Capability): SimResult {
  const inputs = normalise(rawInputs)
  const site = buildSite(inputs)
  const res = resolveEntry(inputs, entry)
  const path: PathStep[] = []
  const blocked: BlockedStep[] = []
  const reachedZones = new Set<ZoneId>()
  const reachedAssets = new Set<string>()

  if (res.succeeded) {
    const queue: { zone: ZoneId; asset?: string }[] = []
    for (const l of res.landing) {
      if (!site.zones.includes(l.zone)) continue
      path.push({ kind: 'entry', to: l.zone, reason: res.reason })
      queue.push(l)
    }

    while (queue.length) {
      const { zone, asset } = queue.shift()!
      if (reachedZones.has(zone)) continue
      reachedZones.add(zone)

      const zoneAssets = site.assets.filter((a) => a.zone === zone)
      const landingAsset = zoneAssets.find((a) => a.id === asset) ?? zoneAssets[0]
      if (res.restrictToSingleAsset) {
        // Zero trust session: one named asset, no onward movement.
        reachedAssets.add(landingAsset.id)
        break
      }
      if (site.intraSpread[zone] === 'open') {
        zoneAssets.forEach((a) => reachedAssets.add(a.id))
        if (zoneAssets.length > 1) path.push({ kind: 'spread', to: zone, reason: spreadReason.open(zone) })
      } else {
        reachedAssets.add(landingAsset.id)
        if (zoneAssets.length > 1) path.push({ kind: 'spread', to: zone, reason: spreadReason.restricted(zone) })
      }

      const reachedHere = site.assets.filter((a) => a.zone === zone && reachedAssets.has(a.id))
      for (const c of site.conduits.filter((c) => c.from === zone)) {
        if (reachedZones.has(c.to) || !site.zones.includes(c.to)) continue
        if (queue.some((q) => q.zone === c.to)) continue
        const eff = effectiveStrength(c, inputs, entry, reachedHere)
        const { ok, viaFlow } = canCross(c, eff, capability, inputs, reachedAssets.has('L3-ews'))
        if (ok) {
          path.push({ kind: 'cross', from: zone, to: c.to, reason: crossReason(c, eff, inputs, viaFlow) })
          queue.push({ zone: c.to })
        } else if (!blocked.some((b) => b.from === zone && b.to === c.to)) {
          blocked.push({ from: zone, to: c.to, reason: blockReason(c, eff, inputs) })
        }
      }
    }
  }

  // A zone reached later through another route is not "blocked" in the final picture.
  const finalBlocked = blocked.filter((b) => !reachedZones.has(b.to))
  const score = exposure(site, reachedAssets)
  return {
    entry,
    entrySucceeded: res.succeeded,
    entryReason: res.reason,
    entryZones: res.landing.map((l) => l.zone).filter((z) => site.zones.includes(z)),
    reachedAssetIds: [...reachedAssets],
    reachedZones: [...reachedZones],
    path,
    blocked: finalBlocked,
    exposureScore: score,
    band: bandFor(score),
    sisReached: reachedZones.has('SIS'),
    l1Reached: reachedZones.has('L1'),
    site,
  }
}

export const ALL_ENTRIES: EntryId[] = ['phished_login', 'stolen_remote_cred', 'infected_usb', 'poisoned_update', 'vendor_account']

/** Main result: run every entry point and return all runs plus the worst case. */
export function worstCase(inputs: Inputs, capability: Capability = 2) {
  const runs = ALL_ENTRIES.map((e) => simulate(inputs, e, capability))
  const worst = runs.reduce((w, r) =>
    r.exposureScore > w.exposureScore || (r.exposureScore === w.exposureScore && r.sisReached && !w.sisReached) ? r : w,
  )
  return { worst, runs }
}
