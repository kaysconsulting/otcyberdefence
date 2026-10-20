import type { AssetGroup, Capability, Conduit, EntryId, Inputs, Strength } from './types.ts'
import { blockReason as blockText, crossReason as crossText, why } from '../content/copy.ts'

/** Entry points that travel over the network (an air gap claim stops these, not removable media). */
export const NETWORK_ENTRIES: EntryId[] = ['phished_login', 'stolen_remote_cred', 'poisoned_update', 'vendor_account']

export interface Effective {
  strength: Strength
  airgap: boolean
  cloaked: boolean
  legacy: boolean
}

/** Applies the spec 7.2 modifiers on top of the architecture's base strength. */
export function effectiveStrength(c: Conduit, inputs: Inputs, entry: EntryId, reachedInFrom: AssetGroup[]): Effective {
  let s: number = c.strength
  let airgap = false
  let cloaked = false
  let legacy = false
  if (inputs.itOtLink === 'airgap_claimed' && (c.from === 'L4' || c.to === 'L4') && NETWORK_ENTRIES.includes(entry)) {
    s = 3
    airgap = true
  }
  if (!airgap && inputs.visibility === 'cloaked' && (c.to === 'L2' || c.to === 'L1' || c.to === 'SIS') && s < 3) {
    s += 1
    cloaked = true
  }
  // Unpatched services make an existing path easier to use, but cannot create a path where none exists (blocked).
  if (!airgap && s > 0 && s < 3 && (c.from === 'L1' || c.from === 'L2') && reachedInFrom.some((a) => a.legacy)) {
    s -= 1
    legacy = true
  }
  return { strength: Math.min(3, Math.max(0, s)) as Strength, airgap, cloaked, legacy }
}

/** Whether the attacker can cross, and if so whether it was by riding a legitimate flow. */
/** Ways in that arrive holding a valid login, which permitted remote-access routes will accept. */
export const CREDENTIAL_ENTRIES: EntryId[] = ['stolen_remote_cred', 'vendor_account']

export function canCross(c: Conduit, eff: Effective, capability: Capability, inputs: Inputs, ewsReached: boolean, entry: EntryId) {
  // Commodity crews (ransomware) take over Windows systems; changing PLC or safety logic needs OT know-how.
  if (capability === 1 && (c.to === 'L1' || c.to === 'SIS')) return { ok: false, viaFlow: false, viaCreds: false, commodity: true }
  // A stolen login does not need to beat a firewall: the conduit is configured to let that user through.
  if (c.remoteFlow && CREDENTIAL_ENTRIES.includes(entry) && !eff.airgap) return { ok: true, viaFlow: false, viaCreds: true, commodity: false }
  if (capability > eff.strength) return { ok: true, viaFlow: false, viaCreds: false, commodity: false }
  const flowUsable = !!c.allowedFlow && ewsReached && inputs.visibility === 'visible' && eff.strength < 3
  return { ok: flowUsable, viaFlow: flowUsable, viaCreds: false, commodity: false }
}

export function crossReason(c: Conduit, eff: Effective, inputs: Inputs, viaFlow: boolean, viaCreds = false): string {
  let w: string
  if (viaCreds) w = why.credential
  else if (viaFlow) w = why.allowedFlow
  else if (eff.legacy) w = why.legacy
  else if (eff.strength === 0) w = inputs.architecture === 'vlans' ? why.vlanBroad : why.open
  else if (eff.strength === 1) w = why.filteredWeak
  else w = why.controlledBeaten
  return crossText(c.from, c.to, eff.strength, w)
}

export function blockReason(c: Conduit, eff: Effective, inputs: Inputs, commodity = false): string {
  let w: string
  if (commodity) w = why.commodityNoLogic
  else if (eff.airgap) w = why.airgap
  else if (c.to === 'SIS' && inputs.sisZone === 'dedicated') w = why.sisDedicated
  else if (eff.cloaked) w = why.cloaked
  else if (eff.strength === 3) w = why.blocked
  else if (eff.strength === 2) w = why.controlled
  else w = why.filtered
  return blockText(c.from, c.to, w)
}
