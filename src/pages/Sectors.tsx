import { Link } from 'react-router-dom'
import { sectors } from '../content.ts'
import { photos } from '../media.ts'
import PageHero from '../components/PageHero.tsx'
import CtaBand from '../components/CtaBand.tsx'

export default function Sectors() {
  return (
    <>
      <PageHero
        photo="rail"
        eyebrow="Sectors"
        title="Built for the sectors SOCI protects"
        lead="Choose your sector to see the systems in scope, the regulation that applies and how we help."
        crumbs={[{ to: '/sectors', label: 'Sectors' }]}
      />
      <section className="light">
        <div className="wrap">
          <div className="tiles">
            {sectors.map((s) => (
              <Link key={s.slug} to={`/sectors/${s.slug}`} className="tile">
                <img src={photos[s.photo](700)} alt="" loading="lazy" />
                <div>
                  <b>{s.name}</b>
                  <span>{s.summary}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  )
}
