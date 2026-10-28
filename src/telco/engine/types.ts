// Telco SOCI Readiness: a carrier network modelled as zones, with the links an attacker could cross between them.
export type ZoneId = 'corp' | 'mgmt' | 'core' | 'transport' | 'access' | 'li' | 'site'
export type Strength = 0 | 1 | 2 | 3 // open, filtered, controlled, blocked
export type Capability = 1 | 2 | 3
export type Likelihood = 'likely' | 'possible' | 'unlikely'
export type Band = 'Contained' | 'Partly exposed' | 'Highly exposed'

export interface Inputs {
  mgmtSeparation: 'shared' | 'firewalled' | 'dedicated_oob'
  mgmtSegmentation: 'flat' | 'by_domain' | 'per_asset'
  liIsolation: 'shared' | 'separate'
  siteOt: 'on_corporate' | 'on_management' | 'isolated'
  privilegedAuth: 'password' | 'mfa_app' | 'phishing_resistant'
  vendorAccess: 'always_on' | 'on_request' | 'brokered'
  vendorCount: number
  sharedAccounts: boolean
  edgePatching: 'behind' | 'mostly' | 'current'
  apiExposure: 'unknown' | 'inventoried' | 'tested'
  inventory: 'partial' | 'mostly' | 'complete'
  logging: 'limited' | 'central' | 'monitored'
  irPlan: 'none' | 'it_only' | 'tested'
  changeProcess: 'none' | 'informal' | 'formal'
}

export type EntryId = 'phished_staff' | 'vendor_access' | 'edge_exploit' | 'exposed_api' | 'site_visit'

export interface Asset {
  id: string
  zone: ZoneId
  label: string
  criticality: number
}

export interface Link {
  from: ZoneId
  to: ZoneId
  strength: Strength
  /** Admin logins are accepted here, so an attacker holding one walks through rather than breaking in. */
  takesLogins?: boolean
}

export interface PathStep {
  kind: 'entry' | 'cross'
  from?: ZoneId
  to: ZoneId
  reason: string
  likelihood: Likelihood
}

export interface BlockedStep {
  from: ZoneId
  to: ZoneId
  reason: string
}

export interface SimResult {
  entry: EntryId
  capability: Capability
  entrySucceeded: boolean
  entryLikelihood: Likelihood
  entryReason: string
  entryZones: ZoneId[]
  /** Likelihood of reaching each zone (absent = not reached). */
  zoneLikelihood: Partial<Record<ZoneId, Likelihood>>
  path: PathStep[]
  blocked: BlockedStep[]
  exposureScore: number
  band: Band
}

export type FixId =
  | 'fix_inventory'
  | 'fix_change'
  | 'fix_privileged'
  | 'fix_ir'
  | 'fix_vendor'
  | 'fix_edge'
  | 'fix_api'
  | 'fix_monitor'
  | 'fix_mgmt_sep'
  | 'fix_segment'
  | 'fix_li'
  | 'fix_site'

export type AreaId = 'network' | 'access' | 'exposure'

export type ScenarioId = 'optus2022' | 'iinet2025' | 'kyivstar' | 'salttyphoon' | 'volttyphoon'
export type ScenarioOutcome = 'succeeds' | 'partly' | 'stopped'

export type ObligationId =
  | 'security'
  | 'notification'
  | 'register'
  | 'reporting'
  | 'riskProgram'
  | 'maturity'
  | 'irPlan'
  | 'exercises'
  | 'vulnAssess'
  | 'sysInfo'
  | 'phishingMfa'
  | 'segregation'
  | 'legacyRisk'
  | 'logging'

/** 'check' = this tool cannot assess it from your answers. */
export type Readiness = 'ready' | 'partly' | 'gap' | 'check'
