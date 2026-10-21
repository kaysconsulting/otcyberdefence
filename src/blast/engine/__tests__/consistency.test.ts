// Presentation and communication: one name for each thing, everywhere.
import { describe, expect, it } from 'vitest'
import * as C from '../../content/copy.ts'
import * as P from '../../content/plan.ts'
import { SCENARIOS } from '../scenarios.ts'

const allText = JSON.stringify(C) + JSON.stringify(P)

describe('consistent wording', () => {
  it('ways in are always "ways in", never "entry points"', () => {
    expect(allText).not.toMatch(/entry point/i)
  })

  it('the hero lists the five ways in by the same names used everywhere else', () => {
    for (const name of Object.values(C.ENTRY_NAMES)) expect(C.landing.sub.toLowerCase()).toContain(name.toLowerCase().replace(/^an? /, ''))
  })

  it('landing cards and the progress bar name the same five steps', () => {
    expect(C.landing.points.map((p) => p.title)).toEqual([...C.STEP_NAMES])
  })

  it('replay outcomes use exactly three labels', () => {
    expect(Object.values(C.results.outcome.label)).toEqual(['Likely succeeds', 'Partly succeeds', 'Likely stopped'])
  })

  it('the least likely level is always "Unlikely, but possible"', () => {
    expect(C.results.state.unlikely).toBe('Unlikely, but possible')
    expect(C.results.tags.unlikely).toBe('Unlikely, but possible')
  })

  it('counts on the landing page match the content', () => {
    expect(C.landing.points[2].text).toMatch(/nine real attacks/)
    expect(C.landing.points[1].text).toMatch(/five common ways in/)
    expect(Object.keys(C.ENTRY_NAMES)).toHaveLength(5)
    expect(SCENARIOS).toHaveLength(9)
    expect(SCENARIOS.filter((s) => s.australian)).toHaveLength(3)
  })
})
