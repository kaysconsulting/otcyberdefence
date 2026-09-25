import { expertise } from '../content.ts'
import PageHero from '../components/PageHero.tsx'
import Icon from '../components/Icon.tsx'
import More, { Evidence } from '../components/More.tsx'
import CtaBand from '../components/CtaBand.tsx'

export default function Expertise() {
  return (
    <>
      <PageHero
        photo="engineers"
        eyebrow="Our expertise"
        title="Practitioners who have secured Australia's safety-critical infrastructure"
        lead={expertise.intro}
        crumbs={[{ to: '/expertise', label: 'Expertise' }]}
      />

      <section className="light">
        <div className="wrap">
          <div className="cards3" style={{ marginTop: 0 }}>
            {expertise.highlights.map((h) => (
              <div key={h.title} className="card">
                <Icon name={h.icon} />
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </div>
            ))}
          </div>

          <div className="exp-grid">
            <div className="exp-panel">
              <div className="mono eyebrow">Qualifications held by our team</div>
              <ul className="creds">
                {expertise.credentials.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <More label="Safety-critical systems secured">
                <div className="fw" style={{ marginTop: 0 }}>
                  {expertise.systems.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </More>
              <More label="Standards applied">
                <div className="fw" style={{ marginTop: 0 }}>
                  {expertise.standards.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </More>
              <More label="Where our experience was gained">
                <div className="fw" style={{ marginTop: 0 }}>
                  {expertise.experienceWith.map((s) => (
                    <span key={s} className="org">
                      {s}
                    </span>
                  ))}
                </div>
                <Evidence>
                  <span>
                    Organisations where our team members have held roles. Listed to show experience, not as client
                    endorsements.
                  </span>
                </Evidence>
              </More>
            </div>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  )
}
