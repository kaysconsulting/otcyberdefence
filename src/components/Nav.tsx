import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { navLinks } from '../content.ts'
import Logo from './Logo.tsx'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const { pathname } = useLocation()

  // Transparent over the photo hero at the top of every page; solid white once scrolled.
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [pathname])
  useEffect(() => setOpen(false), [pathname])

  return (
    <header className={solid || open ? 'solid' : 'over'}>
      <div className={`wrap nav${open ? ' open' : ''}`}>
        <Logo />
        <ul>
          {navLinks.map((l) => (
            <li key={l.href}>
              <NavLink to={l.href}>{l.label}</NavLink>
            </li>
          ))}
        </ul>
        <Link to="/contact" className="btn btn-primary">
          Book a briefing
        </Link>
        <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
        </button>
      </div>
    </header>
  )
}
