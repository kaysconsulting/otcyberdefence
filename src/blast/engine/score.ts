import type { Band, Likelihood, Site } from './types.ts'
import { LIKELIHOOD_WEIGHT } from './conduits.ts'

export function bandFor(score: number): Band {
  return score <= 20 ? 'Contained' : score <= 50 ? 'Partly exposed' : 'Highly exposed'
}

/**
 * Spec 7.5, weighted: share of total criticality reached, as 0 to 100.
 * Each reached asset group counts by how likely it is to be reached (likely 1, possible 0.6, unlikely 0.3).
 * A plain set of ids counts every asset as likely.
 */
export function exposure(site: Site, reached: Set<string> | Record<string, Likelihood>): number {
  const lik = (id: string): number => {
    if (reached instanceof Set) return reached.has(id) ? 1 : 0
    const l = reached[id]
    return l ? LIKELIHOOD_WEIGHT[l] : 0
  }
  const total = site.assets.reduce((s, a) => s + a.criticality, 0)
  const hit = site.assets.reduce((s, a) => s + a.criticality * lik(a.id), 0)
  return total ? Math.round((hit / total) * 100) : 0
}
