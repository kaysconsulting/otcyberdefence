import type { BlockedStep, Likelihood, ZoneId } from '../engine/types.ts'
import { ASSETS, ZONE_ORDER } from '../engine/model.ts'
import { results as R, ZONE_NAMES, ZONE_SHORT } from '../content/copy.ts'

const W = 820
const LABEL = 190
const ROW_H = 66
const GAP = 14

type Props = {
  zones: Partial<Record<ZoneId, Likelihood>>
  entryZones: ZoneId[]
  blocked: BlockedStep[]
  activeZone?: ZoneId | null
}

/** Carrier network in seven zones: reached in red (shaded by likelihood), safe in white, way in tagged, stopped dashed. */
export default function NetworkDiagram({ zones, entryZones, blocked, activeZone }: Props) {
  const blockedInto = new Set(blocked.map((b) => b.to))
  const H = ZONE_ORDER.length * (ROW_H + GAP) - GAP + 20
  return (
    <svg className="br-diagram" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Network map showing which zones an attacker is likely to reach">
      {ZONE_ORDER.map((z, i) => {
        const y = 10 + i * (ROW_H + GAP)
        const assets = ASSETS.filter((a) => a.zone === z)
        const boxW = (W - LABEL - 20 - (assets.length - 1) * 8) / assets.length
        const lik = zones[z]
        const state = lik ? (lik === 'likely' ? 'hit' : lik) : blockedInto.has(z) ? 'blocked' : 'safe'
        const isEntry = entryZones.includes(z)
        return (
          <g key={z} className={activeZone === z ? 'br-row-active' : undefined}>
            <rect x={0} y={y} width={LABEL - 10} height={ROW_H} rx={6} className={isEntry ? 'br-zone br-zone-entry' : 'br-zone'} />
            <text x={14} y={y + 26} className="br-zone-short">
              {ZONE_SHORT[z]}
            </text>
            <text x={14} y={y + 46} className="br-zone-name" style={{ fontSize: 11.5 }}>
              {ZONE_NAMES[z]}
            </text>
            {isEntry && (
              <text x={LABEL - 22} y={y + 18} textAnchor="end" className="br-entry-tag">
                WAY IN
              </text>
            )}
            {assets.map((a, k) => {
              const x = LABEL + k * (boxW + 8)
              return (
                <g key={a.id}>
                  <rect x={x} y={y} width={boxW} height={ROW_H} rx={6} className={`br-asset br-${state}`} />
                  <text
                    x={x + boxW / 2}
                    y={y + ROW_H / 2 - 4}
                    textAnchor="middle"
                    className="br-asset-label"
                    style={{ fontSize: Math.max(9.5, Math.min(12, (boxW - 10) / (a.label.length * 0.6))) }}
                  >
                    {a.label}
                  </text>
                  <text x={x + boxW / 2} y={y + ROW_H / 2 + 14} textAnchor="middle" className={`br-asset-state br-${state}-t`}>
                    {R.icon[state]} {boxW < 130 ? R.stateShort[state] : R.state[state]}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

export function Legend() {
  return (
    <ul className="br-legend">
      <li>
        <i className="lg-hit" /> {R.icon.hit} {R.state.hit}
      </li>
      <li>
        <i className="lg-possible" /> {R.icon.possible} {R.state.possible}
      </li>
      <li>
        <i className="lg-unlikely" /> {R.icon.unlikely} {R.state.unlikely}
      </li>
      <li>
        <i className="lg-safe" /> {R.icon.safe} {R.state.safe}
      </li>
      <li>
        <i className="lg-block" /> {R.icon.blocked} {R.state.blocked}
      </li>
      <li>
        <i className="lg-entry" /> Way in
      </li>
    </ul>
  )
}
