import { consultingServices, frameworks, serviceDetail, approachSteps } from '../content.ts'
import PageHero from '../components/PageHero.tsx'
import Icon from '../components/Icon.tsx'
import More, { Evidence } from '../components/More.tsx'
import SociTimeline from '../components/SociTimeline.tsx'
import PurdueDiagram from '../components/PurdueDiagram.tsx'
import CtaBand from '../components/CtaBand.tsx'

export default function Consulting() {
  return (
    <>
      <PageHero
        photo="control"
        eyebrow="01 · OT Cyber Consulting"
        title="Governance, risk and compliance, built for operational technology"
        lead="Most compliance programs are designed for IT and then stretched to fit the plant floor. Ours start with the plant."
        crumbs={[{ to: '/consulting', label: 'Consulting' }]}
      />

      <section className="light">
        <div className="wrap">
          <div className="mono eyebrow">Services</div>
          <h2>Six services, each with defined outputs</h2>
          <p className="lead">Open any service to see exactly what you receive and the standards it references.</p>
          <div className="cards3">
            {consultingServices.map((s) => {
              const d = serviceDetail[s.title]
              return (
                <div key={s.title} className="card">
                  <Icon name={s.icon} />
                  <span className="tag">{s.tag}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  {d && (
                    <More label="What you receive">
                      <ul>
                        {d.receive.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                      <Evidence>
                        {d.refs.map((r) => (
                          <span key={r} className="ref">
                            {r}
                          </span>
                        ))}
                      </Evidence>
                    </More>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="mono eyebrow">Why it matters now</div>
          <h2>SOCI has moved from awareness to accountability</h2>
          <p className="lead">
            Responsible entities must keep a Critical Infrastructure Risk Management Program aligned to a recognised
            framework, and their boards attest to it every year.
          </p>
          <SociTimeline />
          <More label="Frameworks a CIRMP can align to">
            <div className="fw" style={{ marginTop: 0 }}>
              {frameworks.map((f) => (
                <span key={f} className="dark-chip">
                  {f}
                </span>
              ))}
            </div>
          </More>
        </div>
      </section>

      <section className="light">
        <div className="wrap split">
          <div>
            <div className="mono eyebrow">How we assess</div>
            <h2>We start with the plant, not the policy</h2>
            <p className="lead">
              Every assessment maps your real architecture into zones and conduits, so risk, controls and investment
              line up with how the plant actually runs.
            </p>
            <More label="How an engagement runs">
              <ol className="steps-list">
                {approachSteps.map((s) => (
                  <li key={s.step}>
                    <b>{s.title}</b>
                    <span>{s.body}</span>
                  </li>
                ))}
              </ol>
            </More>
          </div>
          <PurdueDiagram />
        </div>
      </section>

      <CtaBand title="Need a SOCI or AESCSF roadmap?" />
    </>
  )
}
