import { Link } from 'react-router-dom'
import { sectors } from '../content.ts'
import Photo from '../components/Photo.tsx'
import PageHero from '../components/PageHero.tsx'
import CtaBand from '../components/CtaBand.tsx'
import { ArrowCircle } from '../components/Icon.tsx'

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
                <Photo name={s.photo} alt="" width={280} ratio={4 / 3} sizes="(max-width: 760px) 100vw, (max-width: 980px) 50vw, 280px" />
                <div>
                  <b>{s.name}</b>
                  <span>{s.summary}</span>
                  <ArrowCircle sm />
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
