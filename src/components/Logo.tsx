import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="logo">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <path d="M17 2 30 7v9c0 8-5.6 13.6-13 16C9.6 29.6 4 24 4 16V7z" fill="none" stroke="#2059A5" strokeWidth="2.2" />
        <path d="M11 17h4l2-5 3 10 2-5h2" fill="none" stroke="#CE0514" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>
        OT Cyber Defence<small>Critical Infrastructure Security</small>
      </span>
    </Link>
  )
}
