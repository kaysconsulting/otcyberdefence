import { caseDetail, caseStudies } from '../content.ts'
import PageHero from '../components/PageHero.tsx'
import More, { Evidence } from '../components/More.tsx'
import CtaBand from '../components/CtaBand.tsx'

export default function CaseStudies() {
  return (
    <>
      <PageHero
        photo="refinery"
        eyebrow="Case studies"
        title="Outcomes from real-world deployments"
        lead="Four published BlastWave case studies from oil and gas, manufacturing, hazardous logistics and technology. Each links to the original document."
        crumbs={[{ to: '/case-studies', label: 'Case studies' }]}
      />
      <section className="light">
        <div className="wrap case-list">
          {caseStudies.map((c) => {
            const d = caseDetail[c.title]
            return (
              <article key={c.title} className="case-row">
                <div>
                  <span className="tag">{c.tag}</span>
                  <h2 className="case-title">{c.title}</h2>
                  <p className="lead">{c.body}</p>
                  {d && (
                    <More label="Challenge and approach">
                      <dl className="ca">
                        <dt>Challenge</dt>
                        <dd>{d.challenge}</dd>
                        <dt>Approach</dt>
                        <dd>{d.approach}</dd>
                      </dl>
                      <Evidence>
                        <a href={c.href} target="_blank" rel="noopener noreferrer">
                          Original case study (PDF, BlastWave) ↗
                        </a>
                      </Evidence>
                    </More>
                  )}
                </div>
                <div className="metric-stack light-metrics">
                  {d?.metrics.map((m) => (
                    <div key={m.k}>
                      <b>{m.v}</b>
                      <span>{m.k}</span>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
          <p className="attrib" style={{ color: 'var(--inkmuted)' }}>
            These case studies describe BlastWave deployments and are drawn from BlastWave's published materials.
          </p>
        </div>
      </section>
      <CtaBand />
    </>
  )
}
