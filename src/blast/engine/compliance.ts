import type { FixId, Inputs, SimResult } from './types.ts'
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
  fix_remote: ['remote'],
  fix_segment_overlay: ['segmentation', 'safety', 'legacy'],
  fix_cloak: ['segmentation', 'legacy'],
  fix_media: ['media'],
  fix_accounts: ['accounts', 'remote'],
}

/**
 * Maps a site and its results to the obligations they touch. Pure and deterministic.
 * `runs` are the per-entry results for the same inputs and attacker.
 */
export function complianceGaps(inputs: Inputs, runs: SimResult[]): ComplianceItem[] {
  const ran = (e: SimResult['entry']) => runs.find((r) => r.entry === e)
  const remoteIn = !!(ran('stolen_remote_cred')?.entrySucceeded || ran('vendor_account')?.entrySucceeded)
  const vendorIn = !!ran('vendor_account')?.entrySucceeded
  const updateIntoOps = !!ran('poisoned_update')?.reachedZones.some((z) => z === 'L3' || z === 'L2' || z === 'L1' || z === 'SIS')
  const controlReached = runs.some((r) => r.l1Reached)
  const sisLogic = runs.some((r) => r.sisLogicChangeable)
  const legacyHit = inputs.legacy !== 'none' && runs.some((r) => r.reachedAssetIds.some((id) => r.site.assets.find((a) => a.id === id)?.legacy))
  const usbIn = !!ran('infected_usb')?.entrySucceeded

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
  return runs.some((r) => r.reachedZones.some((z) => z === 'L2' || z === 'L1' || z === 'SIS'))
}
