import type { FixId, Inputs, SimResult, ZoneId } from './types.ts'
import { compliance as T } from '../content/copy.ts'

export type ComplianceId = 'remote' | 'supply' | 'segmentation' | 'safety' | 'legacy' | 'media' | 'accounts'

export interface ComplianceItem {
  id: ComplianceId
  title: string
  detail: string
  /** CIRMP hazard area this sits under. */
  cirmp: string
  refs: string[]
}

/** Which compliance gaps each fix helps close (shown on the compare step). */
export const FIX_ADDRESSES: Record<FixId, ComplianceId[]> = {
  fix_accounts: ['accounts', 'remote'],
  fix_keyswitch: ['safety'],
  fix_media: ['media'],
  fix_remote: ['remote'],
  fix_itot_dmz: ['segmentation', 'supply'],
  fix_sis_zone: ['safety', 'segmentation'],
  fix_segment_overlay: ['segmentation', 'safety', 'legacy'],
  fix_cloak: ['segmentation', 'legacy'],
}

/**
 * Maps a site and its results to the obligations they touch. Pure and deterministic.
 * `runs` are the per-entry results for the same inputs and attacker.
 */
export function complianceGaps(inputs: Inputs, runs: SimResult[]): ComplianceItem[] {
  const ran = (e: SimResult['entry']) => runs.find((r) => r.entry === e)
  // Gaps are raised by likely or possible outcomes, not by "unlikely, but possible" ones.
  const real = (r?: SimResult) => !!r && r.entrySucceeded && r.entryLikelihood !== 'unlikely'
  const hits = (r: SimResult, zones: ZoneId[]) => zones.some((z) => r.zoneLikelihood[z] && r.zoneLikelihood[z] !== 'unlikely')
  const remoteIn = real(ran('stolen_remote_cred')) || real(ran('vendor_account'))
  const vendorIn = real(ran('vendor_account'))
  const update = ran('poisoned_update')
  const updateIntoOps = !!update && hits(update, ['L3', 'L2', 'L1', 'SIS'])
  const controlReached = runs.some((r) => hits(r, ['L1']))
  const sisLogic = runs.some((r) => r.sisLogicChangeable && hits(r, ['SIS']))
  const legacyHit =
    inputs.legacy !== 'none' &&
    runs.some((r) => r.site.assets.some((a) => a.legacy && r.assetLikelihood[a.id] && r.assetLikelihood[a.id] !== 'unlikely'))
  const usbIn = real(ran('infected_usb'))

  const out: ComplianceItem[] = []
  if (remoteIn) out.push({ id: 'remote', ...T.remote })
  if (vendorIn || updateIntoOps) out.push({ id: 'supply', ...T.supply })
  if (controlReached) out.push({ id: 'segmentation', ...T.segmentation })
  if (sisLogic) out.push({ id: 'safety', ...T.safety })
  if (legacyHit) out.push({ id: 'legacy', ...T.legacy })
  if (usbIn) out.push({ id: 'media', ...T.media })
  if (inputs.sharedAccounts || inputs.dormantAccounts === 'rarely') out.push({ id: 'accounts', ...T.accounts })
  return out
}

/** True when a real incident like the worst case would likely affect operations (relevant to SOCI reporting). */
export function operationalImpact(runs: SimResult[]): boolean {
  return runs.some((r) => (['L2', 'L1', 'SIS'] as ZoneId[]).some((z) => r.zoneLikelihood[z] && r.zoneLikelihood[z] !== 'unlikely'))
}
