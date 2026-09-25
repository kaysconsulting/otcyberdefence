import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { navLinks } from '../content.ts'
import Logo from './Logo.tsx'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])

  return (
    <header>
      <div className={`wrap nav${open ? ' open' : ''}`}>
        <Logo />
        <ul>
          <li>
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>
          {navLinks.map((l) => (
            <li key={l.href}>
              <NavLink to={l.href}>{l.label}</NavLink>
            </li>
          ))}
        </ul>
        <Link to="/contact" className="btn nav-btn">
          Book an appointment
        </Link>
        <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>
      </div>
    </header>
  )
}
