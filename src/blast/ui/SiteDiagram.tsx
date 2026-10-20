import type { BlockedStep, Likelihood, Site, ZoneId } from '../engine/types.ts'
import { results as R, STRENGTH_NAMES, ZONE_NAMES, ZONE_SHORT } from '../content/copy.ts'

const ROWS: ZoneId[] = ['L4', 'L35', 'L3', 'L2', 'L1', 'SIS']
const W = 820
const LABEL = 170
const ROW_H = 74
const GAP = 30

type Props = {
  site: Site
  reached: string[]
  entryZones: ZoneId[]
  blocked: BlockedStep[]
  activeZone?: ZoneId | null
  /** How likely each reached asset is to be reached; absent means likely. */
  likelihood?: Record<string, Likelihood>
}

/** Purdue-style site diagram: reached assets in red, safe in white, entry point in navy, blocked dashed. */
export default function SiteDiagram({ site, reached, entryZones, blocked, activeZone, likelihood }: Props) {
  const reachedSet = new Set(reached)
  const blockedInto = new Set(blocked.map((b) => b.to))
  const H = ROWS.length * (ROW_H + GAP) - GAP + 20
  const conduitBetween = (a: ZoneId, b: ZoneId) => site.conduits.find((c) => c.from === a && c.to === b)

  return (
    <svg className="br-diagram" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Site diagram showing which zones and asset groups an attacker reaches">
      {ROWS.map((z, i) => {
        const y = 10 + i * (ROW_H + GAP)
        const present = site.zones.includes(z)
        const assets = site.assets.filter((a) => a.zone === z)
        const isEntry = entryZones.includes(z)
        const boxW = assets.length ? (W - LABEL - 20 - (assets.length - 1) * 8) / assets.length : 0
        return (
          <g key={z} className={activeZone === z ? 'br-row-active' : undefined}>
            <rect x={0} y={y} width={LABEL - 10} height={ROW_H} rx={6} className={isEntry ? 'br-zone br-zone-entry' : 'br-zone'} />
            <text x={14} y={y + 28} className="br-zone-short">
              {ZONE_SHORT[z]}
            </text>
            <text x={14} y={y + 50} className="br-zone-name">
              {ZONE_NAMES[z]}
            </text>
            {isEntry && (
              <text x={LABEL - 22} y={y + 18} textAnchor="end" className="br-entry-tag">
                ENTRY
              </text>
            )}
            {!present ? (
              <g>
                <rect x={LABEL} y={y} width={W - LABEL - 20} height={ROW_H} rx={6} className="br-absent" />
                <text x={LABEL + (W - LABEL - 20) / 2} y={y + ROW_H / 2 + 5} textAnchor="middle" className="br-absent-text">
                  Not present on this site
                </text>
              </g>
            ) : (
              assets.map((a, k) => {
                const hit = reachedSet.has(a.id)
                const lik = likelihood?.[a.id] ?? 'likely'
                const state = hit ? (lik === 'likely' ? 'hit' : lik) : blockedInto.has(z) ? 'blocked' : 'safe'
                const x = LABEL + k * (boxW + 8)
                return (
                  <g key={a.id}>
                    <rect x={x} y={y} width={boxW} height={ROW_H} rx={6} className={`br-asset br-${state}`} />
                    <text x={x + boxW / 2} y={y + ROW_H / 2 - 4} textAnchor="middle" className="br-asset-label">
                      {a.label}
                    </text>
                    <text x={x + boxW / 2} y={y + ROW_H / 2 + 14} textAnchor="middle" className={`br-asset-state br-${state}-t`}>
                      {R.state[state]}
                    </text>
                    {a.legacy && (
                      <text x={x + boxW - 6} y={y + 12} textAnchor="end" className="br-legacy-tag">
                        LEGACY
                      </text>
                    )}
                  </g>
                )
              })
            )}
            {i < ROWS.length - 1 && (() => {
              // Conduit badge to the next present zone below (skips the DMZ when absent).
              const nextPresent = ROWS.slice(i + 1).find((n) => site.zones.includes(n))
              if (!present || !nextPresent || (z === 'L1' && nextPresent !== 'SIS')) return null
              const c = conduitBetween(z, nextPresent)
              if (!c) return null
              const label = `${STRENGTH_NAMES[c.strength]}${c.allowedFlow ? ' + EWS flow' : ''}`
              return (
                <g>
                  <line x1={LABEL / 2 - 5} y1={y + ROW_H} x2={LABEL / 2 - 5} y2={y + ROW_H + GAP} className="br-conduit-line" />
                  <text x={LABEL / 2 + 4} y={y + ROW_H + GAP / 2 + 4} className={`br-conduit br-s${c.strength}`}>
                    {label}
                  </text>
                </g>
              )
            })()}
          </g>
        )
      })}
    </svg>
  )
}
