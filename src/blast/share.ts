// Shareable result links: the answers live in the URL, never on a server.
import type { Capability, FixId, Inputs } from './engine/types.ts'
import { DEFAULT_INPUTS } from './engine/inputs.ts'
import type { Sector } from './content/sectors.ts'

export type Shared = { inputs: Inputs; capability: Capability; fixes: FixId[]; unsure: (keyof Inputs)[]; sector: Sector }

export function encodeShare(s: Shared): string {
  const json = JSON.stringify({ i: s.inputs, c: s.capability, f: s.fixes, u: s.unsure, s: s.sector })
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeShare(code: string | null): Shared | null {
  if (!code) return null
  try {
    const json = decodeURIComponent(escape(atob(code.replace(/-/g, '+').replace(/_/g, '/'))))
    const o = JSON.parse(json)
    // Only accept known keys, so a hand-edited link cannot inject anything odd.
    const inputs = { ...DEFAULT_INPUTS }
    for (const k of Object.keys(DEFAULT_INPUTS) as (keyof Inputs)[]) if (o.i && k in o.i && typeof o.i[k] === typeof DEFAULT_INPUTS[k]) (inputs as Record<string, unknown>)[k] = o.i[k]
    const capability = ([1, 2, 3].includes(o.c) ? o.c : 2) as Capability
    return {
      inputs,
      capability,
      fixes: Array.isArray(o.f) ? o.f.filter((x: unknown) => typeof x === 'string') : [],
      unsure: Array.isArray(o.u) ? o.u.filter((x: unknown) => typeof x === 'string' && x in DEFAULT_INPUTS) : [],
      sector: typeof o.s === 'string' ? o.s : 'other',
    }
  } catch {
    return null
  }
}

export function shareUrl(s: Shared): string {
  return `${location.origin}/blast-radius?r=${encodeShare(s)}`
}
