import type { Inputs } from './types.ts'
import { notes } from '../content/copy.ts'

// Defaults = a typical site that has not yet segmented its network (the target market).
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

/** Rule C11: "Not sure" is scored as the riskier answer. */
export const RISKIER: Inputs = {
  architecture: 'flat',
  remoteAccess: 'vpn_password',
  vendorCount: 30,
  sharedAccounts: true,
  dormantAccounts: 'rarely',
  legacy: 'many',
  visibility: 'visible',
  removableMedia: 'uncontrolled',
  sisZone: 'shared',
  itOtLink: 'direct',
  sisKeySwitch: 'program',
}

/**
 * Validation rules (spec 6.2 plus rule C9). Contradictory answers are scored as the riskier reading:
 * a flat network is always direct; an "air gap" with remote access is connected; a Purdue DMZ that IT can bypass is VLANs.
 */
export function normalise(i: Inputs): Inputs {
  let n = i
  if (n.architecture === 'flat') n = { ...n, itOtLink: 'direct' }
  if (n.itOtLink === 'airgap_claimed' && n.remoteAccess !== 'none') n = { ...n, itOtLink: 'via_dmz' }
  if (n.architecture === 'purdue_dmz' && n.itOtLink === 'direct') n = { ...n, architecture: 'vlans' }
  return n
}

/** Rule C9: explain any answer we scored differently from how it was picked. */
export function contradictions(i: Inputs): string[] {
  const out: string[] = []
  if (i.itOtLink === 'airgap_claimed' && i.remoteAccess !== 'none' && i.architecture !== 'flat') out.push(notes.airgapWithRemote)
  if (i.architecture === 'purdue_dmz' && i.itOtLink === 'direct') out.push(notes.dmzBypassed)
  return out
}

/** True air gap: no network link to IT and no remote access. */
export const trulyAirGapped = (i: Inputs) => normalise(i).itOtLink === 'airgap_claimed'

/** When the architecture changes, Purdue/per-asset designs default the IT/OT link to "through a DMZ". */
export function onArchitectureChange(i: Inputs, architecture: Inputs['architecture']): Inputs {
  const next: Inputs = { ...i, architecture }
  if (architecture === 'purdue_dmz' || architecture === 'microsegmented') {
    if (next.itOtLink === 'direct') next.itOtLink = 'via_dmz'
  }
  return next
}
