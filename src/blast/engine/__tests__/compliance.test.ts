import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS as D } from '../inputs.ts'
import { worstCase } from '../simulate.ts'
import { applyFixes, FIX_ORDER } from '../fixes.ts'
import { complianceGaps, FIX_ADDRESSES, operationalImpact } from '../compliance.ts'

const gaps = (i = D, cap: 1 | 2 | 3 = 2) => complianceGaps(i, worstCase(i, cap).runs).map((g) => g.id)

describe('compliance mapping', () => {
  it('the default site shows every gap area', () => {
    expect(gaps()).toEqual(['remote', 'supply', 'segmentation', 'safety', 'legacy', 'media', 'accounts'])
  })

  it('all fixes close every gap', () => {
    expect(gaps(applyFixes(D, FIX_ORDER))).toEqual([])
  })

  it('each fix helps: it closes a gap it lists, or at least reduces exposure', () => {
    for (const f of FIX_ORDER) {
      const before = new Set(gaps())
      const after = new Set(gaps(applyFixes(D, [f])))
      const closed = [...before].filter((g) => !after.has(g))
      const closesListed = closed.some((g) => FIX_ADDRESSES[f].includes(g as never))
      const reduces = worstCase(applyFixes(D, [f])).runs.some((r, k) => r.exposureScore < worstCase(D).runs[k].exposureScore)
      expect(closesListed || reduces, `${f} neither closed a listed gap nor reduced exposure`).toBe(true)
    }
  })

  it('safety gap follows the key switch', () => {
    expect(gaps({ ...D, sisKeySwitch: 'run' })).not.toContain('safety')
  })

  it('reporting note only when operations are affected', () => {
    expect(operationalImpact(worstCase(D).runs)).toBe(true)
    expect(operationalImpact(worstCase(applyFixes(D, FIX_ORDER)).runs)).toBe(false)
  })

  it('every gap names its CIRMP area and at least one reference', () => {
    for (const g of complianceGaps(D, worstCase(D).runs)) {
      expect(g.cirmp.length).toBeGreaterThan(0)
      expect(g.refs.length).toBeGreaterThan(0)
    }
  })
})
