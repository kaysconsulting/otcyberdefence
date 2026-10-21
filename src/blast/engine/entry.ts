import type { EntryId, Inputs, Likelihood, ZoneId } from './types.ts'
import { entryReason as R } from '../content/copy.ts'
import { hasDmz } from './site.ts'

export interface EntryResolution {
  succeeded: boolean
  landing: { zone: ZoneId; asset: string }[]
  reason: string
  restrictToSingleAsset: boolean
  /** How likely this way in is to work (the first step of every route). */
  likelihood: Likelihood
}

/** Vendor populations this large almost always include MFA exceptions or vendors' own remote tools (11 to 25 likely, 26+ very likely). */
export const LARGE_VENDOR_POPULATION = 11

/** Vendor way in likelihood by how many vendors hold access: 1 to 2 unlikely, 3 to 10 possible, 11 or more likely. */
export const vendorLikelihood = (n: number): Likelihood => (n >= LARGE_VENDOR_POPULATION ? 'likely' : n >= 3 ? 'possible' : 'unlikely')

function remote(inputs: Inputs, vendor: boolean): EntryResolution {
  // With an industrial DMZ, remote access ends there (unless IT is wired straight into OT).
  const viaDmz = hasDmz(inputs) && inputs.itOtLink !== 'direct'
  const land = viaDmz ? [{ zone: 'L35' as ZoneId, asset: 'L35-ra' }] : [{ zone: 'L3' as ZoneId, asset: 'L3-scada' }]
  const where = viaDmz ? R.remoteLandsDmz : inputs.remoteAccess === 'jumpbox' ? R.jumpboxNoDmz : R.remoteLandsL3
  const lik: Likelihood = vendor ? vendorLikelihood(inputs.vendorCount) : 'likely'
  const few = vendor && lik === 'unlikely' ? ` ${R.fewVendors}` : ''
  const ok = (why: string): EntryResolution => ({ succeeded: true, landing: land, reason: `${why} ${where}${few}`, restrictToSingleAsset: false, likelihood: lik })
  const fail = (why: string): EntryResolution => ({ succeeded: false, landing: [], reason: why, restrictToSingleAsset: inputs.remoteAccess === 'zero_trust_biometric', likelihood: 'likely' })

  if (inputs.remoteAccess === 'none') return fail(R.noRemote)
  if (vendor && inputs.vendorCount === 0) return fail(R.noVendors)
  const bigVendorPool = vendor && inputs.vendorCount >= LARGE_VENDOR_POPULATION

  switch (inputs.remoteAccess) {
    case 'vpn_password':
      return ok(R.remotePassword)
    case 'vpn_mfa':
      if (inputs.sharedAccounts) return ok(R.remoteMfaShared)
      if (inputs.dormantAccounts === 'rarely') return ok(R.remoteMfaDormant)
      if (bigVendorPool) return ok(R.vendorMfaGap(inputs.vendorCount))
      return fail(R.remoteMfaFail)
    case 'jumpbox':
      if (inputs.sharedAccounts) return ok(R.jumpboxShared)
      if (bigVendorPool) return ok(R.vendorMfaGap(inputs.vendorCount))
      return fail(R.jumpboxFail)
    case 'zero_trust_biometric':
      return fail(R.zeroTrustFail)
  }
}

/** Spec 7.3, refined: where each entry lands, whether it succeeds and how likely it is. */
export function resolveEntry(inputs: Inputs, entry: EntryId): EntryResolution {
  switch (entry) {
    case 'phished_login':
      return { succeeded: true, landing: [{ zone: 'L4', asset: 'L4-pcs' }], reason: R.phished, restrictToSingleAsset: false, likelihood: 'likely' }
    case 'stolen_remote_cred':
      return remote(inputs, false)
    case 'vendor_account':
      return remote(inputs, true)
    case 'infected_usb':
      // USB always lands on the engineering workstation (rule C2). Controlled media makes it unlikely, not impossible.
      return inputs.removableMedia === 'uncontrolled'
        ? { succeeded: true, landing: [{ zone: 'L3', asset: 'L3-ews' }], reason: R.usbIn, restrictToSingleAsset: false, likelihood: 'likely' }
        : { succeeded: true, landing: [{ zone: 'L3', asset: 'L3-ews' }], reason: R.usbControlled, restrictToSingleAsset: false, likelihood: 'unlikely' }
    case 'poisoned_update': {
      // Updates land where the software is installed: IT software on corporate PCs; OT vendor software
      // on the DMZ patch server when there is one, otherwise straight onto site operations servers.
      const dmz = hasDmz(inputs)
      return {
        succeeded: true,
        landing: [
          { zone: 'L4', asset: 'L4-pcs' },
          dmz ? { zone: 'L35', asset: 'L35-patch' } : { zone: 'L3', asset: 'L3-scada' },
        ],
        reason: `${R.update} ${R.updateIt} ${dmz ? R.updateOtDmz : R.updateOtDirect}`,
        restrictToSingleAsset: false,
        likelihood: 'likely',
      }
    }
  }
}
