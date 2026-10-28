import type { AreaId, Capability, EntryId, FixId, Inputs } from './types.ts'
import { worstCase } from './model.ts'

export const FIX_CHANGES: Record<FixId, Partial<Inputs>> = {
  fix_inventory: { inventory: 'complete' },
  fix_change: { changeProcess: 'formal' },
  fix_privileged: { privilegedAuth: 'phishing_resistant', sharedAccounts: false },
  fix_ir: { irPlan: 'tested' },
  fix_vendor: { vendorAccess: 'brokered' },
  fix_edge: { edgePatching: 'current' },
  fix_api: { apiExposure: 'tested' },
  fix_monitor: { logging: 'monitored' },
  fix_mgmt_sep: { mgmtSeparation: 'dedicated_oob' },
  fix_segment: { mgmtSegmentation: 'per_asset' },
  fix_li: { liIsolation: 'separate' },
  fix_site: { siteOt: 'isolated' },
}

export const FIX_ORDER = Object.keys(FIX_CHANGES) as FixId[]

export function applyFixes(i: Inputs, fixes: FixId[]): Inputs {
  return FIX_ORDER.filter((f) => fixes.includes(f)).reduce((acc, f) => ({ ...acc, ...FIX_CHANGES[f] }), i)
}

/** A fix only applies when it would change something on this network. */
export function fixApplies(i: Inputs, f: FixId): boolean {
  return Object.entries(FIX_CHANGES[f]).some(([k, v]) => i[k as keyof Inputs] !== v)
}

/** Rank fixes by how much each would likely lower the worst case on its own. */
export function rankFixes(i: Inputs, cap: Capability) {
  const today = worstCase(i, cap).worst.exposureScore
  return FIX_ORDER.filter((f) => fixApplies(i, f))
    .map((fix) => ({ fix, drop: today - worstCase(applyFixes(i, [fix]), cap).worst.exposureScore }))
    .filter((x) => x.drop > 0)
    .sort((a, b) => b.drop - a.drop || FIX_ORDER.indexOf(a.fix) - FIX_ORDER.indexOf(b.fix))
}

export const AREA_ORDER: AreaId[] = ['network', 'access', 'exposure']

/** The ways in that test each area, and the plan steps that improve it. */
export const AREA_ENTRIES: Record<AreaId, EntryId[]> = {
  network: ['edge_exploit', 'site_visit'],
  access: ['phished_staff', 'vendor_access'],
  exposure: ['exposed_api', 'edge_exploit'],
}
export const AREA_FIXES: Record<AreaId, FixId[]> = {
  network: ['fix_mgmt_sep', 'fix_segment', 'fix_li', 'fix_site'],
  access: ['fix_privileged', 'fix_vendor'],
  exposure: ['fix_edge', 'fix_api'],
}

export type PhaseId = 'know' | 'quick' | 'access' | 'segment' | 'keep'
export const PHASE_FIXES: Record<PhaseId, FixId[]> = {
  know: ['fix_inventory', 'fix_change'],
  quick: ['fix_privileged', 'fix_ir'],
  access: ['fix_vendor', 'fix_edge', 'fix_api', 'fix_monitor'],
  segment: ['fix_mgmt_sep', 'fix_segment', 'fix_li', 'fix_site'],
  keep: [],
}
export const PHASE_ORDER: PhaseId[] = ['know', 'quick', 'access', 'segment', 'keep']

/** Score after each phase, applying the chosen steps in phase order. */
export function progress(i: Inputs, cap: Capability, chosen: FixId[]) {
  let sofar: FixId[] = []
  return PHASE_ORDER.filter((p) => PHASE_FIXES[p].length).map((p) => {
    sofar = [...sofar, ...PHASE_FIXES[p].filter((f) => chosen.includes(f))]
    const w = worstCase(applyFixes(i, sofar), cap).worst
    return { phase: p, score: w.exposureScore, band: w.band }
  })
}
