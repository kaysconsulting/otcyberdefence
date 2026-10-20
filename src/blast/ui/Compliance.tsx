import type { Inputs, SimResult } from '../engine/types.ts'
import { complianceGaps, operationalImpact } from '../engine/compliance.ts'
import { compliance as T } from '../content/copy.ts'

/** Decision-maker summary of the obligations a result touches, with engineer-level references. */
export default function CompliancePanel({ inputs, runs }: { inputs: Inputs; runs: SimResult[] }) {
  const gaps = complianceGaps(inputs, runs)
  const impact = operationalImpact(runs)
  return (
    <div className="br-comp">
      <span className="eyebrow">{T.eyebrow}</span>
      <h3>{T.count(gaps.length)}</h3>
      <p className="br-comp-intro">{T.intro}</p>
      {impact && (
        <ul className="br-comp-notes">
          <li>{T.reporting}</li>
          <li>{T.board}</li>
        </ul>
      )}
      {gaps.length === 0 ? (
        <p className="br-comp-none">{T.none}</p>
      ) : (
        <ul className="br-comp-list">
          {gaps.map((g) => (
            <li key={g.id}>
              <span className="tag">CIRMP: {g.cirmp}</span>
              <b>{g.title}</b>
              <p>{g.detail}</p>
              <div className="chips">
                {g.refs.map((r) => (
                  <span key={r}>{r}</span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
