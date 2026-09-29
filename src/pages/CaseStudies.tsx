import { CASES } from '../data.ts'
import Banner from '../components/Banner.tsx'
import Band from '../components/Band.tsx'

export default function CaseStudies() {
  return (
    <>
      <Banner
        image="oil-gas"
        crumbs={[{ label: 'Case studies' }]}
        eyebrow="Case studies"
        title="Outcomes from Real-World Deployments"
        text="The platform we bring to Australia has been proven in several OT industries, such as oil and gas and manufacturing. Please find a selection of results from our partner's global deployments."
      />
      <section>
        <div className="wrap">
          <div className="grid2" style={{ marginTop: 0 }}>
            {CASES.map((c) => (
              <div key={c.title} className="card case">
                <span className="tag">{c.tag}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <div className="figs">
                  {c.figs.map(([b, s]) => (
                    <div key={s}>
                      <b>{b}</b>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
                <details>
                  <summary>Challenge and approach</summary>
                  <p>{c.more}</p>
                </details>
              </div>
            ))}
          </div>
          <div className="quote">
            <div>
              <q>In test after test, I was unsuccessful at circumventing its passwordless MFA login, or breaking out of the microsegmentation to pivot inside the network.</q>
              <small>Former CISO and security researcher, independent testing</small>
            </div>
            <div className="big"><b>0</b><span>successful bypasses</span></div>
          </div>
        </div>
      </section>
      <Band title="Let's Talk About Your Sites" />
    </>
  )
}
