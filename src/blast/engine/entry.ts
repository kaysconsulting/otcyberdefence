import type { EntryId, Inputs, ZoneId } from './types.ts'
import { entryReason as R } from '../content/copy.ts'
import { hasDmz } from './site.ts'

export interface EntryResolution {
  succeeded: boolean
  landing: { zone: ZoneId; asset: string }[]
  reason: string
  restrictToSingleAsset: boolean
}

function remote(inputs: Inputs): EntryResolution {
  const dmz = hasDmz(inputs)
  const vpnLanding = [{ zone: 'L3' as ZoneId, asset: 'L3-scada' }]
  switch (inputs.remoteAccess) {
    case 'vpn_password':
      return { succeeded: true, landing: vpnLanding, reason: `${R.remotePassword} ${R.remoteLandsL3}`, restrictToSingleAsset: false }
    case 'vpn_mfa': {
      if (inputs.sharedAccounts) return { succeeded: true, landing: vpnLanding, reason: `${R.remoteMfaShared} ${R.remoteLandsL3}`, restrictToSingleAsset: false }
      if (inputs.dormantAccounts === 'rarely') return { succeeded: true, landing: vpnLanding, reason: `${R.remoteMfaDormant} ${R.remoteLandsL3}`, restrictToSingleAsset: false }
      return { succeeded: false, landing: [], reason: R.remoteMfaFail, restrictToSingleAsset: false }
    }
    case 'jumpbox': {
      if (!inputs.sharedAccounts) return { succeeded: false, landing: [], reason: R.jumpboxFail, restrictToSingleAsset: false }
      return dmz
        ? { succeeded: true, landing: [{ zone: 'L35', asset: 'L35-ra' }], reason: `${R.jumpboxShared} ${R.remoteLandsL35}`, restrictToSingleAsset: false }
        : { succeeded: true, landing: vpnLanding, reason: `${R.jumpboxShared} ${R.jumpboxNoDmz}`, restrictToSingleAsset: false }
    }
    case 'zero_trust_biometric':
      return { succeeded: false, landing: [], reason: R.zeroTrustFail, restrictToSingleAsset: true }
  }
}

/** Spec 7.3: where each entry lands and whether it succeeds. */
export function resolveEntry(inputs: Inputs, entry: EntryId): EntryResolution {
  switch (entry) {
    case 'phished_login':
      return { succeeded: true, landing: [{ zone: 'L4', asset: 'L4-pcs' }], reason: R.phished, restrictToSingleAsset: false }
    case 'stolen_remote_cred':
    case 'vendor_account':
      return remote(inputs)
    case 'infected_usb':
      return inputs.removableMedia === 'uncontrolled'
        ? { succeeded: true, landing: [{ zone: 'L3', asset: 'L3-ews' }], reason: R.usbIn, restrictToSingleAsset: false }
        : { succeeded: false, landing: [], reason: R.usbBlocked, restrictToSingleAsset: false }
    case 'poisoned_update':
      return {
        succeeded: true,
        landing: [
          { zone: 'L4', asset: 'L4-pcs' },
          { zone: 'L3', asset: 'L3-scada' },
        ],
        reason: R.update,
        restrictToSingleAsset: false,
      }
  }
}
