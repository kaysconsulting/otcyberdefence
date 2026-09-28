import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { img, type ImgKey } from '../media.ts'

type Props = {
  image: ImgKey
  crumbs: { to?: string; label: string }[]
  eyebrow?: string
  title: ReactNode
  text: string
  button?: boolean
  style?: React.CSSProperties
}

// Page banner: photo behind a blue gradient, breadcrumb, title and one button.
export default function Banner({ image, crumbs, eyebrow, title, text, button = true, style }: Props) {
  return (
    <div className="banner" style={{ backgroundImage: `url('${img(image, 2400)}')`, ...style }}>
      <div className="wrap">
        <div className="crumb">
          <Link to="/">Home</Link>
          {crumbs.map((c) => (
            <span key={c.label}>
              {' / '}
              {c.to ? <Link to={c.to}>{c.label}</Link> : c.label}
            </span>
          ))}
        </div>
        {eyebrow && (
          <span className="eyebrow" style={{ color: '#FF8A92' }}>
            {eyebrow}
          </span>
        )}
        <h1>{title}</h1>
        <p>{text}</p>
        {button && (
          <Link to="/contact" className="btn btn-red">
            Book an appointment
          </Link>
        )}
      </div>
    </div>
  )
}
