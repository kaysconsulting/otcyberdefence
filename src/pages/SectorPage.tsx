import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SECTORS } from '../data.ts'
import Banner from '../components/Banner.tsx'
import Band from '../components/Band.tsx'
import NotFound from './NotFound.tsx'

export default function SectorPage() {
  const { slug } = useParams()
  const x = SECTORS.find((s) => s.s === slug)
  useEffect(() => {
    if (x) document.title = `${x.n} | OT Cyber Defence`
  }, [x])
  if (!x) return <NotFound />
  const others = SECTORS.filter((o) => o !== x)
  return (
    <>
      <Banner
        image={x.img}
        crumbs={[{ to: '/sectors', label: 'Sectors' }, { label: x.n }]}
        title={<span style={{ color: '#FF3B47' }}>{x.n}</span>}
        text={x.t}
        button={false}
        style={{ paddingBottom: 130 }}
      />
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sd">
            <div className="card">
              <span className="tag">Consulting</span>
              <h3>Governance, risk and compliance</h3>
              <p>{x.c}</p>
              <p style={{ marginTop: 16 }}>
                <Link className="more" to="/consulting">Consulting services →</Link>
              </p>
            </div>
            <div className="card">
              <span className="tag">Protection</span>
              <h3>Zero trust OT protection</h3>
              <p>{x.p}</p>
              <p style={{ marginTop: 16 }}>
                <Link className="more" to="/protection">How it works →</Link>
              </p>
            </div>
          </div>
          <div className="facts">
            {[
              ['The challenges we see', x.ch],
              ['Systems in scope', x.sy],
              ['Regulation and standards', x.rg],
            ].map(([h, list]) => (
              <div key={h as string}>
                <h3>{h}</h3>
                <ul>
                  {(list as string[]).map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <h3 style={{ marginTop: 56 }}>Other sectors</h3>
          <div className="others">
            {others.map((o) => (
              <Link key={o.s} to={`/sectors/${o.s}`}>
                {o.n}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Band title="Let's Work Together" />
    </>
  )
}
