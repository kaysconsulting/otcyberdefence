import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section>
      <div className="wrap" style={{ minHeight: '40vh' }}>
        <div className="mono eyebrow">404</div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: 16 }}>This page doesn't exist</h1>
        <Link to="/" className="text-link">
          Back to home →
        </Link>
      </div>
    </section>
  )
}
