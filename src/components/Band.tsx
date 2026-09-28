import { Link } from 'react-router-dom'

export default function Band({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="band">
      <div className="wrap">
        <div>
          <h2>{title}</h2>
          <p>{sub || 'Book a 30-minute appointment on your obligations, your systems and where to start. No obligation.'}</p>
        </div>
        <div className="ctas">
          <Link to="/contact" className="btn btn-red">
            Book an appointment
          </Link>
          <Link to="/contact" className="btn btn-line">
            Request a call back
          </Link>
        </div>
      </div>
    </div>
  )
}
