import { describe, expect, it } from 'vitest'
import { contradictions, DEFAULT_INPUTS as D } from '../inputs.ts'
import { simulate, worstCase } from '../simulate.ts'
import { runScenario, SCENARIOS } from '../scenarios.ts'
import type { Capability, Inputs } from '../types.ts'

const purdue: Inputs = { ...D, architecture: 'purdue_dmz', itOtLink: 'via_dmz' }
const micro: Inputs = { ...D, architecture: 'microsegmented', itOtLink: 'via_dmz' }

describe('expert review changes', () => {
  it('1. attacker capability changes the result (commodity reaches less than targeted)', () => {
    const c = worstCase(purdue, 1).worst.exposureScore
    const t = worstCase(purdue, 2).worst.exposureScore
    expect(c).toBeLessThan(t)
  })

  it('2+3. on a Purdue site, a stolen VPN login lands in the DMZ, then rides the authorised remote access route', () => {
    const r = simulate(purdue, 'stolen_remote_cred', 1)
    expect(r.entryZones).toEqual(['L35'])
    const cross = r.path.find((p) => p.kind === 'cross' && p.from === 'L35' && p.to === 'L3')
    expect(cross?.reason).toMatch(/authorised/)
  })

  it('2. per-asset network segmentation still holds a stolen login to one asset in site operations', () => {
    const r = simulate(micro, 'stolen_remote_cred', 2)
    expect(r.reachedZones).toContain('L3')
    expect(r.reachedAssetIds.filter((a) => a.startsWith('L3-'))).toHaveLength(1)
    expect(r.l1Reached).toBe(false)
  })

  it('4. updates land where installed: the DMZ patch server on Purdue, site operations without a DMZ', () => {
    expect(simulate(purdue, 'poisoned_update', 1).entryZones).toEqual(['L4', 'L35'])
    expect(simulate(D, 'poisoned_update', 1).entryZones).toEqual(['L4', 'L3'])
  })

  it('4. NotPetya is kept out of operations on a Purdue site, but reaches operations on a VLAN site', () => {
    expect(runScenario(purdue, 'notpetya').succeeded).toBe(false)
    expect(runScenario(D, 'notpetya').succeeded).toBe(true)
  })

  it('5. a large vendor population gets past MFA even with personal, reviewed accounts', () => {
    const tidy: Inputs = { ...D, sharedAccounts: false, dormantAccounts: 'regularly' }
    expect(simulate({ ...tidy, vendorCount: 25 }, 'vendor_account', 2).entrySucceeded).toBe(true)
    expect(simulate({ ...tidy, vendorCount: 5 }, 'vendor_account', 2).entrySucceeded).toBe(false)
    expect(simulate({ ...tidy, vendorCount: 0 }, 'vendor_account', 2).entrySucceeded).toBe(false)
    // staff logins are not affected by the vendor population
    expect(simulate({ ...tidy, vendorCount: 25 }, 'stolen_remote_cred', 2).entrySucceeded).toBe(false)
  })

  it('6. Triton is stopped only with a dedicated safety zone and the key in run (Ronald rule)', () => {
    expect(runScenario({ ...D, sisKeySwitch: 'run' }, 'triton').outcome).not.toBe('stopped')
    const r = runScenario({ ...D, sisKeySwitch: 'run', sisZone: 'dedicated' }, 'triton')
    expect(r.outcome).toBe('stopped')
    expect(r.reason).toMatch(/key in run/)
    expect(runScenario({ ...D, sisKeySwitch: 'program' }, 'triton').outcome).toBe('succeeds')
    expect(worstCase({ ...D, sisKeySwitch: 'run' }).worst.sisLogicChangeable).toBe(false)
  })

  it('7. a claimed air gap with remote access is called out and scored as connected (rule C9)', () => {
    expect(contradictions({ ...D, itOtLink: 'airgap_claimed' }).join(' ')).toMatch(/not air-gapped/)
    expect(simulate({ ...D, itOtLink: 'airgap_claimed' }, 'stolen_remote_cred', 2).entrySucceeded).toBe(true)
    expect(contradictions({ ...D, itOtLink: 'airgap_claimed', remoteAccess: 'none' })).toEqual([])
  })

  it('8. steps to reach control tell the ways in apart', () => {
    const usb = simulate(D, 'infected_usb', 2).stepsToControl
    const phish = simulate(D, 'phished_login', 2).stepsToControl
    expect(usb).not.toBeNull()
    expect(phish).not.toBeNull()
    expect(usb!).toBeLessThan(phish!)
    expect(simulate(micro, 'phished_login', 2).stepsToControl).toBeNull()
  })

  it('9. every question changes some result (no dead inputs)', () => {
    const bases: Inputs[] = [
      D,
      purdue,
      micro,
      { ...D, architecture: 'flat' },
      { ...purdue, sisZone: 'dedicated' },
      { ...D, dormantAccounts: 'regularly' }, // shared logins are then the only way past MFA
      { ...D, sharedAccounts: false }, // old unreviewed accounts are then the only way past MFA
    ]
    const caps: Capability[] = [1, 2, 3]
    const alternatives: { [K in keyof Inputs]: Inputs[K][] } = {
      architecture: ['flat', 'vlans', 'purdue_dmz', 'microsegmented'],
      remoteAccess: ['vpn_password', 'vpn_mfa', 'jumpbox', 'zero_trust_biometric'],
      vendorCount: [0, 12, 30],
      sharedAccounts: [true, false],
      dormantAccounts: ['rarely', 'regularly'],
      legacy: ['none', 'some', 'many'],
      visibility: ['visible', 'cloaked'],
      removableMedia: ['uncontrolled', 'controlled'],
      sisZone: ['shared', 'dedicated'],
      itOtLink: ['direct', 'via_dmz', 'airgap_claimed'],
      sisKeySwitch: ['program', 'run'],
    }
    const fingerprint = (i: Inputs) =>
      JSON.stringify([
        ...caps.map((c) => worstCase(i, c).runs.map((r) => [r.exposureScore, r.entrySucceeded, r.sisLogicChangeable, r.stepsToControl])),
        SCENARIOS.map((s) => runScenario(i, s.id).succeeded),
      ])
    for (const key of Object.keys(alternatives) as (keyof Inputs)[]) {
      const changes = bases.some((b) => {
        const prints = new Set((alternatives[key] as Inputs[keyof Inputs][]).map((v) => fingerprint({ ...b, [key]: v } as Inputs)))
        return prints.size > 1
      })
      expect(changes, `input "${key}" never changes any result`).toBe(true)
    }
  })
})

describe('probabilistic wording', () => {
  it('every crossing, spread and stopping explanation is phrased as likely, not certain', () => {
    const sites: Inputs[] = [D, purdue, micro, { ...D, architecture: 'flat' }, { ...D, itOtLink: 'airgap_claimed' }]
    for (const i of sites)
      for (const r of worstCase(i, 2).runs) {
        r.path.filter((p) => p.kind !== 'entry').forEach((p) => expect(p.reason).toMatch(/^(Likely|Could|Unlikely)/))
        r.blocked.forEach((b) => expect(b.reason).toMatch(/^Likely/))
      }
  })
})

describe('graded likelihood', () => {
  const dedicated: Inputs = { ...purdue, sisZone: 'dedicated' }
  const cloaked: Inputs = { ...micro, visibility: 'cloaked' }

  it('a nation-state attacker is not an automatic 100 on segmented sites', () => {
    for (const i of [purdue, micro, dedicated, cloaked]) expect(worstCase(i, 3).worst.exposureScore).toBeLessThan(100)
  })

  it('beating a controlled conduit by one level is unlikely, but possible, and counted at reduced weight', () => {
    const r = worstCase(purdue, 3).worst
    const unlikely = Object.values(r.zoneLikelihood).filter((l) => l !== 'likely')
    expect(unlikely.length).toBeGreaterThan(0)
    // Weighted score is below the plain share of criticality reached.
    const total = r.site.assets.reduce((s, a) => s + a.criticality, 0)
    const plain = Math.round((r.site.assets.filter((a) => r.reachedAssetIds.includes(a.id)).reduce((s, a) => s + a.criticality, 0) / total) * 100)
    expect(r.exposureScore).toBeLessThan(plain)
  })

  it('an open, flat site is still likely to be fully reached', () => {
    const r = worstCase({ ...D, architecture: 'flat' }, 2).worst
    expect(Object.values(r.zoneLikelihood).every((l) => l === 'likely')).toBe(true)
  })

  it('more capable attackers are never less likely to reach a zone', () => {
    for (const i of [D, purdue, micro, dedicated]) {
      const a = worstCase(i, 2).worst.exposureScore
      const b = worstCase(i, 3).worst.exposureScore
      expect(b).toBeGreaterThanOrEqual(a)
    }
  })
})
