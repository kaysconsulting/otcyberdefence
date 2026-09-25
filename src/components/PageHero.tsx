import { Link } from 'react-router-dom'
import type { PhotoKey } from '../media.ts'
import Title from './Title.tsx'
import Chevrons from './Chevrons.tsx'

type Props = {
  eyebrow?: string
  title: string
  lead: string
  photo?: PhotoKey
  crumbs?: { to: string; label: string }[]
  depth?: boolean
}

// Kays-style inner page header: light band, breadcrumb, black title with red key phrase, one button.
export default function PageHero({ title, lead, crumbs = [] }: Props) {
  return (
    <section className="page-hero">
      <Chevrons dir="left" color="blue" className="ph-chev" />
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          {crumbs.map((c) => (
            <span key={c.to}>
              {' / '}
              <Link to={c.to}>{c.label}</Link>
            </span>
          ))}
        </nav>
        <Title as="h1" text={title} />
        <p className="lead">{lead}</p>
        <Link to="/contact" className="btn">
          Get a quote
        </Link>
      </div>
    </section>
  )
}

export function DepthGuide() {
  return null
}
