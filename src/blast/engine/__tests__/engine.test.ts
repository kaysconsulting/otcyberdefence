import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS } from '../inputs.ts'
import { simulate, worstCase, ALL_ENTRIES } from '../simulate.ts'
import { runScenario, SCENARIOS } from '../scenarios.ts'
import { applyFixes } from '../fixes.ts'
import type { Inputs } from '../types.ts'

const D = DEFAULT_INPUTS
const purdue: Inputs = { ...D, architecture: 'purdue_dmz', itOtLink: 'via_dmz' }

describe('OT Blast Radius engine (spec section 13)', () => {
  it('worst case: flat network, password-only VPN is highly exposed and reaches safety systems', () => {
    const { worst } = worstCase({ ...D, architecture: 'flat', remoteAccess: 'vpn_password' })
    expect(worst.band).toBe('Highly exposed')
    expect(worst.sisReached).toBe(true)
  })

  it('Colonial Pipeline succeeds on defaults', () => {
    expect(runScenario(D, 'colonial').succeeded).toBe(true)
  })

  it('Colonial Pipeline is stopped by zero trust remote access plus overlay network segmentation', () => {
    const r = runScenario(applyFixes(D, ['fix_remote', 'fix_segment_overlay']), 'colonial')
    expect(r.succeeded).toBe(false)
    expect(r.reason.toLowerCase()).toContain('remote access')
  })

  it('Stuxnet still succeeds with a claimed air gap and uncontrolled USB', () => {
    expect(runScenario({ ...D, itOtLink: 'airgap_claimed', removableMedia: 'uncontrolled' }, 'stuxnet').succeeded).toBe(true)
  })

  it('Stuxnet is stopped with controlled media and cloaked devices', () => {
    expect(runScenario({ ...D, removableMedia: 'controlled', visibility: 'cloaked' }, 'stuxnet').succeeded).toBe(false)
  })

  it('Triton is stopped at the safety conduit with Purdue + dedicated SIS', () => {
    const r = runScenario({ ...purdue, sisZone: 'dedicated' }, 'triton')
    expect(r.succeeded).toBe(false)
    expect(r.stoppedAt?.to).toBe('SIS')
  })

  it('zero trust remote access: a stolen remote credential fails', () => {
    const r = simulate({ ...D, remoteAccess: 'zero_trust_biometric' }, 'stolen_remote_cred', 2)
    expect(r.entrySucceeded).toBe(false)
    expect(r.reachedZones).toEqual([])
  })

  it('is deterministic', () => {
    const inputs: Inputs = { ...D, legacy: 'many', visibility: 'cloaked' }
    expect(JSON.stringify(worstCase(inputs))).toBe(JSON.stringify(worstCase(inputs)))
    for (const s of SCENARIOS) expect(JSON.stringify(runScenario(inputs, s.id))).toBe(JSON.stringify(runScenario(inputs, s.id)))
  })

  it('explains every step', () => {
    const variants: Inputs[] = [
      D,
      purdue,
      { ...D, architecture: 'flat' },
      { ...D, architecture: 'microsegmented', itOtLink: 'via_dmz', visibility: 'cloaked', sisZone: 'dedicated' },
      { ...D, itOtLink: 'airgap_claimed', remoteAccess: 'jumpbox' },
    ]
    for (const v of variants) {
      for (const e of ALL_ENTRIES) {
        for (const cap of [1, 2, 3] as const) {
          const r = simulate(v, e, cap)
          expect(r.entryReason.length).toBeGreaterThan(0)
          r.path.forEach((p) => expect(p.reason.length).toBeGreaterThan(0))
          r.blocked.forEach((b) => expect(b.reason.length).toBeGreaterThan(0))
        }
      }
      for (const s of SCENARIOS) expect(runScenario(v, s.id).reason.length).toBeGreaterThan(0)
    }
  })
})

describe('extra checks', () => {
  it('flat network forces a direct IT/OT link', () => {
    const r = simulate({ ...D, architecture: 'flat', itOtLink: 'via_dmz' }, 'phished_login', 2)
    expect(r.reachedZones).toContain('L3')
  })

  it('per-asset network segmentation contains a phished login', () => {
    const { worst } = worstCase(applyFixes(D, ['fix_segment_overlay', 'fix_remote', 'fix_media', 'fix_cloak', 'fix_accounts']))
    expect(worst.band).toBe('Contained')
    expect(worst.sisReached).toBe(false)
  })

  it('copy never names the technology partner or offers a demo', async () => {
    const copy = JSON.stringify(await import('../../content/copy.ts'))
    expect(copy.toLowerCase()).not.toMatch(/blastwave|blastshield|\bdemo\b/)
    expect(copy).not.toMatch(/—/)
  })
})
