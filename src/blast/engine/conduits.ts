import type { AssetGroup, Capability, Conduit, EntryId, Inputs, Likelihood, Strength } from './types.ts'
import { blockReason as blockText, crossReason as crossText, why } from '../content/copy.ts'

/** Entry points that travel over the network (an air gap claim stops these, not removable media). */
export const NETWORK_ENTRIES: EntryId[] = ['phished_login', 'stolen_remote_cred', 'poisoned_update', 'vendor_account']

/** Ways in that arrive holding a valid login, which permitted remote-access routes will accept. */
export const CREDENTIAL_ENTRIES: EntryId[] = ['stolen_remote_cred', 'vendor_account']

export interface Effective {
  strength: Strength
  airgap: boolean
  cloaked: boolean
  legacy: boolean
}

const OT_DEVICE_ZONES = ['L2', 'L1', 'SIS']

/** Applies the spec 7.2 modifiers on top of the architecture's base strength. Cloaking changes likelihood, not strength (rule C6). */
export function effectiveStrength(c: Conduit, inputs: Inputs, entry: EntryId, reachedInFrom: AssetGroup[]): Effective {
  let s: number = c.strength
  let airgap = false
  let legacy = false
  if (inputs.itOtLink === 'airgap_claimed' && (c.from === 'L4' || c.to === 'L4') && NETWORK_ENTRIES.includes(entry)) {
    s = 3
    airgap = true
  }
  // Unpatched services make an existing path easier to use, but cannot create a path where none exists (blocked).
  if (!airgap && s > 0 && s < 3 && (c.from === 'L1' || c.from === 'L2') && reachedInFrom.some((a) => a.legacy)) {
    s -= 1
    legacy = true
  }
  const cloaked = !airgap && inputs.visibility === 'cloaked' && OT_DEVICE_ZONES.includes(c.to)
  return { strength: Math.min(3, Math.max(0, s)) as Strength, airgap, cloaked, legacy }
}

const RANK: Record<Likelihood, number> = { likely: 3, possible: 2, unlikely: 1 }
export const rankOf = (l: Likelihood) => RANK[l]
export const weaker = (a: Likelihood, b: Likelihood): Likelihood => (RANK[a] <= RANK[b] ? a : b)
export const stronger = (a: Likelihood, b: Likelihood): Likelihood => (RANK[a] >= RANK[b] ? a : b)
const down = (l: Likelihood): Likelihood | null => (l === 'likely' ? 'possible' : l === 'possible' ? 'unlikely' : null)
const up = (l: Likelihood): Likelihood => (l === 'unlikely' ? 'possible' : 'likely')
/** Share of an asset group's criticality counted in the score, by how likely it is to be reached. */
export const LIKELIHOOD_WEIGHT: Record<Likelihood, number> = { likely: 1, possible: 0.6, unlikely: 0.3 }

/**
 * Graded, not certain: an open conduit or a big capability margin is likely to be crossed;
 * just beating a filtered conduit is possible; just beating a controlled one is unlikely, but possible.
 */
export function crossLikelihood(capability: Capability, strength: Strength): Likelihood {
  if (strength === 0 || capability - strength >= 2) return 'likely'
  return strength === 1 ? 'possible' : 'unlikely'
}

/** Rule C3: shared logins get reused on jump hosts and HMIs once an attacker holds a working login. */
export const credentialReuse = (inputs: Inputs, entry: EntryId) =>
  inputs.sharedAccounts && inputs.architecture !== 'microsegmented' && (CREDENTIAL_ENTRIES.includes(entry) || (entry === 'phished_login' && inputs.dormantAccounts === 'rarely'))

export interface CrossContext {
  capability: Capability
  inputs: Inputs
  entry: EntryId
  ewsReached: boolean
  /** The way in landed on the engineering workstation itself (USB or visiting laptop). */
  landedOnEws: boolean
}

export interface Crossing {
  ok: boolean
  viaFlow: boolean
  viaCreds: boolean
  commodity: boolean
  likelihood: Likelihood
}

const NO: Crossing = { ok: false, viaFlow: false, viaCreds: false, commodity: false, likelihood: 'likely' }

/** Whether the attacker can cross, how likely it is, and whether it rides a legitimate flow or login. */
export function canCross(c: Conduit, eff: Effective, x: CrossContext): Crossing {
  const { capability, inputs, entry } = x
  // Controllers do not open connections upward, so an attacker on a PLC or safety controller does not pivot back up.
  if (c.from === 'SIS' || (c.from === 'L1' && c.to !== 'SIS')) return NO
  const options: Crossing[] = []
  // A stolen login does not need to beat a firewall: the conduit is configured to let that user through.
  if (c.remoteFlow && CREDENTIAL_ENTRIES.includes(entry) && !eff.airgap) options.push({ ...NO, ok: true, viaCreds: true, likelihood: 'likely' })
  // C3: shared credentials reused on HMIs (supervisory likely), and from there on controllers (possible).
  if (credentialReuse(inputs, entry) && eff.strength < 3 && ((c.from === 'L3' && c.to === 'L2') || (c.from === 'L2' && c.to === 'L1')))
    options.push({ ...NO, ok: true, viaCreds: true, likelihood: c.to === 'L2' ? 'likely' : 'possible' })
  // Riding trusted engineering traffic. C6: the workstation still talks to the devices it manages, even when cloaked.
  if (c.allowedFlow && x.ewsReached && eff.strength < 3) {
    const holdsEws = x.landedOnEws || capability >= 2
    // Safety programming is a narrower, rarer flow: possible at most, and only for an attacker who holds the workstation.
    if (c.to !== 'SIS' || holdsEws) options.push({ ...NO, ok: true, viaFlow: true, likelihood: c.to === 'SIS' ? 'possible' : holdsEws ? 'likely' : 'possible' })
  }
  if (capability > eff.strength) options.push({ ...NO, ok: true, likelihood: crossLikelihood(capability, eff.strength) })
  if (!options.length) return NO

  let best = options.reduce((b, o) => (rankOf(o.likelihood) > rankOf(b.likelihood) ? o : b))
  let lik = best.likelihood
  // C7: many unpatchable devices on a flat or VLAN network widen the reach by one level.
  if (inputs.legacy === 'many' && (inputs.architecture === 'flat' || inputs.architecture === 'vlans')) lik = up(lik)
  // C10: commodity crews rarely go after controllers, unless nothing separates them or they hold the engineering workstation.
  if (capability === 1 && (c.to === 'L1' || c.to === 'SIS') && inputs.architecture !== 'flat' && !(best.viaFlow && x.landedOnEws)) lik = weaker(lik, 'possible')
  // C6 and C10: cloaking cuts reconnaissance. Commodity crews give up; nation-states lose only half a level.
  if (eff.cloaked && !best.viaFlow) {
    if (capability === 1) return { ...NO, commodity: true }
    const lowered = capability === 3 ? (lik === 'likely' ? 'possible' : lik) : down(lik)
    if (!lowered) return NO
    lik = lowered
  }
  best = { ...best, likelihood: lik }
  return best
}

export function crossReason(c: Conduit, eff: Effective, inputs: Inputs, viaFlow: boolean, viaCreds = false, lik: Likelihood = 'likely'): string {
  let w: string
  if (viaCreds) w = c.remoteFlow ? why.credential : why.sharedReuse
  else if (viaFlow) w = c.to === 'SIS' ? why.allowedFlowSis : why.allowedFlow
  else if (eff.legacy) w = why.legacy
  else if (eff.strength === 0) w = inputs.architecture === 'vlans' ? why.vlanBroad : why.open
  else if (eff.strength === 1) w = why.filteredWeak
  else w = why.controlledBeaten
  if (eff.cloaked && !viaFlow) w = `${w}, although cloaking would make the devices harder to find`
  return crossText(c.from, c.to, eff.strength, w, lik)
}

export function blockReason(c: Conduit, eff: Effective, inputs: Inputs, commodity = false): string {
  let w: string
  if (commodity && eff.cloaked) w = why.cloakedCommodity
  else if (eff.airgap) w = why.airgap
  else if (c.to === 'SIS' && inputs.sisZone === 'dedicated') w = why.sisDedicated
  else if (eff.cloaked) w = why.cloaked
  else if (eff.strength === 3) w = why.blocked
  else if (eff.strength === 2) w = why.controlled
  else w = why.filtered
  return blockText(c.from, c.to, w)
}
