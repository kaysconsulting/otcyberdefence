import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { navLinks } from '../content.ts'
import Logo from './Logo.tsx'

export default function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <header>
      <div className={`wrap nav${open ? ' open' : ''}`}>
        <Logo />
        <ul>
          {navLinks.map((l) => (
            <li key={l.href}>
              <NavLink to={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <Link to="/contact" className="btn btn-primary">
          Book a briefing →
        </Link>
        <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          ☰
        </button>
      </div>
    </header>
  )
}
