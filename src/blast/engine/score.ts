import type { Band, Site } from './types.ts'

export function bandFor(score: number): Band {
  return score <= 20 ? 'Contained' : score <= 50 ? 'Partly exposed' : 'Highly exposed'
}

/** Spec 7.5: share of total criticality reached, as 0 to 100. */
export function exposure(site: Site, reached: Set<string>): number {
  const total = site.assets.reduce((s, a) => s + a.criticality, 0)
  const hit = site.assets.filter((a) => reached.has(a.id)).reduce((s, a) => s + a.criticality, 0)
  return total ? Math.round((hit / total) * 100) : 0
}
