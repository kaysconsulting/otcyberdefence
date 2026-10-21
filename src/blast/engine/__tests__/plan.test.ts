import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS as D } from '../inputs.ts'
import { worstCase } from '../simulate.ts'
import { applyFixes, fixApplies, FIX_ORDER } from '../fixes.ts'
import { AREA_ENTRIES, AREA_ORDER, areaBreakdown, planPhases, progress } from '../areas.ts'
import type { Inputs } from '../types.ts'

const purdue: Inputs = { ...D, architecture: 'purdue_dmz', itOtLink: 'via_dmz' }

describe('three areas', () => {
  it('every way in belongs to exactly one area', () => {
    const all = AREA_ORDER.flatMap((a) => AREA_ENTRIES[a]).sort()
    expect(all).toEqual(['infected_usb', 'phished_login', 'poisoned_update', 'stolen_remote_cred', 'vendor_account'])
  })

  it('the whole-site worst case is the worst of the three areas', () => {
    for (const i of [D, purdue]) {
      const areas = areaBreakdown(i, 2)
      expect(Math.max(...areas.map((a) => a.score))).toBe(worstCase(i, 2).worst.exposureScore)
    }
  })

  it('areas differ on a Purdue site, so a team can see where to start', () => {
    const scores = areaBreakdown(purdue, 2).map((a) => a.score)
    expect(new Set(scores).size).toBeGreaterThan(1)
  })

  it('findings list issues before strengths, and a fully fixed area shows strengths only', () => {
    const fixed = applyFixes(D, FIX_ORDER)
    for (const a of areaBreakdown(fixed, 2)) expect(a.findings.filter((f) => !f.good).length).toBeLessThanOrEqual(1) // legacy devices remain
  })
})

describe('plan step by step', () => {
  it('starts by knowing the site and ends by keeping it working', () => {
    const ids = planPhases(D, 2).map((p) => p.id)
    expect(ids[0]).toBe('know')
    expect(ids[1]).toBe('quick')
    expect(ids.at(-1)).toBe('keep')
  })

  it('on a VLAN site, network segmentation comes before remote access (remote alone does not lower the worst case)', () => {
    expect(planPhases(D, 2).map((p) => p.id).indexOf('segment')).toBeLessThan(planPhases(D, 2).map((p) => p.id).indexOf('remote'))
  })

  it('likely score never goes up as phases are completed', () => {
    for (const i of [D, purdue]) {
      const prog = progress(i, 2, planPhases(i, 2), FIX_ORDER)
      prog.reduce((prev, x) => (expect(x.score).toBeLessThanOrEqual(prev), x.score), worstCase(i, 2).worst.exposureScore)
    }
  })

  it('steps already in place are recognised', () => {
    expect(fixApplies({ ...D, remoteAccess: 'zero_trust_biometric' }, 'fix_remote')).toBe(false)
    expect(fixApplies({ ...D, architecture: 'microsegmented', itOtLink: 'via_dmz' }, 'fix_itot_dmz')).toBe(false)
    expect(fixApplies(D, 'fix_itot_dmz')).toBe(true)
  })

  it('an industrial DMZ on a VLAN site lowers the likely worst case', () => {
    expect(worstCase(applyFixes(D, ['fix_itot_dmz']), 2).worst.exposureScore).toBeLessThan(worstCase(D, 2).worst.exposureScore)
  })
})
