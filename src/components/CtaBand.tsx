import { Link } from 'react-router-dom'
import { Clock3 } from 'lucide-react'
import Photo from './Photo.tsx'
import { Arrow } from './Icon.tsx'

const steps = [
  { t: 'Book a time', d: 'Pick a 30-minute slot that suits you.' },
  { t: 'Talk it through', d: 'Your obligations, your systems and your priorities.' },
  { t: 'Leave with a next step', d: 'A short written summary of where to start.' },
]

export default function CtaBand({
  title = 'Talk to an OT security specialist',
  body = 'A focused briefing with someone who has secured safety-critical systems. No obligation.',
}: {
  title?: string
  body?: string
}) {
  return (
    <section className="cta-section">
      <div className="wrap">
        <div className="cta-card">
          <div className="cta-copy">
            <div className="mono eyebrow">Next step</div>
            <h2>{title}</h2>
            <p className="lead">{body}</p>
            <ol className="cta-steps">
              {steps.map((s, i) => (
                <li key={s.t}>
                  <span className="n">{i + 1}</span>
                  <div>
                    <b>{s.t}</b>
                    <span>{s.d}</span>
                  </div>
                </li>
              ))}
            </ol>
            <Link to="/contact" className="btn btn-primary">
              Book a briefing <Arrow />
            </Link>
          </div>
          <div className="cta-media">
            <Photo name="substation" alt="High-voltage substation equipment" width={520} ratio={4 / 5} sizes="(max-width: 980px) 100vw, 520px" />
            <span className="cta-chip">
              <Clock3 size={16} strokeWidth={2} /> 30 minutes · No obligation
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
