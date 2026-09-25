import { Link, useParams } from 'react-router-dom'
import { sectors } from '../content.ts'
import PageHero from '../components/PageHero.tsx'
import More, { Evidence } from '../components/More.tsx'
import CtaBand from '../components/CtaBand.tsx'
import NotFound from './NotFound.tsx'
import { Arrow, External } from '../components/Icon.tsx'

export default function SectorPage() {
  const { slug } = useParams()
  const s = sectors.find((x) => x.slug === slug)
  if (!s) return <NotFound />
  const others = sectors.filter((x) => x.slug !== s.slug)

  return (
    <>
      <PageHero
        photo={s.photo}
        eyebrow={`Sector · ${s.name}`}
        title={s.summary}
        lead={`How we help ${s.name.toLowerCase()} operators meet their obligations and protect the systems that matter.`}
        crumbs={[
          { to: '/sectors', label: 'Sectors' },
          { to: `/sectors/${s.slug}`, label: s.name },
        ]}
      />

      <section className="light">
        <div className="wrap">
          <div className="cards2" style={{ marginTop: 0 }}>
            <div className="card">
              <span className="tag">Consulting</span>
              <h3>Governance, risk and compliance</h3>
              <p>{s.consulting}</p>
              <Link to="/consulting" className="text-link small">
                Consulting services <Arrow />
              </Link>
            </div>
            <div className="card">
              <span className="tag">Protection</span>
              <h3>BlastShield™ zero trust</h3>
              <p>{s.protection}</p>
              <Link to="/protection" className="text-link small">
                How BlastShield works <Arrow />
              </Link>
            </div>
          </div>

          <More label="The challenges we see">
            <ul>
              {s.challenges.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </More>
          <More label="Systems in scope">
            <div className="fw" style={{ marginTop: 0 }}>
              {s.systems.map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </More>
          <More label="Regulation and standards">
            <div className="fw" style={{ marginTop: 0 }}>
              {s.regulation.map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
            {s.reading && (
              <Evidence>
                <a href={s.reading.href} target="_blank" rel="noopener noreferrer">
                  {s.reading.label} <External />
                </a>
              </Evidence>
            )}
          </More>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="mono eyebrow">Other sectors</div>
          <div className="chip-links">
            {others.map((o) => (
              <Link key={o.slug} to={`/sectors/${o.slug}`}>
                {o.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  )
}
