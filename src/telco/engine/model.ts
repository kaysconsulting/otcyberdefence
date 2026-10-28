import type { Asset, Band, BlockedStep, Capability, EntryId, Inputs, Likelihood, Link, PathStep, SimResult, Strength, ZoneId } from './types.ts'
import { blockText, crossText, entryText, why } from '../content/copy.ts'

/** Top to bottom on the network map. */
export const ZONE_ORDER: ZoneId[] = ['corp', 'mgmt', 'core', 'transport', 'access', 'li', 'site']

export const ASSETS: Asset[] = [
  { id: 'custdata', zone: 'corp', label: 'Customer data and APIs', criticality: 3 },
  { id: 'crm', zone: 'corp', label: 'Billing and orders', criticality: 2 },
  { id: 'email', zone: 'corp', label: 'Staff email and files', criticality: 1 },
  { id: 'oss', zone: 'mgmt', label: 'OSS and network management', criticality: 3 },
  { id: 'jump', zone: 'mgmt', label: 'NOC jump hosts', criticality: 3 },
  { id: 'pcore', zone: 'core', label: 'Mobile packet core', criticality: 3 },
  { id: 'voice', zone: 'core', label: 'Voice and Triple Zero', criticality: 3 },
  { id: 'dns', zone: 'core', label: 'DNS and signalling', criticality: 3 },
  { id: 'edge', zone: 'transport', label: 'Edge and peering routers', criticality: 2 },
  { id: 'backbone', zone: 'transport', label: 'Backbone and fibre', criticality: 3 },
  { id: 'mobile', zone: 'access', label: 'Mobile sites', criticality: 2 },
  { id: 'fixed', zone: 'access', label: 'Fixed access and exchanges', criticality: 2 },
  { id: 'li', zone: 'li', label: 'Lawful intercept', criticality: 3 },
  { id: 'power', zone: 'site', label: 'Power and batteries', criticality: 3 },
  { id: 'cooling', zone: 'site', label: 'Cooling and building management', criticality: 2 },
]

const TOTAL = ASSETS.reduce((n, a) => n + a.criticality, 0)
const RANK: Record<Likelihood, number> = { likely: 3, possible: 2, unlikely: 1 }
export const rankOf = (l: Likelihood) => RANK[l]
export const weaker = (a: Likelihood, b: Likelihood): Likelihood => (RANK[a] <= RANK[b] ? a : b)
const down = (l: Likelihood): Likelihood | null => (l === 'likely' ? 'possible' : l === 'possible' ? 'unlikely' : null)
const up = (l: Likelihood): Likelihood => (l === 'unlikely' ? 'possible' : 'likely')
export const LIKELIHOOD_WEIGHT: Record<Likelihood, number> = { likely: 1, possible: 0.6, unlikely: 0.3 }
const cap3 = (n: number) => Math.min(3, Math.max(0, n)) as Strength

/** The links between zones that this layout creates. */
export function links(i: Inputs): Link[] {
  const seg = { flat: 0, by_domain: 1, per_asset: 2 }[i.mgmtSegmentation]
  const oob = i.mgmtSeparation === 'dedicated_oob' ? 1 : 0
  return [
    { from: 'corp', to: 'mgmt', strength: ({ shared: 0, firewalled: 1, dedicated_oob: 3 } as const)[i.mgmtSeparation], takesLogins: i.mgmtSeparation !== 'dedicated_oob' },
    ...(['core', 'transport', 'access'] as const).map((to): Link => ({ from: 'mgmt', to, strength: cap3(seg), takesLogins: i.mgmtSegmentation !== 'per_asset' })),
    // Network devices have management interfaces that reach back into the management network.
    { from: 'transport', to: 'mgmt', strength: cap3(seg + oob) },
    { from: 'access', to: 'mgmt', strength: cap3(seg + oob + 1) },
    { from: 'transport', to: 'core', strength: 2 },
    { from: 'access', to: 'core', strength: 2 },
    { from: 'mgmt', to: 'li', strength: i.liIsolation === 'shared' ? 0 : 3, takesLogins: i.liIsolation === 'shared' },
    { from: 'core', to: 'li', strength: i.liIsolation === 'shared' ? 1 : 2 },
    { from: 'corp', to: 'site', strength: i.siteOt === 'on_corporate' ? 0 : 3 },
    { from: 'mgmt', to: 'site', strength: i.siteOt === 'on_management' ? 0 : i.siteOt === 'on_corporate' ? 1 : 2 },
    // Someone at the site could reach the radio and fixed equipment beside the site OT, unless it is segmented.
    { from: 'site', to: 'access', strength: i.siteOt === 'isolated' ? 3 : 2 },
  ]
}

/** How likely a phished or stolen staff login is to be an admin login that management accepts. */
export function staffAdminLogin(i: Inputs): Likelihood | null {
  if (i.privilegedAuth === 'phishing_resistant') return null
  const base: Likelihood = i.privilegedAuth === 'password' ? 'possible' : 'unlikely'
  return i.sharedAccounts ? up(base) : base
}

/** Spec: graded, not certain. Open or a big margin is likely; just beating filtering is possible; just beating a control is unlikely. */
export function crossLikelihood(capability: Capability, strength: Strength): Likelihood {
  if (strength === 0 || capability - strength >= 2) return 'likely'
  return strength === 1 ? 'possible' : 'unlikely'
}

interface Landing {
  ok: boolean
  likelihood: Likelihood
  zones: ZoneId[]
  reason: string
}

export function entry(i: Inputs, e: EntryId, cap: Capability): Landing {
  const T = entryText
  const fail = (reason: string): Landing => ({ ok: false, likelihood: 'unlikely', zones: [], reason })
  const land = (likelihood: Likelihood, zones: ZoneId[], reason: string): Landing => ({ ok: true, likelihood, zones, reason })
  switch (e) {
    case 'phished_staff':
      // Phishing-resistant sign-in makes a stolen password far less useful, though session theft remains possible.
      return i.privilegedAuth === 'phishing_resistant' ? land('possible', ['corp'], T.phishedResistant) : land('likely', ['corp'], T.phished)
    case 'vendor_access': {
      if (i.vendorCount === 0) return fail(T.noVendors)
      let l: Likelihood | null = ({ password: 'likely', mfa_app: 'possible', phishing_resistant: 'unlikely' } as const)[i.privilegedAuth]
      if (i.vendorAccess === 'on_request') l = l === 'unlikely' ? 'unlikely' : down(l)
      if (i.vendorAccess === 'brokered') l = i.privilegedAuth === 'phishing_resistant' ? null : 'unlikely'
      if (!l) return fail(T.vendorBlocked)
      if (i.vendorCount >= 11 && i.vendorAccess !== 'brokered') l = up(l)
      return land(l, ['mgmt'], T.vendor(i.vendorAccess, i.vendorCount))
    }
    case 'edge_exploit': {
      if (i.edgePatching === 'behind') return land('likely', ['transport'], T.edgeBehind)
      if (i.edgePatching === 'mostly') return land(cap >= 2 ? 'possible' : 'unlikely', ['transport'], T.edgeMostly)
      return cap === 3 ? land('unlikely', ['transport'], T.edgeCurrentNation) : fail(T.edgeCurrent)
    }
    case 'exposed_api': {
      const l = ({ unknown: 'likely', inventoried: 'possible', tested: 'unlikely' } as const)[i.apiExposure]
      return land(l, ['corp'], T.api[i.apiExposure])
    }
    case 'site_visit':
      return land(cap === 1 ? 'unlikely' : 'possible', ['site'], T.site)
  }
}

/** Does the attacker hold a login that this link accepts, and how likely is it to work? */
function loginAt(i: Inputs, e: EntryId, l: Link): { lik: Likelihood; why: string } | null {
  if (!l.takesLogins) return null
  if (l.from === 'corp') {
    const s = e === 'phished_staff' ? staffAdminLogin(i) : null
    return s ? { lik: s, why: i.sharedAccounts ? why.sharedLogin : why.adminLogin } : null
  }
  if (l.from === 'mgmt') {
    if (e === 'vendor_access' && i.vendorAccess !== 'brokered') return { lik: 'likely', why: why.vendorLogin }
    if (i.sharedAccounts) return { lik: 'likely', why: why.sharedLogin }
    const s = e === 'phished_staff' ? staffAdminLogin(i) : null
    return s ? { lik: s, why: why.adminLogin } : null
  }
  return null
}

function cross(i: Inputs, e: EntryId, cap: Capability, l: Link): { lik: Likelihood; why: string } | null {
  const opts: { lik: Likelihood; why: string }[] = []
  const login = loginAt(i, e, l)
  if (login) opts.push(login)
  if (cap > l.strength) opts.push({ lik: crossLikelihood(cap, l.strength), why: l.strength === 0 ? why.open : l.strength === 1 ? why.filtered : why.controlled })
  if (!opts.length) return null
  const best = opts.reduce((b, o) => (RANK[o.lik] > RANK[b.lik] ? o : b))
  // Commodity crews are after data and ransom; they rarely go deep into the core or lawful intercept.
  if (cap === 1 && (l.to === 'core' || l.to === 'li') && l.strength > 0 && best !== login) return { ...best, lik: weaker(best.lik, 'possible') }
  return best
}

export function bandOf(score: number): Band {
  return score <= 20 ? 'Contained' : score <= 60 ? 'Partly exposed' : 'Highly exposed'
}

export function exposure(z: Partial<Record<ZoneId, Likelihood>>): number {
  const sum = ASSETS.reduce((n, a) => n + (z[a.zone] ? a.criticality * LIKELIHOOD_WEIGHT[z[a.zone]!] : 0), 0)
  return Math.round((100 * sum) / TOTAL)
}

/** Most-likely-route search: a zone is only as likely as the weakest step on the best route to it. */
export function simulate(i: Inputs, e: EntryId, cap: Capability): SimResult {
  const land = entry(i, e, cap)
  const zl: Partial<Record<ZoneId, Likelihood>> = {}
  const via: Partial<Record<ZoneId, PathStep>> = {}
  const L = links(i)
  if (land.ok) {
    for (const z of land.zones) {
      zl[z] = land.likelihood
      via[z] = { kind: 'entry', to: z, reason: land.reason, likelihood: land.likelihood }
    }
    let changed = true
    while (changed) {
      changed = false
      for (const l of L) {
        const at = zl[l.from]
        if (!at) continue
        const c = cross(i, e, cap, l)
        if (!c) continue
        const lik = weaker(at, c.lik)
        if (!zl[l.to] || RANK[lik] > RANK[zl[l.to]!]) {
          zl[l.to] = lik
          via[l.to] = { kind: 'cross', from: l.from, to: l.to, likelihood: lik, reason: crossText(l.from, l.to, c.why, lik) }
          changed = true
        }
      }
    }
  }
  // Show the route in the order a reader would follow it: likelier, nearer steps first.
  const reached = ZONE_ORDER.filter((z) => zl[z])
  const depth = (z: ZoneId): number => (via[z]?.from ? 1 + depth(via[z]!.from!) : 0)
  const path = reached.map((z) => via[z]!).sort((a, b) => depth(a.to) - depth(b.to) || ZONE_ORDER.indexOf(a.to) - ZONE_ORDER.indexOf(b.to))
  const blocked: BlockedStep[] = []
  for (const l of L) {
    if (!zl[l.from] || zl[l.to] || blocked.some((b) => b.to === l.to)) continue
    blocked.push({ from: l.from, to: l.to, reason: blockText(l.from, l.to, blockWhy(i, l)) })
  }
  const score = exposure(zl)
  return {
    entry: e,
    capability: cap,
    entrySucceeded: land.ok,
    entryLikelihood: land.likelihood,
    entryReason: land.reason,
    entryZones: land.zones,
    zoneLikelihood: zl,
    path,
    blocked,
    exposureScore: score,
    band: bandOf(score),
  }
}

function blockWhy(i: Inputs, l: Link): string {
  if (l.from === 'corp' && l.to === 'mgmt' && i.mgmtSeparation === 'dedicated_oob') return why.oob
  if (l.to === 'li' && i.liIsolation === 'separate') return why.liSeparate
  if (l.to === 'site' && i.siteOt === 'isolated') return why.siteIsolated
  if (l.strength === 3) return why.blocked
  if (l.strength === 2) return why.controlledStop
  return why.filteredStop
}

export const ENTRY_ORDER: EntryId[] = ['phished_staff', 'vendor_access', 'edge_exploit', 'exposed_api', 'site_visit']

/** Every way in, and the worst of them. Ties go to the likelier way in. */
export function worstCase(i: Inputs, cap: Capability) {
  const runs = ENTRY_ORDER.map((e) => simulate(i, e, cap))
  const worst = runs.reduce((w, r) => (r.exposureScore > w.exposureScore || (r.exposureScore === w.exposureScore && RANK[r.entryLikelihood] > RANK[w.entryLikelihood]) ? r : w))
  return { runs, worst }
}

/** The likeliest reach of each zone across several runs. */
export function mergeZones(runs: SimResult[]): Partial<Record<ZoneId, Likelihood>> {
  const out: Partial<Record<ZoneId, Likelihood>> = {}
  for (const r of runs) for (const [z, l] of Object.entries(r.zoneLikelihood) as [ZoneId, Likelihood][]) if (!out[z] || RANK[l] > RANK[out[z]!]) out[z] = l
  return out
}
