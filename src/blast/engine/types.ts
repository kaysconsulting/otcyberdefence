export type ZoneId = 'L4' | 'L35' | 'L3' | 'L2' | 'L1' | 'SIS'
export type Strength = 0 | 1 | 2 | 3 // open, filtered, controlled, blocked
export type Capability = 1 | 2 | 3
/** How likely the attacker is to get somewhere: the weakest step on the best route decides it. */
export type Likelihood = 'likely' | 'possible' | 'unlikely'

export interface Inputs {
  architecture: 'flat' | 'vlans' | 'purdue_dmz' | 'microsegmented'
  remoteAccess: 'vpn_password' | 'vpn_mfa' | 'jumpbox' | 'zero_trust_biometric'
  vendorCount: number
  sharedAccounts: boolean
  dormantAccounts: 'rarely' | 'regularly'
  legacy: 'none' | 'some' | 'many'
  visibility: 'visible' | 'cloaked'
  removableMedia: 'uncontrolled' | 'controlled'
  sisZone: 'shared' | 'dedicated'
  itOtLink: 'direct' | 'via_dmz' | 'airgap_claimed'
  sisKeySwitch: 'program' | 'run'
}

export type EntryId = 'phished_login' | 'stolen_remote_cred' | 'infected_usb' | 'poisoned_update' | 'vendor_account'

export interface AssetGroup {
  id: string
  zone: ZoneId
  label: string
  criticality: number
  legacy: boolean
}

export interface Conduit {
  from: ZoneId
  to: ZoneId
  strength: Strength
  allowedFlow?: string // e.g. 'EWS programming traffic'
  remoteFlow?: boolean // a permitted remote-access route (e.g. DMZ jump host to site operations)
}

export interface Site {
  zones: ZoneId[]
  assets: AssetGroup[]
  conduits: Conduit[]
  intraSpread: Record<ZoneId, 'open' | 'restricted'>
}

export interface PathStep {
  kind: 'entry' | 'cross' | 'spread'
  from?: ZoneId
  to: ZoneId
  reason: string
  likelihood?: Likelihood
}

export interface BlockedStep {
  from: ZoneId
  to: ZoneId
  reason: string
}

export type Band = 'Contained' | 'Partly exposed' | 'Highly exposed'

export interface SimResult {
  entry: EntryId
  entrySucceeded: boolean
  entryReason: string
  entryZones: ZoneId[]
  reachedAssetIds: string[]
  reachedZones: ZoneId[]
  /** Likelihood of reaching each zone / asset group (absent = not reached). */
  zoneLikelihood: Partial<Record<ZoneId, Likelihood>>
  assetLikelihood: Record<string, Likelihood>
  path: PathStep[]
  blocked: BlockedStep[]
  exposureScore: number
  band: Band
  sisReached: boolean
  /** Safety network reached AND key switches allow logic changes. */
  sisLogicChangeable: boolean
  l1Reached: boolean
  /** Conduits crossed before reaching control (L1); null if control was not reached. */
  stepsToControl: number | null
  capability: Capability
  site: Site
}

export type FixId = 'fix_remote' | 'fix_segment_overlay' | 'fix_cloak' | 'fix_media' | 'fix_accounts'

export type ScenarioId = 'stuxnet' | 'ukraine2015' | 'triton' | 'notpetya' | 'colonial' | 'dpworld'

export interface ScenarioResult {
  id: ScenarioId
  succeeded: boolean
  /** How likely success is, when it can succeed at all. */
  likelihood?: Likelihood
  reason: string
  stoppedAt?: BlockedStep
  runs: SimResult[]
  reachedZones: ZoneId[]
  reachedAssetIds: string[]
  path: PathStep[]
}
