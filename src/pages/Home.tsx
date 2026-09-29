import { Link } from 'react-router-dom'
import { FAQS, SECTORS } from '../data.ts'
import { img, srcSet } from '../media.ts'
import HeroVideo from '../components/HeroVideo.tsx'
import SectorCard from '../components/SectorCard.tsx'

export default function Home() {
  return (
    <>
      <section className="hero" style={{ padding: 0 }}>
        <HeroVideo />
        <div className="wrap">
          <h1>
            Your <span className="red">Trusted Partner</span> in Operational Technology (OT) Cybersecurity
          </h1>
          <p>
            Proven OT protection, now in Australia. Already securing more than 5,000 industrial sites across 22 countries,
            and backed by specialists who know SOCI, AESCSF and IEC 62443.
          </p>
          <div className="ctas">
            <Link to="/contact" className="btn btn-red">
              Book an appointment
            </Link>
            <Link to="/case-studies" className="btn btn-line">
              See the evidence
            </Link>
          </div>
        </div>
      </section>

      <div className="stats">
        <div className="wrap">
          <div className="stat"><b>5,000<i>+</i></b><span>ICS/OT sites protected</span></div>
          <div className="stat"><b>22</b><span>Countries with live deployments</span></div>
          <div className="stat"><b>500M<i>+</i></b><span>Device hours of attack prevention</span></div>
          <div className="stat"><b>0</b><span>Downtime to deploy</span></div>
        </div>
      </div>
      <div className="stats-note">Global deployment figures for the zero trust OT platform we deliver with our US technology partner.</div>

      <section>
        <div className="wrap">
          <div className="center">
            <span className="eyebrow">What we do</span>
            <h2>Two Ways We Secure Your Operations</h2>
            <p className="lead">
              Advice that gets your board to sign-off. Technology that stops attackers reaching your plant. Use either, or
              bring them together.
            </p>
          </div>
          <div className="duo">
            <Link to="/consulting" className="svc svc-white">
              <span className="num">01 · Consulting</span>
              <h3>OT Cyber Consulting</h3>
              <p>Governance, risk and compliance built for operational technology, not stretched from IT.</p>
              <ul>
                <li>SOCI Act and CIRMP compliance</li>
                <li>AESCSF, IEC 62443 and NIST CSF assessments</li>
                <li>OT risk, architecture and board advisory</li>
              </ul>
              <span className="go">Explore consulting →</span>
            </Link>
            <Link to="/protection" className="svc svc-blue">
              <span className="num">02 · Protection</span>
              <h3>OT Cyber Protection</h3>
              <p>A proven zero trust platform that makes critical assets invisible to attackers, deployed with no downtime.</p>
              <ul>
                <li>Network cloaking for PLCs, RTUs and HMIs</li>
                <li>Passwordless, phishing-resistant access</li>
                <li>Microsegmentation and a virtual air-gap for legacy systems</li>
              </ul>
              <span className="go">Explore protection →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="wrap story">
          <div>
            <span className="eyebrow">Proven overseas. Now protecting Australia.</span>
            <h2>We Didn't Build an Experiment. We Brought What Already Works.</h2>
            <p className="lead">
              Critical infrastructure can't be a test bed. So we partnered with a US technology leader whose zero trust OT
              platform already protects more than 5,000 industrial sites in 22 countries, from energy producers and water
              utilities to manufacturers, ports and defence facilities.
            </p>
            <div className="pillars3">
              <div className="p3"><span className="n">1</span><div><h3>Proven at scale</h3><p>Over 500 million device hours of attack prevention in live plants, not labs.</p></div></div>
              <div className="p3"><span className="n">2</span><div><h3>Built for OT</h3><p>Protects unpatchable legacy systems without re-addressing the network or stopping production.</p></div></div>
              <div className="p3"><span className="n">3</span><div><h3>Delivered locally</h3><p>Designed, deployed and supported by Australian specialists, and mapped to your SOCI obligations.</p></div></div>
            </div>
          </div>
          <div className="story-img">
            <img src={img('control-room', 1200)} srcSet={srcSet('control-room')} sizes="(max-width:1024px) 100vw, 560px" alt="Technicians operating an industrial control room" loading="lazy" />
            <div className="badge"><b>22</b><span>countries, now including Australia</span></div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <span className="eyebrow">Proven in the field</span>
          <h2>Real Results from Real Plants</h2>
          <div className="hl">
            <div><b>0 hrs</b><p>Downtime on the protected production line while a cyber attack shut the rest of the plant for two days.</p></div>
            <div><b>20,000</b><p>Devices segmented across hundreds of remote oil and gas sites, integrated in under a month.</p></div>
            <div><b>10 min</b><p>To replace a legacy VPN with zero trust access across two continents.</p></div>
          </div>
          <p style={{ marginTop: 26 }}>
            <Link to="/case-studies" className="more">Read the case studies →</Link>
          </p>
        </div>
      </section>

      <section className="alt">
        <div className="wrap">
          <div className="center">
            <span className="eyebrow">Sector expertise</span>
            <h2>Built for the Sectors SOCI Protects</h2>
          </div>
          <div className="sectors">
            {SECTORS.map((x) => (
              <SectorCard key={x.s} x={x} />
            ))}
          </div>
          <p className="center" style={{ marginTop: 30 }}>
            <Link to="/sectors" className="more">All sectors →</Link>
          </p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="center">
            <span className="eyebrow">FAQs</span>
            <h2>
              OT Cyber Defence <span className="red">FAQs</span>
            </h2>
          </div>
          <div className="faq">
            {FAQS.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
