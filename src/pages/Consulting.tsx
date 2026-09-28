import { SERVICES } from '../data.ts'
import Banner from '../components/Banner.tsx'
import Band from '../components/Band.tsx'

export default function Consulting() {
  return (
    <>
      <Banner
        image="consulting-banner"
        crumbs={[{ label: 'Consulting' }]}
        eyebrow="OT Cyber Consulting"
        title="Governance, Risk and Compliance Built for Operational Technology"
        text="Most compliance programs are designed for IT and then stretched to fit the plant floor. Ours start with the plant."
      />

      <section>
        <div className="wrap">
          <span className="eyebrow">Services</span>
          <h2>Six Services, Each with Defined Outputs</h2>
          <p className="lead">Open any service to see exactly what you receive and the standards it references.</p>
          <div className="svcs">
            {SERVICES.map(([t, h, d, r, e]) => (
              <details key={h}>
                <summary>
                  <span className="tag">{t}</span>
                  <h3>{h}</h3>
                  <p>{d}</p>
                </summary>
                <div className="in">
                  <h4>What you receive</h4>
                  <ul>
                    {r.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                  <h4>Standards referenced</h4>
                  <div className="chips">
                    {e.map((i) => (
                      <span key={i}>{i}</span>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="wrap">
          <span className="eyebrow">Why it matters now</span>
          <h2>SOCI Has Moved from Awareness to Accountability</h2>
          <p className="lead">
            Responsible entities must keep a Critical Infrastructure Risk Management Program aligned to a recognised
            framework, and their boards attest to it every year.
          </p>
          <div className="obl">
            <div><span className="k">01</span><h3>Register</h3><p>Asset ownership and operational information kept current.</p><span className="when">ONGOING</span></div>
            <div><span className="k">02</span><h3>Report</h3><p>Significant cyber incidents to the ACSC.</p><span className="when">12 H / 72 H</span></div>
            <div><span className="k">03</span><h3>Maintain</h3><p>A written CIRMP with a recognised cyber framework.</p><span className="when">CONTINUOUS</span></div>
            <div><span className="k">04</span><h3>Attest</h3><p>Board-approved annual CIRMP report.</p><span className="when">ANNUALLY</span></div>
          </div>
          <h3 style={{ marginTop: 44 }}>Frameworks a CIRMP can align to</h3>
          <div className="chips lg" style={{ marginTop: 14 }}>
            {['SOCI Act 2018', 'AESCSF', 'IEC 62443', 'NIST CSF 2.0', 'ISO/IEC 27001', 'Essential Eight', 'C2M2'].map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <span className="eyebrow">How an engagement runs</span>
          <h2>We Start with the Plant, Not the Policy</h2>
          <div className="steps">
            <div className="step"><span className="tag">Assess</span><h3>Know where you stand</h3><p style={{ color: 'var(--muted)' }}>Map your assets and SOCI obligations, and baseline maturity against AESCSF, IEC 62443 or NIST CSF.</p></div>
            <div className="step"><span className="tag">Protect</span><h3>Close the highest-risk gaps fast</h3><p style={{ color: 'var(--muted)' }}>Deploy cloaking, passwordless access and segmentation, prioritised by the risk assessment, with no downtime.</p></div>
            <div className="step"><span className="tag">Prove</span><h3>Evidence for the board and regulator</h3><p style={{ color: 'var(--muted)' }}>Map every control back to your CIRMP and framework, ready for annual attestation and audit.</p></div>
          </div>
        </div>
      </section>
      <Band title="Need a SOCI or AESCSF Roadmap?" />
    </>
  )
}
