import { Link } from 'react-router-dom'

// Kays-style lockup: blue shield with red swoosh, name in Kays blue, key word in red.
export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="OT Cyber Defence home">
      <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true">
        <path d="M23 3 40 9v12c0 11-7.4 18.6-17 22C13.4 39.6 6 32 6 21V9z" fill="#1D58A7" />
        <path d="M9 22c8-4 17-5 28-3" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M10 28c8-4 16-5 26-3" stroke="#CD0312" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M13 34c6-3 12-4 19-2" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </svg>
      <span>
        <b>
          OT CYBER <em>DEFENCE</em>
        </b>
        <small>Critical Infrastructure Security</small>
      </span>
    </Link>
  )
}
