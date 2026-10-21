// Ronald's answer logic and content spec (20 October 2026): issues, combination rules C1 to C11 and replay rules.
import { describe, expect, it } from 'vitest'
import { contradictions, DEFAULT_INPUTS as D, normalise, RISKIER } from '../inputs.ts'
import { simulate, worstCase } from '../simulate.ts'
import { runScenario } from '../scenarios.ts'
import { applyFixes, FIX_ORDER } from '../fixes.ts'
import { bandFor } from '../score.ts'
import type { Inputs, ScenarioId } from '../types.ts'

const purdue: Inputs = { ...D, architecture: 'purdue_dmz', itOtLink: 'via_dmz' }
const lik = (i: Inputs, cap: 1 | 2 | 3 = 1) => worstCase(i, cap).worst

describe('logic issues found in testing', () => {
  it('1. zero trust does not shield a flat network from a phished IT login (C1, C4)', () => {
    const i: Inputs = { ...D, architecture: 'flat', itOtLink: 'direct', remoteAccess: 'zero_trust_biometric', legacy: 'many', sisKeySwitch: 'program' }
    const w = lik(i)
    expect(w.exposureScore).toBeGreaterThanOrEqual(90)
    expect(w.band).toBe('Highly exposed')
    const phished = simulate(i, 'phished_login', 1)
    expect(phished.zoneLikelihood.L1).toBe('likely')
    expect(phished.zoneLikelihood.SIS).toBe('likely')
  })

  it('2. the Stuxnet path: USB to the engineering workstation, control likely, safety possibly (C2)', () => {
    const r = simulate({ ...purdue, itOtLink: 'airgap_claimed', legacy: 'some', removableMedia: 'uncontrolled' }, 'infected_usb', 1)
    expect(r.zoneLikelihood.L1).toBe('likely')
    expect(r.zoneLikelihood.SIS).toBe('possible')
    expect(r.exposureScore).toBeGreaterThanOrEqual(55)
    expect(r.exposureScore).toBeLessThanOrEqual(70)
  })

  it('3. the Ukraine 2015 path: stolen VPN login plus shared logins, supervisory likely, control possibly (C3)', () => {
    const r = simulate({ ...purdue, remoteAccess: 'vpn_password', sharedAccounts: true, dormantAccounts: 'rarely' }, 'stolen_remote_cred', 1)
    expect(r.zoneLikelihood.L2).toBe('likely')
    expect(r.zoneLikelihood.L1).toBe('possible')
  })
})

describe('combination rules', () => {
  it('C1. zero trust removes only the remote and vendor ways in', () => {
    const zt = { ...D, remoteAccess: 'zero_trust_biometric' as const }
    expect(simulate(zt, 'stolen_remote_cred', 2).entrySucceeded).toBe(false)
    expect(simulate(zt, 'vendor_account', 2).entrySucceeded).toBe(false)
    for (const e of ['phished_login', 'infected_usb', 'poisoned_update'] as const)
      expect(simulate(zt, e, 2).exposureScore).toBe(simulate(D, e, 2).exposureScore)
  })

  it('C4. a flat network never scores below 70', () => {
    expect(lik(applyFixes({ ...D, architecture: 'flat' }, ['fix_remote', 'fix_media', 'fix_accounts', 'fix_keyswitch', 'fix_cloak'])).exposureScore).toBeGreaterThanOrEqual(70)
  })

  it('C5. safety is likely safe only with all three protections; two cap it at possible', () => {
    const all3: Inputs = { ...purdue, sisZone: 'dedicated', sisKeySwitch: 'run', visibility: 'cloaked' }
    for (const c of [1, 2, 3] as const) expect(worstCase(all3, c).worst.zoneLikelihood.SIS).toBeUndefined()
    const two: Inputs = { ...D, architecture: 'flat', sisZone: 'dedicated', sisKeySwitch: 'run' }
    for (const r of worstCase(two, 3).runs) expect(r.zoneLikelihood.SIS ?? 'possible').not.toBe('likely')
  })

  it('C6. cloaking cuts reconnaissance but not the engineering workstation’s own traffic', () => {
    const r = simulate({ ...purdue, visibility: 'cloaked' }, 'infected_usb', 2)
    expect(r.zoneLikelihood.L1).toBe('likely')
    expect(lik({ ...D, visibility: 'cloaked' }, 2).exposureScore).toBeLessThan(lik(D, 2).exposureScore)
  })

  it('C7. many unpatchable devices widen reach on VLANs', () => {
    expect(lik({ ...D, legacy: 'many' }).exposureScore).toBeGreaterThan(lik({ ...D, legacy: 'none' }).exposureScore)
  })

  it('C8. labels follow the final score', () => {
    expect([bandFor(20), bandFor(21), bandFor(60), bandFor(61)]).toEqual(['Contained', 'Partly exposed', 'Partly exposed', 'Highly exposed'])
  })

  it('C9. contradictory answers are flagged and scored as the riskier reading', () => {
    expect(normalise({ ...D, itOtLink: 'airgap_claimed' }).itOtLink).toBe('via_dmz')
    expect(normalise({ ...D, itOtLink: 'airgap_claimed', remoteAccess: 'none' }).itOtLink).toBe('airgap_claimed')
    expect(normalise({ ...purdue, itOtLink: 'direct' }).architecture).toBe('vlans')
    expect(contradictions({ ...purdue, itOtLink: 'direct' })).toHaveLength(1)
    expect(contradictions(D)).toEqual([])
  })

  it('C10. attacker type changes more than one point, and a nation-state is never below 10', () => {
    const hardened = applyFixes(D, FIX_ORDER)
    expect(lik(hardened, 3).exposureScore).toBeGreaterThanOrEqual(10)
    expect(lik(D, 1).exposureScore).toBeLessThan(lik(D, 3).exposureScore)
    // Commodity crews give up on cloaked paths.
    expect(simulate({ ...purdue, visibility: 'cloaked', sharedAccounts: false }, 'phished_login', 1).zoneLikelihood.L2).toBeUndefined()
  })

  it('C11. "Not sure" is scored as the riskier answer', () => {
    for (const k of Object.keys(D) as (keyof Inputs)[]) {
      const sure = lik({ ...D, [k]: D[k] } as Inputs, 2).exposureScore
      const unsure = lik({ ...D, [k]: RISKIER[k] } as Inputs, 2).exposureScore
      expect(unsure).toBeGreaterThanOrEqual(sure)
    }
  })
})

describe('attack replay rules (three outcomes)', () => {
  const out = (i: Inputs, id: ScenarioId) => runScenario(i, id).outcome
  const hardened = applyFixes(D, FIX_ORDER)

  it('every attack likely succeeds on the defaults, apart from those that need a password-only VPN', () => {
    for (const id of ['stuxnet', 'triton', 'notpetya', 'colonial', 'dpworld', 'maroochy', 'frostygoop', 'cyberav3ngers'] as ScenarioId[]) expect(out(D, id)).toBe('succeeds')
    expect(out(D, 'ukraine2015')).toBe('partly') // VPN with MFA gives partly succeeds
    expect(out({ ...D, remoteAccess: 'vpn_password' }, 'ukraine2015')).toBe('succeeds')
  })

  it('every attack is likely stopped on a fully hardened site', () => {
    for (const id of ['stuxnet', 'ukraine2015', 'triton', 'notpetya', 'colonial', 'dpworld', 'maroochy', 'frostygoop', 'cyberav3ngers'] as ScenarioId[])
      expect(out(hardened, id)).toBe('stopped')
  })

  it('Stuxnet: stopped by controlled USB; partly on a Purdue site without a true air gap', () => {
    expect(out({ ...D, removableMedia: 'controlled' }, 'stuxnet')).toBe('stopped')
    expect(out(purdue, 'stuxnet')).toBe('partly')
    expect(out({ ...purdue, itOtLink: 'airgap_claimed', remoteAccess: 'none' }, 'stuxnet')).toBe('succeeds')
  })

  it('NotPetya: stopped by a DMZ that stages updates, succeeds on VLANs', () => {
    expect(out(purdue, 'notpetya')).toBe('stopped')
    expect(out(D, 'notpetya')).toBe('succeeds')
  })

  it('Colonial and DP World explain that OT was not reported as reached', () => {
    expect(runScenario(D, 'colonial').reason).toMatch(/OT was not reported as reached/)
    expect(runScenario(D, 'dpworld').reason).toMatch(/OT was not reported as reached/)
  })

  it('new case studies respond to their own answers', () => {
    expect(out({ ...D, dormantAccounts: 'regularly', visibility: 'cloaked' }, 'maroochy')).toBe('stopped')
    expect(out({ ...D, architecture: 'microsegmented', itOtLink: 'via_dmz' }, 'frostygoop')).toBe('stopped')
    expect(out({ ...D, visibility: 'cloaked' }, 'cyberav3ngers')).toBe('stopped')
  })
})
