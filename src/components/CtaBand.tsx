import { Link } from 'react-router-dom'
import Title from './Title.tsx'
import Chevrons from './Chevrons.tsx'

export default function CtaBand({ title = "Let's {work} together", body = 'Book a 30-minute briefing on your obligations, your systems and where to start. No obligation.' }: { title?: string; body?: string }) {
  return (
    <section className="cta-band">
      <div className="wrap">
        <div>
          <Title text={title} />
          <p>{body}</p>
        </div>
        <div className="cta-actions">
          <Link to="/contact" className="btn">
            Book an appointment
          </Link>
          <Link to="/contact" className="btn btn-outline">
            Request a call back
          </Link>
        </div>
        <Chevrons className="cta-chev" />
      </div>
    </section>
  )
}
