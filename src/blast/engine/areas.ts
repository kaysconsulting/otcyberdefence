import type { AreaId, Band, Capability, EntryId, FixId, Inputs, SimResult } from './types.ts'
import { worstCase } from './simulate.ts'
import { applyFixes, fixApplies } from './fixes.ts'
import { answerText as A, phases, type Phase } from '../content/plan.ts'

export const AREA_ORDER: AreaId[] = ['network', 'remote', 'devices']

/** The ways in that test each area. */
export const AREA_ENTRIES: Record<AreaId, EntryId[]> = {
  network: ['phished_login', 'poisoned_update'],
  remote: ['stolen_remote_cred', 'vendor_account'],
  devices: ['infected_usb'],
}

/** The plan steps that improve each area. */
export const AREA_FIXES: Record<AreaId, FixId[]> = {
  network: ['fix_itot_dmz', 'fix_sis_zone', 'fix_segment_overlay', 'fix_cloak'],
  remote: ['fix_remote', 'fix_accounts'],
  devices: ['fix_media', 'fix_keyswitch'],
}

export type Finding = { text: string; good: boolean }

export interface AreaResult {
  id: AreaId
  /** The area's own worst run (from its ways in only). */
  worst: SimResult
  runs: SimResult[]
  score: number
  level: 'high' | 'medium' | 'low'
  findings: Finding[]
  /** Overall worst-case score if only this area's steps were taken. */
  aloneScore: number
}

const levelFor = (b: Band): AreaResult['level'] => (b === 'Highly exposed' ? 'high' : b === 'Partly exposed' ? 'medium' : 'low')

export function areaFindings(raw: Inputs, area: AreaId): Finding[] {
  // Findings describe what was picked (raw), so the visitor recognises their own answers.
  const i = raw
  const T = A
  const out: Finding[] = []
  const add = (text: string, good = false) => out.push({ text, good })
  if (area === 'network') {
    add(T.architecture[i.architecture], i.architecture === 'microsegmented')
    if (i.architecture !== 'flat') add(T.itOtLink[i.itOtLink], i.itOtLink === 'via_dmz' || (i.itOtLink === 'airgap_claimed' && i.remoteAccess === 'none'))
    add(T.sisZone[i.sisZone], i.sisZone === 'dedicated')
    add(T.visibility[i.visibility], i.visibility === 'cloaked')
  } else if (area === 'remote') {
    add(T.remoteAccess[i.remoteAccess], i.remoteAccess === 'zero_trust_biometric' || i.remoteAccess === 'none')
    if (i.remoteAccess !== 'none' && i.vendorCount > 0) add(T.vendors(i.vendorCount), i.vendorCount <= 2)
    add(i.sharedAccounts ? T.sharedAccounts.yes : T.sharedAccounts.no, !i.sharedAccounts)
    add(T.dormantAccounts[i.dormantAccounts], i.dormantAccounts === 'regularly')
  } else {
    add(T.removableMedia[i.removableMedia], i.removableMedia === 'controlled')
    add(T.legacy[i.legacy], i.legacy === 'none')
    add(T.sisKeySwitch[i.sisKeySwitch], i.sisKeySwitch === 'run')
  }
  // Issues first, then what is helping.
  return [...out.filter((f) => !f.good), ...out.filter((f) => f.good)]
}

/** Breaks one worst-case result into the three areas a team would work on separately. */
export function areaBreakdown(inputs: Inputs, capability: Capability, all = worstCase(inputs, capability)): AreaResult[] {
  return AREA_ORDER.map((id) => {
    const runs = all.runs.filter((r) => AREA_ENTRIES[id].includes(r.entry))
    const worst = runs.reduce((w, r) => (r.exposureScore > w.exposureScore ? r : w))
    const aloneScore = worstCase(applyFixes(inputs, AREA_FIXES[id]), capability).worst.exposureScore
    return { id, worst, runs, score: worst.exposureScore, level: levelFor(worst.band), findings: areaFindings(inputs, id), aloneScore }
  })
}

/**
 * The phases in the order a team would likely run them on this site. Knowing the site and quick wins come first,
 * and keeping it working comes last. Remote access and segmentation are ordered by which lowers the worst case more.
 */
export function planPhases(inputs: Inputs, capability: Capability): Phase[] {
  const byId = (id: string) => phases.find((p) => p.id === id)!
  const gain = (p: Phase) => worstCase(applyFixes(inputs, p.fixes), capability).worst.exposureScore
  const middle = [byId('remote'), byId('segment')].sort((a, b) => gain(a) - gain(b))
  return [byId('know'), byId('quick'), ...middle, byId('keep')]
}

/** Score after each phase, applying the steps chosen so far in phase order. */
export function progress(inputs: Inputs, capability: Capability, ordered: Phase[], chosen: FixId[]) {
  const out: { phase: Phase; score: number; band: Band }[] = []
  let sofar: FixId[] = []
  for (const p of ordered) {
    if (!p.fixes.length) continue
    sofar = [...sofar, ...p.fixes.filter((f) => chosen.includes(f))]
    const w = worstCase(applyFixes(inputs, sofar), capability).worst
    out.push({ phase: p, score: w.exposureScore, band: w.band })
  }
  return out
}

export { fixApplies }
