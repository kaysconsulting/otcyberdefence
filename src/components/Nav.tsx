import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const links = [
  ['/', 'Home'],
  ['/consulting', 'Consulting'],
  ['/protection', 'Protection'],
  ['/case-studies', 'Case Studies'],
  ['/sectors', 'Sectors'],
  ['/expertise', 'Expertise'],
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  return (
    <header>
      <div className={`wrap nav${open ? ' open' : ''}`}>
        <Link to="/" className="logo">
          <img src="/brand/otcd-logo.png" alt="OT Cyber Defence: Securing OT Systems" />
        </Link>
        <ul>
          {links.map(([to, label]) => (
            <li key={to}>
              <NavLink to={to} end={to === '/'}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <Link to="/contact" className="btn btn-blue">
          Book an appointment
        </Link>
        <button className="burger" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  )
}
