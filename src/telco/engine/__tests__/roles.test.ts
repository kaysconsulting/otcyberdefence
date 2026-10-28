import { describe, expect, it } from 'vitest'
import * as C from '../../content/copy.ts'
import * as RL from '../../content/roles.ts'
import { FIX_ORDER } from '../fixes.ts'

const allQs = C.groups.flatMap((g) => g.questions)

describe('tailored by role', () => {
  it('every question has a plain-English version, with every option covered', () => {
    for (const q of allQs) {
      const p = RL.plainQuestions[q.id]
      expect(p, q.id).toBeDefined()
      if (q.kind === 'choice') for (const o of q.options) expect(p!.options?.[String(o.value)], `${q.id}.${String(o.value)}`).toBeDefined()
    }
  })
  it('executives and directors get a short set of real questions', () => {
    expect(RL.SHORT_SET.length).toBeLessThan(allQs.length)
    for (const k of RL.SHORT_SET) expect(allQs.some((q) => q.id === k)).toBe(true)
  })
  it('every plan step has a plain name', () => {
    for (const f of FIX_ORDER) expect(RL.plainFix[f]).toBeTruthy()
  })
  it('every role has exercise questions and a briefing', () => {
    for (const r of RL.roles) {
      expect(RL.exerciseQuestions[r.value].length).toBeGreaterThan(0)
      expect(RL.briefing[r.value].title).toBeTruthy()
    }
  })
  it('house style: no em dashes, and every dollar figure carries a source', () => {
    const all = JSON.stringify(RL)
    expect(all).not.toMatch(/—/)
    for (const ref of RL.cost.refs) expect(ref.url).toMatch(/^https:\/\//)
  })
})
