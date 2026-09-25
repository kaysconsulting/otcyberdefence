// SOCI obligations as a timeline a reader can take in at a glance.
const steps = [
  { t: 'Register', d: 'Asset ownership and operational information kept current', w: 'Ongoing' },
  { t: 'Report', d: 'Significant cyber incidents to the ACSC', w: '12 h / 72 h' },
  { t: 'Maintain', d: 'A written CIRMP with a recognised cyber framework', w: 'Continuous' },
  { t: 'Attest', d: 'Board-approved annual CIRMP report', w: 'Annually' },
]

export default function SociTimeline() {
  return (
    <div className="soci-line" role="list" aria-label="SOCI Act obligations">
      {steps.map((s, i) => (
        <div key={s.t} className="soci-step" role="listitem">
          <div className="node mono">{String(i + 1).padStart(2, '0')}</div>
          <b>{s.t}</b>
          <p>{s.d}</p>
          <span className="mono when">{s.w}</span>
        </div>
      ))}
    </div>
  )
}
