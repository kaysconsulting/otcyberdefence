import { Link } from 'react-router-dom'
import { featureDetail, partner, protectionFeatures, testimonials } from '../content.ts'
import PageHero from '../components/PageHero.tsx'
import Icon from '../components/Icon.tsx'
import More, { Evidence } from '../components/More.tsx'
import CloakDiagram from '../components/CloakDiagram.tsx'
import CtaBand from '../components/CtaBand.tsx'

export default function Protection() {
  return (
    <>
      <PageHero
        photo="network"
        eyebrow="02 · OT Cyber Protection"
        title="Make critical assets invisible to attackers"
        lead="As BlastWave's official Australian partner, we design, deploy and support BlastShield™, a patented zero trust platform that protects even unpatchable legacy systems without downtime."
        crumbs={[{ to: '/protection', label: 'Protection' }]}
      />

      <section>
        <div className="wrap">
          <div className="how">
            <CloakDiagram />
            <div className="feat">
              {protectionFeatures.map((f) => (
                <div key={f.title} className="row">
                  <Icon name={f.icon} />
                  <div style={{ flex: 1 }}>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                    {featureDetail[f.title] && (
                      <More label="How it works">
                        <ul>
                          {featureDetail[f.title].map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      </More>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="light">
        <div className="wrap">
          <div className="mono eyebrow">Technology partner</div>
          <h2>Official Australian partner of {partner.name}</h2>
          <p className="lead">
            Local architecture, deployment and support, with every deployment mapped to your SOCI obligations and IEC
            62443 zones and conduits.
          </p>
          <dl className="facts light-facts">
            {partner.facts.map((f) => (
              <div key={f.k}>
                <dt className="mono">{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>

          <More label="Platform components">
            <div className="components light-components">
              {partner.components.map((c) => (
                <div key={c.name}>
                  <h3>{c.name}</h3>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </More>
          <More label="Standards and regulations supported">
            <div className="fw" style={{ marginTop: 0 }}>
              {partner.standards.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </More>
          <More label="Organisations using BlastShield™">
            <ul className="customers light-customers">
              {partner.customers.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <Evidence>
              <span>Named by BlastWave as customers of its platform.</span>
              <a href="https://www.blastwave.com/company" target="_blank" rel="noopener noreferrer">
                blastwave.com/company ↗
              </a>
            </Evidence>
          </More>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="mono eyebrow">What users say</div>
          {testimonials.map((t) => (
            <div key={t.who} className="quote">
              <div>
                <q>{t.quote}</q>
                <small>
                  {t.who} · {t.source}
                </small>
              </div>
              {t.big && (
                <div className="big">
                  {t.big}
                  <span>{t.bigSub}</span>
                </div>
              )}
            </div>
          ))}
          <p style={{ marginTop: 28 }}>
            <Link to="/case-studies" className="text-link">
              See the results in four published case studies →
            </Link>
          </p>
        </div>
      </section>

      <CtaBand title="See BlastShield™ on your own network" body="A live demonstration against a representative OT environment, run by our team." />
    </>
  )
}
