import { Link } from 'react-router-dom'
import type { Sector } from '../data.ts'
import { img, srcSet } from '../media.ts'

export default function SectorCard({ x }: { x: Sector }) {
  return (
    <Link className="sec" to={`/sectors/${x.s}`}>
      <img
        src={img(x.img, 1200)}
        srcSet={srcSet(x.img)}
        sizes="(max-width:520px) 100vw,(max-width:1024px) 50vw,25vw"
        alt={x.n}
        loading="lazy"
      />
      <div>
        <h3>{x.n}</h3>
        <p>{x.t}</p>
      </div>
    </Link>
  )
}
