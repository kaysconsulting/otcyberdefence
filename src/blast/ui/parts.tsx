import type { BlockedStep, PathStep, SimResult, ZoneId } from '../engine/types.ts'
import { results as R, ZONE_NAMES } from '../content/copy.ts'

export function ScoreBadge({ score, band }: { score: number; band: SimResult['band'] }) {
  const tone = band === 'Contained' ? 'ok' : band === 'Partly exposed' ? 'mid' : 'bad'
  return (
    <div className={`br-score br-${tone}`}>
      <b>{score}</b>
      <span>
        <strong>{band}</strong>
        <small>{R.bands[band]}</small>
      </span>
    </div>
  )
}

export function Banners({ r }: { r: Pick<SimResult, 'sisReached' | 'sisLogicChangeable' | 'l1Reached'> }) {
  return (
    <>
      {r.sisLogicChangeable && <div className="br-banner br-banner-red">{R.sisBanner}</div>}
      {r.sisReached && !r.sisLogicChangeable && <div className="br-banner br-banner-amber">{R.sisNetworkOnly}</div>}
      {r.l1Reached && <div className="br-banner">{R.l1Banner}</div>}
    </>
  )
}

const ZONE_ORDER: ZoneId[] = ['L4', 'L35', 'L3', 'L2', 'L1', 'SIS']

export function ReachCounts({ r }: { r: SimResult }) {
  return (
    <ul className="br-counts">
      {ZONE_ORDER.filter((z) => r.site.zones.includes(z)).map((z) => {
        const all = r.site.assets.filter((a) => a.zone === z)
        const hit = all.filter((a) => r.reachedAssetIds.includes(a.id)).length
        return (
          <li key={z} className={hit ? 'hit' : ''}>
            <b>
              {hit} of {all.length}
            </b>
            <span>{ZONE_NAMES[z]}</span>
          </li>
        )
      })}
    </ul>
  )
}

export function PathList({ path, blocked, entryReason, entrySucceeded }: { path: PathStep[]; blocked: BlockedStep[]; entryReason: string; entrySucceeded: boolean }) {
  return (
    <ol className="br-path">
      {!entrySucceeded && (
        <li className="br-step-block">
          <span className="br-tag">{R.tags.entryFailed}</span>
          {entryReason}
        </li>
      )}
      {path.map((p, k) => (
        <li key={k} className={`br-step-${p.kind}`}>
          <span className="br-tag">{p.kind === 'entry' ? R.tags.entry : p.kind === 'cross' ? R.tags.cross : R.tags.spread}</span>
          {p.reason}
        </li>
      ))}
      {blocked.map((b, k) => (
        <li key={`b${k}`} className="br-step-block">
          <span className="br-tag">{R.tags.stopped}</span>
          {b.reason}
        </li>
      ))}
    </ol>
  )
}
