import { Link } from 'react-router-dom'
import type { PhotoKey } from '../media.ts'
import Backdrop from './Backdrop.tsx'

type Props = {
  eyebrow: string
  title: string
  lead: string
  photo: PhotoKey
  crumbs?: { to: string; label: string }[]
  depth?: boolean
}

export default function PageHero({ eyebrow, title, lead, photo, crumbs = [], depth = true }: Props) {
  return (
    <section className="page-hero on-image">
      <Backdrop name={photo} eager />
      <div className="wrap">
        <nav className="crumbs mono" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          {crumbs.map((c) => (
            <span key={c.to}>
              {' / '}
              <Link to={c.to}>{c.label}</Link>
            </span>
          ))}
        </nav>
        <div className="mono eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
        {depth && <DepthGuide />}
      </div>
    </section>
  )
}

// Tells readers how the page is layered so they can stop at the depth they need.
export function DepthGuide() {
  return (
    <div className="depth" aria-label="How this page is organised">
      <span>
        <b>1</b> Overview
      </span>
      <i />
      <span>
        <b>2</b> Detail <small>open any card</small>
      </span>
      <i />
      <span>
        <b>3</b> Evidence <small>sources & standards</small>
      </span>
    </div>
  )
}
