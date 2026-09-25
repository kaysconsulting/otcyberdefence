import { Link } from 'react-router-dom'

export default function CtaBand({ title = 'Talk to an OT security specialist', body = 'A 30-minute briefing on your obligations, your systems and where to start. No obligation.' }: { title?: string; body?: string }) {
  return (
    <section className="cta-band">
      <div className="wrap">
        <div>
          <h2>{title}</h2>
          <p className="lead">{body}</p>
        </div>
        <Link to="/contact" className="btn btn-primary">
          Book a briefing →
        </Link>
      </div>
    </section>
  )
}
