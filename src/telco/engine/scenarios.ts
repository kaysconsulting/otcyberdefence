import type { Capability, EntryId, Inputs, Likelihood, ScenarioId, ScenarioOutcome, SimResult, ZoneId } from './types.ts'
import { simulate } from './model.ts'

export interface Scenario {
  id: ScenarioId
  name: string
  year: string
  entry: EntryId
  capability: Capability
  target: ZoneId
  targetLabel: string
  /** Verified facts only, checked against `source`. */
  facts: string
  /** Said when the way in has not been made public. */
  entryNote?: string
  australian?: boolean
  /** Quiet, living-off-the-land tradecraft: harder to notice than ordinary malware. */
  stealthy?: boolean
  source: { label: string; url: string }
}

/** Date the attack facts and sources were last checked. */
export const LAST_REVIEWED = '28 October 2026'

// Australian incidents first, then by year.
export const SCENARIOS: Scenario[] = [
  {
    id: 'optus2022', name: 'Optus data breach', year: '2022', entry: 'exposed_api', capability: 1, target: 'corp', targetLabel: 'Customer data', australian: true,
    facts: 'Personal information of more than 9.5 million current and former customers was potentially exposed between 17 and 20 September 2022. The ACMA and the Information Commissioner have both taken Federal Court action, alleging Optus failed to protect customer information.',
    source: { label: 'ACMA statement on 2022 Optus data breach', url: 'https://www.acma.gov.au/acma-statement-2022-optus-data-breach' },
  },
  {
    id: 'iinet2025', name: 'iiNet order system breach', year: '2025', entry: 'phished_staff', capability: 1, target: 'corp', targetLabel: 'Order management system', australian: true,
    facts: "TPG Telecom said one employee's stolen login was used to get into the iiNet order management system. About 280,000 active email addresses and about 20,000 landline numbers were taken, with smaller numbers of addresses and modem setup passwords.",
    source: { label: 'iTWire, August 2025', url: 'https://itwire.com/business-it-news/business-technology/tpg-data-breach-hits-280,000-iinet-customers' },
  },
  {
    id: 'kyivstar', name: 'Kyivstar, Ukraine', year: '2023', entry: 'phished_staff', capability: 3, target: 'core', targetLabel: 'Core network',
    facts: "Ukraine's security service says the attackers were inside from at least May 2023. On 12 December they destroyed thousands of virtual servers and PCs, and around 24 million users lost mobile and internet service.",
    entryNote: 'How they first got in has not been made public, so the replay starts from a stolen staff login.',
    source: { label: 'CyberScoop, January 2024', url: 'https://cyberscoop.com/russia-ukraine-kyivstar-vitiuk/' },
  },
  {
    id: 'salttyphoon', name: 'Salt Typhoon', year: '2021 to 2025', entry: 'edge_exploit', capability: 3, target: 'transport', targetLabel: 'Core and edge routers', stealthy: true,
    facts: 'A joint advisory from US and international agencies describes a state-sponsored campaign against telecommunications providers that compromised backbone and edge routers. It mostly used known, unpatched vulnerabilities rather than new ones.',
    source: { label: 'CISA advisory AA25-239A', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-239a' },
  },
  {
    id: 'volttyphoon', name: 'Volt Typhoon', year: '2024', entry: 'edge_exploit', capability: 3, target: 'site', targetLabel: 'Operational technology', stealthy: true,
    facts: 'Agencies including the ASD assessed that state-sponsored actors were pre-positioning in critical infrastructure, mainly communications, energy, transport and water, to disrupt it in a crisis. Some footholds had been in place for at least five years.',
    source: { label: 'ASD advisory, 8 February 2024', url: 'https://www.cyber.gov.au/about-us/view-all-content/alerts-and-advisories/prc-state-sponsored-actors-compromise-and-maintain-persistent-access-us-critical-infrastructure' },
  },
]

export interface ScenarioResult {
  id: ScenarioId
  outcome: ScenarioOutcome
  run: SimResult
  /** How likely the target is to be reached (absent = not reached). */
  targetLikelihood?: Likelihood
}

/** Replay the attack's way in and attacker against this network; the outcome follows the target zone. */
export function runScenario(i: Inputs, id: ScenarioId): ScenarioResult {
  const sc = SCENARIOS.find((s) => s.id === id)!
  const run = simulate(i, sc.entry, sc.capability)
  const t = run.zoneLikelihood[sc.target]
  const outcome: ScenarioOutcome =
    t === 'likely' ? 'succeeds' : t === 'possible' ? 'partly' : run.entrySucceeded && run.entryLikelihood !== 'unlikely' ? 'partly' : 'stopped'
  return { id, outcome, run, targetLikelihood: t }
}

export type Detection = 'hours' | 'days' | 'late'

/** Would the team notice? Quiet tradecraft takes one level longer to spot. */
export function detection(i: Inputs, sc: Scenario): Detection {
  const base: Detection = i.logging === 'monitored' ? 'hours' : i.logging === 'central' ? 'days' : 'late'
  if (!sc.stealthy) return base
  return base === 'hours' ? 'days' : 'late'
}
