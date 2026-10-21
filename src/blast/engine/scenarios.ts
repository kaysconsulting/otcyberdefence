import type { Capability, EntryId, Inputs, ScenarioId, ScenarioOutcome, ScenarioResult, SimResult, ZoneId } from './types.ts'
import { simulate } from './simulate.ts'
import { normalise } from './inputs.ts'
import { hasDmz } from './site.ts'
import { scenarioText } from '../content/copy.ts'

export interface Scenario {
  id: ScenarioId
  name: string
  year: string
  /** The ways in replayed on the diagram. */
  entries: EntryId[]
  capability: Capability
  target: ZoneId | 'spread' | 'shutdown'
  targetLabel: string
  facts: string // verified facts only (spec section 8), checked against `source`
  australian?: boolean
  /** Shown when OT was not reached but operations still stopped. */
  opsNote?: boolean
  source: { label: string; url: string }
}

/** Date the attack facts and sources were last checked. */
export const LAST_REVIEWED = '21 October 2026'

// Australian incidents first, then by year.
export const SCENARIOS: Scenario[] = [
  { id: 'maroochy', name: 'Maroochy Shire, Queensland', year: '2000', entries: ['vendor_account'], capability: 2, target: 'L1', targetLabel: 'Control (pumping stations)', australian: true,
    facts: 'An attacker used radio access and engineering software to send false commands to sewage pumping stations, spilling about 800,000 litres of raw sewage.',
    source: { label: 'MITRE ATT&CK, Campaign C0020', url: 'https://attack.mitre.org/campaigns/C0020/' } },
  { id: 'notpetya', name: 'NotPetya, including Cadbury Hobart', year: '2017', entries: ['poisoned_update'], capability: 2, target: 'spread', targetLabel: 'Spread into operations', australian: true,
    facts: "Spread through a trusted software update; disrupted Maersk worldwide and halted Cadbury's factory in Claremont, Tasmania.",
    source: { label: 'ABC News, 29 June 2017', url: 'https://www.abc.net.au/news/2017-06-29/authorities-investigate-cyber-attack-as-businesses-recover/8661572' } },
  { id: 'dpworld', name: 'DP World Australia', year: '2023', entries: ['phished_login'], capability: 2, target: 'shutdown', targetLabel: 'Operational shutdown', australian: true, opsNote: true,
    facts: 'A cyberattack paused ports in Sydney, Melbourne, Brisbane and Fremantle for around three days while systems were disconnected; around 30,000 containers were stranded.',
    source: { label: 'gCaptain (Bloomberg), 13 November 2023', url: 'https://gcaptain.com/australia-cyberattack-leaves-30000-containers-stuck-at-ports/' } },
  { id: 'stuxnet', name: 'Stuxnet', year: '2010', entries: ['infected_usb'], capability: 3, target: 'L1', targetLabel: 'Control (PLCs)',
    facts: 'Spread on removable media to cross an air gap; altered PLC logic while showing normal readings to operators.',
    source: { label: 'MITRE ATT&CK, Software S0603', url: 'https://attack.mitre.org/software/S0603/' } },
  { id: 'ukraine2015', name: 'Ukraine power grid', year: '2015', entries: ['stolen_remote_cred'], capability: 2, target: 'L2', targetLabel: 'Supervisory control (HMIs)',
    facts: 'Phishing, then stolen credentials used over VPN; breakers opened remotely and around 225,000 customers lost power.',
    source: { label: 'CISA alert IR-ALERT-H-16-056-01', url: 'https://www.cisa.gov/news-events/ics-alerts/ir-alert-h-16-056-01' } },
  { id: 'triton', name: 'Triton', year: '2017', entries: ['phished_login'], capability: 3, target: 'SIS', targetLabel: 'Safety systems',
    facts: 'Malware built to target safety instrumented system controllers. Investigators advise not leaving safety controller keys in program mode.',
    source: { label: 'Mandiant (Google Cloud), 14 December 2017', url: 'https://cloud.google.com/blog/topics/threat-intelligence/attackers-deploy-new-ics-attack-framework-triton' } },
  { id: 'colonial', name: 'Colonial Pipeline', year: '2021', entries: ['stolen_remote_cred'], capability: 1, target: 'shutdown', targetLabel: 'Operational shutdown', opsNote: true,
    facts: 'A leaked password on a legacy VPN account without MFA let ransomware into IT. The pipeline was shut down as a precaution and a US$4.4m ransom was paid.',
    source: { label: 'Cybersecurity Dive, 9 June 2021', url: 'https://www.cybersecuritydive.com/news/colonial-Joseph-Blount-ransomware-legacy-vpn/601523/' } },
  { id: 'frostygoop', name: 'FrostyGoop, Lviv', year: '2024', entries: ['phished_login'], capability: 2, target: 'L1', targetLabel: 'Control (heating controllers)',
    facts: 'Attackers got in through an internet-exposed router, moved across a poorly segmented network and sent Modbus commands to heating controllers. Over 600 apartment buildings lost heating for almost two days.',
    source: { label: 'BleepingComputer, 23 July 2024', url: 'https://www.bleepingcomputer.com/news/security/frostygoop-malware-attack-cut-off-heat-in-ukraine-during-winter/' } },
  { id: 'cyberav3ngers', name: 'CyberAv3ngers, water utilities', year: '2023 to 2024', entries: ['stolen_remote_cred'], capability: 1, target: 'L1', targetLabel: 'Control (PLCs)',
    facts: 'Actors logged in to internet-facing PLCs that used default or no passwords. At least 75 devices were compromised, including at least 34 in US water and wastewater.',
    source: { label: 'CISA advisory AA23-335A', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-335a' } },
]

type Rule = { succeeds: boolean; stopped: boolean }

/** Ronald's replay rules: each attack has its own conditions, so the outcome follows the visitor's answers. */
function rule(id: ScenarioId, n: Inputs, runs: SimResult[]): Rule {
  const flatOrVlans = n.architecture === 'flat' || n.architecture === 'vlans'
  const micro = n.architecture === 'microsegmented'
  const direct = n.itOtLink === 'direct'
  const dmz = hasDmz(n) && !direct
  const trueAirgap = n.itOtLink === 'airgap_claimed'
  const visible = n.visibility === 'visible'
  const cloaked = !visible
  const usbOpen = n.removableMedia === 'uncontrolled'
  const noPasswords = n.remoteAccess === 'zero_trust_biometric' || n.remoteAccess === 'none'
  const shared = n.sharedAccounts
  const rarely = n.dormantAccounts === 'rarely'
  const controlReached = runs.some((r) => r.zoneLikelihood.L1 && r.zoneLikelihood.L1 !== 'unlikely')
  switch (id) {
    case 'stuxnet':
      return { succeeds: usbOpen && (flatOrVlans || trueAirgap), stopped: !usbOpen || (micro && cloaked) }
    case 'ukraine2015':
      return { succeeds: n.remoteAccess === 'vpn_password' && (shared || visible), stopped: n.remoteAccess === 'none' || (noPasswords && !shared) }
    case 'triton':
      return { succeeds: (n.sisZone === 'shared' || n.sisKeySwitch === 'program') && controlReached, stopped: n.sisZone === 'dedicated' && n.sisKeySwitch === 'run' }
    case 'notpetya':
      return { succeeds: flatOrVlans || direct, stopped: micro || dmz }
    case 'colonial':
      return { succeeds: n.remoteAccess === 'vpn_password' || rarely, stopped: noPasswords && !rarely && dmz }
    case 'dpworld':
      return { succeeds: direct || flatOrVlans, stopped: dmz && micro }
    case 'maroochy':
      return { succeeds: rarely && visible, stopped: !rarely && (cloaked || micro) }
    case 'frostygoop':
      return { succeeds: flatOrVlans && visible, stopped: micro || (n.architecture === 'purdue_dmz' && cloaked) }
    case 'cyberav3ngers':
      return { succeeds: visible && (shared || rarely), stopped: cloaked || (noPasswords && !shared) }
  }
}

/** Spec 8, with Ronald's rules: replay a real attack against the visitor's layout. Three outcomes. */
export function runScenario(rawInputs: Inputs, id: ScenarioId): ScenarioResult {
  const inputs = normalise(rawInputs)
  const sc = SCENARIOS.find((s) => s.id === id)!
  const runs = sc.entries.map((e) => simulate(inputs, e, sc.capability))
  const reachedZones = [...new Set(runs.flatMap((r) => r.reachedZones))]
  const reachedAssetIds = [...new Set(runs.flatMap((r) => r.reachedAssetIds))]
  const path = runs.flatMap((r) => r.path)
  const base = { id, runs, reachedZones, reachedAssetIds, path }

  const r = rule(id, inputs, runs)
  // When both sets of conditions are met, the honest answer sits in between.
  const outcome: ScenarioOutcome = r.succeeds && !r.stopped ? 'succeeds' : r.stopped && !r.succeeds ? 'stopped' : 'partly'
  const T = scenarioText[id]
  if (outcome === 'succeeds') return { ...base, outcome, succeeded: true, reason: T.succeeds }
  if (outcome === 'stopped') {
    const stoppedAt = runs.flatMap((x) => x.blocked).find((b) => !reachedZones.includes(b.to))
    return { ...base, outcome, succeeded: false, reason: T.stopped, stoppedAt }
  }
  // Partly: the attacker likely gets in, and the replay shows where they are likely stopped.
  const order: ZoneId[] = ['L4', 'L35', 'L3', 'L2', 'L1', 'SIS']
  const blocked = runs.flatMap((x) => x.blocked).filter((b) => !reachedZones.includes(b.to))
  const stoppedAt = [...blocked].sort((a, b) => order.indexOf(b.to) - order.indexOf(a.to))[0]
  return { ...base, outcome, succeeded: false, reason: T.partly, stoppedAt }
}
