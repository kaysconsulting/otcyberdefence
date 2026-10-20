import type { Inputs } from './types.ts'

// Defaults = a typical mature site that has not yet done network segmentation (the target market).
export const DEFAULT_INPUTS: Inputs = {
  architecture: 'vlans',
  remoteAccess: 'vpn_mfa',
  vendorCount: 12,
  sharedAccounts: true,
  dormantAccounts: 'rarely',
  legacy: 'some',
  visibility: 'visible',
  removableMedia: 'uncontrolled',
  sisZone: 'shared',
  itOtLink: 'direct',
  sisKeySwitch: 'program',
}

/** Validation rules (spec 6.2). A flat network forces a direct IT/OT link. */
export function normalise(i: Inputs): Inputs {
  return i.architecture === 'flat' ? { ...i, itOtLink: 'direct' } : i
}

/** When the architecture changes, Purdue/per-asset designs default the IT/OT link to "through a DMZ". */
export function onArchitectureChange(i: Inputs, architecture: Inputs['architecture']): Inputs {
  const next: Inputs = { ...i, architecture }
  if (architecture === 'purdue_dmz' || architecture === 'microsegmented') {
    if (next.itOtLink === 'direct') next.itOtLink = 'via_dmz'
  }
  return normalise(next)
}
