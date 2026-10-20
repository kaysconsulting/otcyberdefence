import type { EntryId, Inputs, ZoneId } from './types.ts'
import { entryReason as R } from '../content/copy.ts'
import { hasDmz } from './site.ts'

export interface EntryResolution {
  succeeded: boolean
  landing: { zone: ZoneId; asset: string }[]
  reason: string
  restrictToSingleAsset: boolean
}

/** Vendor populations this large almost always include MFA exceptions or vendors' own remote tools. */
export const LARGE_VENDOR_POPULATION = 20

function remote(inputs: Inputs, vendor: boolean): EntryResolution {
  // With an industrial DMZ, remote access ends there (unless IT is wired straight into OT).
  const viaDmz = hasDmz(inputs) && inputs.itOtLink !== 'direct'
  const land = viaDmz ? [{ zone: 'L35' as ZoneId, asset: 'L35-ra' }] : [{ zone: 'L3' as ZoneId, asset: 'L3-scada' }]
  const where = viaDmz ? R.remoteLandsDmz : inputs.remoteAccess === 'jumpbox' ? R.jumpboxNoDmz : R.remoteLandsL3
  const airgap = inputs.itOtLink === 'airgap_claimed' ? ` ${R.notAirgapped}` : ''
  const ok = (why: string): EntryResolution => ({ succeeded: true, landing: land, reason: `${why} ${where}${airgap}`, restrictToSingleAsset: false })
  const fail = (why: string): EntryResolution => ({ succeeded: false, landing: [], reason: why, restrictToSingleAsset: inputs.remoteAccess === 'zero_trust_biometric' })

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

/** Spec 7.3, refined: where each entry lands and whether it succeeds. */
export function resolveEntry(inputs: Inputs, entry: EntryId): EntryResolution {
  switch (entry) {
    case 'phished_login':
      return { succeeded: true, landing: [{ zone: 'L4', asset: 'L4-pcs' }], reason: R.phished, restrictToSingleAsset: false }
    case 'stolen_remote_cred':
      return remote(inputs, false)
    case 'vendor_account':
      return remote(inputs, true)
    case 'infected_usb':
      return inputs.removableMedia === 'uncontrolled'
        ? { succeeded: true, landing: [{ zone: 'L3', asset: 'L3-ews' }], reason: R.usbIn, restrictToSingleAsset: false }
        : { succeeded: false, landing: [], reason: R.usbBlocked, restrictToSingleAsset: false }
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
      }
    }
  }
}
