import { describe, expect, it } from 'vitest'
import { simulate, worstCase } from '../model.ts'
import { DEFAULT_INPUTS, RISKIER, effective } from '../inputs.ts'
import { applyFixes, FIX_ORDER, rankFixes, progress } from '../fixes.ts'
import { runScenario, SCENARIOS } from '../scenarios.ts'
import { obligations, readyCount } from '../obligations.ts'
import * as C from '../../content/copy.ts'
import type { Capability, Inputs } from '../types.ts'

const BEST = applyFixes(DEFAULT_INPUTS, FIX_ORDER)
const caps: Capability[] = [1, 2, 3]

describe('telco engine', () => {
  it('a typical carrier is highly exposed, the riskiest network more so', () => {
    const typical = worstCase(DEFAULT_INPUTS, 2).worst
    expect(typical.band).toBe('Highly exposed')
    expect(worstCase(RISKIER, 2).worst.exposureScore).toBeGreaterThanOrEqual(typical.exposureScore)
  })

  it('every fix applied keeps any attacker contained', () => {
    for (const c of caps) expect(worstCase(BEST, c).worst.band).toBe('Contained')
  })

  it('a nation-state is never scored below a criminal gang', () => {
    for (const i of [DEFAULT_INPUTS, RISKIER, BEST]) expect(worstCase(i, 3).worst.exposureScore).toBeGreaterThanOrEqual(worstCase(i, 1).worst.exposureScore)
  })

  it('out-of-band management stops a phished login reaching management', () => {
    const r = simulate({ ...DEFAULT_INPUTS, mgmtSeparation: 'dedicated_oob' }, 'phished_staff', 2)
    expect(r.zoneLikelihood.mgmt).toBeUndefined()
    expect(r.blocked.some((b) => b.to === 'mgmt')).toBe(true)
  })

  it('shared management lets a phished login reach the core', () => {
    const r = simulate({ ...DEFAULT_INPUTS, mgmtSeparation: 'shared' }, 'phished_staff', 1)
    expect(r.zoneLikelihood.mgmt).toBe('likely')
    expect(r.zoneLikelihood.core).toBeDefined()
  })

  it('no vendors means no vendor way in; brokered phishing-resistant vendor access fails', () => {
    expect(simulate({ ...DEFAULT_INPUTS, vendorCount: 0 }, 'vendor_access', 3).entrySucceeded).toBe(false)
    expect(simulate({ ...DEFAULT_INPUTS, vendorAccess: 'brokered', privilegedAuth: 'phishing_resistant' }, 'vendor_access', 3).entrySucceeded).toBe(false)
  })

  it('isolating lawful intercept and site OT keeps them out of reach on a flat network', () => {
    const i: Inputs = { ...RISKIER, liIsolation: 'separate', siteOt: 'isolated' }
    const r = simulate(i, 'vendor_access', 1)
    expect(r.zoneLikelihood.li).toBeUndefined()
    expect(r.zoneLikelihood.site).toBeUndefined()
  })

  it('patched edge devices stop all but a nation-state', () => {
    const i = { ...DEFAULT_INPUTS, edgePatching: 'current' as const }
    expect(simulate(i, 'edge_exploit', 2).entrySucceeded).toBe(false)
    expect(simulate(i, 'edge_exploit', 3).entryLikelihood).toBe('unlikely')
  })

  it('"Not sure" is scored as the riskier answer', () => {
    expect(effective(DEFAULT_INPUTS, ['edgePatching']).edgePatching).toBe('behind')
  })

  it('fixes rank by drop and progress never goes up', () => {
    const ranked = rankFixes(DEFAULT_INPUTS, 2)
    expect(ranked.length).toBeGreaterThan(0)
    for (let k = 1; k < ranked.length; k++) expect(ranked[k].drop).toBeLessThanOrEqual(ranked[k - 1].drop)
    const p = progress(DEFAULT_INPUTS, 2, FIX_ORDER)
    for (let k = 1; k < p.length; k++) expect(p[k].score).toBeLessThanOrEqual(p[k - 1].score)
  })
})

describe('replays', () => {
  it('every attack likely succeeds on the riskiest network and is not a success with everything fixed', () => {
    for (const s of SCENARIOS) {
      expect(runScenario(RISKIER, s.id).outcome).toBe('succeeds')
      expect(runScenario(BEST, s.id).outcome).not.toBe('succeeds')
    }
  })
  it('every attack has a source and Australian incidents come first', () => {
    for (const s of SCENARIOS) expect(s.source.url).toMatch(/^https:\/\//)
    const firstNonAu = SCENARIOS.findIndex((s) => !s.australian)
    expect(SCENARIOS.slice(firstNonAu).some((s) => s.australian)).toBe(false)
  })
})

describe('obligations', () => {
  it('the riskiest network has gaps everywhere it can be assessed; everything fixed is ready', () => {
    const bad = obligations(RISKIER, 2).filter((o) => o.status !== 'check')
    expect(bad.every((o) => o.status === 'gap')).toBe(true)
    const good = readyCount(obligations(BEST, 2))
    expect(good.ready).toBe(good.of)
  })
  it('the register and framework maturity are never graded, because we do not ask about them', () => {
    for (const id of ['register', 'maturity']) expect(obligations(BEST, 2).find((o) => o.id === id)!.status).toBe('check')
  })
  it('the Enhanced CIRMP direction of travel is shown but not counted', () => {
    const rs = obligations(RISKIER, 2)
    expect(rs.filter((o) => o.group === 'direction').length).toBe(4)
    expect(readyCount(rs).of).toBe(rs.filter((o) => o.status !== 'check' && o.group !== 'direction').length)
  })
})

describe('house style', () => {
  const all = JSON.stringify(C)
  it('no em dashes', () => expect(all).not.toMatch(/—/))
  it('says "network segmentation", never "microsegmentation"', () => expect(all).not.toMatch(/micro-?segment/i))
  it('landing cards and the progress bar name the same five steps', () => expect(C.landing.points.map((p) => p.title)).toEqual([...C.STEP_NAMES]))
  it('the landing intro names all five ways in', () => {
    for (const n of Object.values(C.ENTRY_NAMES)) expect(C.landing.intro.toLowerCase()).toContain(n.toLowerCase().replace(/^an? /, ''))
  })
})
