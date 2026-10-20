import type { Capability, EntryId, Inputs, Likelihood, ScenarioId, ScenarioResult, SimResult, ZoneId } from './types.ts'
import { simulate } from './simulate.ts'
import { rankOf } from './conduits.ts'
import { normalise } from './inputs.ts'
import { scenarioReason } from '../content/copy.ts'

export interface Scenario {
  id: ScenarioId
  name: string
  year: number
  entries: EntryId[]
  capability: Capability
  target: ZoneId | 'spread' | 'shutdown'
  targetLabel: string
  facts: string // verified facts only (spec section 8)
}

export const SCENARIOS: Scenario[] = [
  { id: 'stuxnet', name: 'Stuxnet', year: 2010, entries: ['infected_usb'], capability: 3, target: 'L1', targetLabel: 'Control (PLCs)',
    facts: 'Crossed an air gap on removable media; altered PLC logic while showing normal readings to operators.' },
  { id: 'ukraine2015', name: 'Ukraine power grid', year: 2015, entries: ['phished_login', 'stolen_remote_cred'], capability: 2, target: 'L2', targetLabel: 'Supervisory control (HMIs)',
    facts: 'Phishing, stolen VPN credentials, breakers opened remotely; around 225,000 customers lost power.' },
  { id: 'triton', name: 'Triton', year: 2017, entries: ['phished_login'], capability: 3, target: 'SIS', targetLabel: 'Safety systems',
    facts: 'First known malware built to target safety instrumented systems.' },
  { id: 'notpetya', name: 'NotPetya', year: 2017, entries: ['poisoned_update'], capability: 1, target: 'spread', targetLabel: 'Spread into operations',
    facts: "Spread through a software update; disrupted Maersk worldwide and Cadbury's Hobart factory." },
  { id: 'colonial', name: 'Colonial Pipeline', year: 2021, entries: ['stolen_remote_cred'], capability: 1, target: 'shutdown', targetLabel: 'Operational shutdown',
    facts: 'Leaked password on a legacy VPN account without MFA; pipeline shut down for days; US$4.4m ransom paid.' },
  { id: 'dpworld', name: 'DP World Australia', year: 2023, entries: ['phished_login'], capability: 2, target: 'shutdown', targetLabel: 'Operational shutdown',
    facts: 'Ports in Sydney, Melbourne, Brisbane and Fremantle paused for around three days; around 30,000 containers stranded.' },
]

/** Most likely any run gets into one of the zones. */
function bestLikelihood(runs: SimResult[], zones: ZoneId[]): Likelihood | undefined {
  let best: Likelihood | undefined
  for (const r of runs)
    for (const z of zones) {
      const l = r.zoneLikelihood[z]
      if (l && (!best || rankOf(l) > rankOf(best))) best = l
    }
  return best
}

const intertwined = (i: Inputs) => i.itOtLink === 'direct' || i.architecture === 'flat' || i.architecture === 'vlans'

/** Spec 8: replay a real attack against the visitor's layout. */
export function runScenario(rawInputs: Inputs, id: ScenarioId): ScenarioResult {
  const inputs = normalise(rawInputs)
  const sc = SCENARIOS.find((s) => s.id === id)!
  const runs = sc.entries.map((e) => simulate(inputs, e, sc.capability))
  const reachedZones = [...new Set(runs.flatMap((r) => r.reachedZones))]
  const reachedAssetIds = [...new Set(runs.flatMap((r) => r.reachedAssetIds))]
  const path = runs.flatMap((r) => r.path)
  const anyEntry = runs.some((r) => r.entrySucceeded)
  const base = { id, runs, reachedZones, reachedAssetIds, path }

  if (!anyEntry) return { ...base, succeeded: false, reason: runs.map((r) => r.entryReason).join(' ') }

  if (sc.target === 'shutdown') {
    return intertwined(inputs)
      ? { ...base, succeeded: true, likelihood: 'likely', reason: scenarioReason.intertwined }
      : { ...base, succeeded: false, reason: scenarioReason.separable }
  }

  if (sc.target === 'spread') {
    // NotPetya's damage to operations came from spreading out of IT into OT. Success = reaching operations.
    const OPS: ZoneId[] = ['L3', 'L2', 'L1', 'SIS']
    if (reachedZones.some((z) => OPS.includes(z))) return { ...base, succeeded: true, likelihood: bestLikelihood(runs, OPS), reason: scenarioReason.intoOps }
    const stoppedAt = runs.flatMap((r) => r.blocked).find((b) => OPS.includes(b.to))
    return {
      ...base,
      succeeded: false,
      reason: stoppedAt ? `${scenarioReason.keptOutOfOps} ${stoppedAt.reason}` : scenarioReason.keptOutOfOps,
      stoppedAt,
    }
  }

  if (sc.target === 'SIS' && reachedZones.includes('SIS') && inputs.sisKeySwitch === 'run') {
    return { ...base, succeeded: false, reason: scenarioReason.sisKeySwitch }
  }

  if (reachedZones.includes(sc.target)) return { ...base, succeeded: true, likelihood: bestLikelihood(runs, [sc.target]), reason: scenarioReason.reached(sc.target) }

  // Stopped: prefer the conduit into the target itself, otherwise the deepest blocked conduit.
  const allBlocked = runs.flatMap((r) => r.blocked).filter((b) => !reachedZones.includes(b.to))
  const order: ZoneId[] = ['L4', 'L35', 'L3', 'L2', 'L1', 'SIS']
  const stoppedAt =
    allBlocked.find((b) => b.to === sc.target) ?? [...allBlocked].sort((a, b) => order.indexOf(b.to) - order.indexOf(a.to))[0]
  const failedEntries = runs.filter((r) => !r.entrySucceeded).map((r) => r.entryReason)
  return {
    ...base,
    succeeded: false,
    stoppedAt,
    reason: stoppedAt ? stoppedAt.reason : failedEntries.join(' '),
  }
}
