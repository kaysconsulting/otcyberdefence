import { Link } from 'react-router-dom'
import Banner from '../components/Banner.tsx'
import Band from '../components/Band.tsx'

const caps = [
  { ic: '◉', t: 'Network cloaking', p: 'HMIs, PLCs and RTUs become invisible to scanners and attackers.', li: ['Assets sit on a cryptographically enforced overlay; the existing network stays as it is.', 'Unauthorised scanners see no open ports and no devices.'] },
  { ic: '✦', t: 'Passwordless MFA', p: 'Stolen and shared passwords are removed from the equation.', li: ['Phishing-resistant login with on-device biometrics.', 'Every connection verified before it is established.'] },
  { ic: '▦', t: 'Microsegmentation', p: 'Contain a breach and stop lateral movement, without complex firewall rules.', li: ['Software-defined zones and conduits between devices.', 'A virtual air-gap for legacy equipment that cannot be patched.'] },
  { ic: '⇄', t: 'Secure remote access', p: 'Replace VPNs and jump boxes with recorded, zero trust access.', li: ['Controlled vendor and engineer access with session recording.', 'Remote diagnosis cuts routine site visits.'] },
]

const comps = [
  ['Security Gateway', 'Deployed as a VM, container or appliance in front of OT assets.'],
  ['Orchestrator', 'Central, real-time policy, on premises or in the cloud.'],
  ['Authenticator', 'Passwordless, phishing-resistant MFA on a mobile device.'],
  ['Client & Agent', 'Verified connections for Windows, macOS and Linux.'],
  ['Secure Remote Desktop', 'Vendor and engineer access with full session recording.'],
]

export default function Protection() {
  return (
    <>
      <Banner
        image="energy-electricity"
        crumbs={[{ label: 'Protection' }]}
        eyebrow="OT Cyber Protection"
        title="Make Critical Assets Invisible to Attackers"
        text="We design, deploy and support a patented zero trust OT platform that already protects more than 5,000 sites in 22 countries, including unpatchable legacy systems, without downtime."
      />

      <div className="stats">
        <div className="wrap">
          <div className="stat"><b>5,000<i>+</i></b><span>ICS/OT sites protected</span></div>
          <div className="stat"><b>22</b><span>Countries</span></div>
          <div className="stat"><b>500M<i>+</i></b><span>Device hours of attack prevention</span></div>
          <div className="stat"><b>4 hrs</b><span>To segment 97 devices</span></div>
        </div>
      </div>

      <section>
        <div className="wrap">
          <span className="eyebrow">How it works</span>
          <h2>Attackers Can't Hack What They Can't See</h2>
          <p className="lead">Reconnaissance is the first step in every OT attack. We remove it, then verify every connection before it is made.</p>
          <div className="caps">
            <div className="diagram" role="img" aria-label="Attackers see nothing on a cloaked OT network, while authorised engineers connect with passwordless MFA through a security gateway to segmented assets.">
              <svg viewBox="0 0 520 380" fontFamily="Titillium Web,sans-serif">
                <defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="#fff" /></marker></defs>
                <rect x="18" y="40" width="120" height="56" rx="8" fill="#2A6BC0" stroke="#FF3B47" strokeWidth="2" />
                <text x="78" y="64" fill="#fff" fontSize="14" fontWeight="700" textAnchor="middle">Attacker</text>
                <text x="78" y="82" fill="#B9C8DA" fontSize="11" textAnchor="middle">scans, stolen creds</text>
                <path d="M138 68h90" stroke="#FF3B47" strokeWidth="2" strokeDasharray="5 5" />
                <text x="183" y="58" fill="#FF8A92" fontSize="11" textAnchor="middle">nothing to see</text>
                <rect x="18" y="262" width="120" height="56" rx="8" fill="#2A6BC0" stroke="#fff" strokeWidth="2" />
                <text x="78" y="286" fill="#fff" fontSize="14" fontWeight="700" textAnchor="middle">Engineer</text>
                <text x="78" y="304" fill="#B9C8DA" fontSize="11" textAnchor="middle">passwordless MFA</text>
                <path d="M138 290h84" stroke="#fff" strokeWidth="2" markerEnd="url(#a)" />
                <rect x="230" y="20" width="272" height="340" rx="12" fill="#1F5AA6" stroke="#5B8BD0" strokeDasharray="6 6" />
                <text x="366" y="46" fill="#9BBBE6" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="1.5">CLOAKED OT NETWORK</text>
                <g fontSize="13" fill="#fff" textAnchor="middle">
                  <rect x="252" y="70" width="108" height="76" rx="8" fill="#1D58A7" /><text x="306" y="104" fontWeight="700">HMI</text><text x="306" y="122" fill="#DCE6F2" fontSize="10">Segment A</text>
                  <rect x="374" y="70" width="108" height="76" rx="8" fill="#1D58A7" /><text x="428" y="104" fontWeight="700">PLC</text><text x="428" y="122" fill="#DCE6F2" fontSize="10">Segment B</text>
                  <rect x="252" y="160" width="108" height="76" rx="8" fill="#1D58A7" /><text x="306" y="194" fontWeight="700">RTU</text><text x="306" y="212" fill="#DCE6F2" fontSize="10">Segment C</text>
                  <rect x="374" y="160" width="108" height="76" rx="8" fill="#CD0312" /><text x="428" y="194" fontWeight="700">Legacy SCADA</text><text x="428" y="212" fill="#FFD6D9" fontSize="10">virtual air-gap</text>
                  <rect x="252" y="262" width="230" height="56" rx="8" fill="#fff" /><text x="367" y="286" fontWeight="700" fill="#1F5AA6">Security Gateway</text><text x="367" y="304" fill="#3A4F66" fontSize="10">identity-based policy, per-device segments</text>
                </g>
              </svg>
            </div>
            <div>
              {caps.map((c, k) => (
                <details key={c.t} className="cap" open={k === 0}>
                  <summary>
                    <span className="ic">{c.ic}</span>
                    <div>
                      <h3>{c.t}</h3>
                      <p>{c.p}</p>
                    </div>
                  </summary>
                  <ul>
                    {c.li.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="wrap">
          <span className="eyebrow">The platform</span>
          <h2>Five Components, One Zero Trust Fabric</h2>
          <div className="comp">
            {comps.map(([h, p]) => (
              <div key={h}>
                <h4>{h}</h4>
                <p>{p}</p>
              </div>
            ))}
          </div>
          <h3 style={{ marginTop: 44 }}>Standards and regulations supported</h3>
          <div className="chips lg" style={{ marginTop: 14 }}>
            {['IEC 62443', 'SOCI Act', 'Essential Eight', 'NIST CSF 2.0', 'NERC CIP', 'NIS2', 'EU Cyber Resilience Act'].map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <div className="quote">
            <div>
              <q>I couldn't believe how easy it was to install. We configured 97 devices into 95 individual segments in four hours.</q>
              <small>Platform customer, United States</small>
            </div>
            <div className="big"><b>4 hrs</b><span>97 devices · 95 segments</span></div>
          </div>
          <p style={{ marginTop: 26 }}>
            <Link to="/case-studies" className="more">See the results in four case studies →</Link>
          </p>
        </div>
      </section>
      <Band title="See It on Your Own Network" sub="A live demonstration against a representative OT environment, run by our team." />
    </>
  )
}
