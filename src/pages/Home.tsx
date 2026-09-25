import { Link } from 'react-router-dom'
import { EyeOff, Fingerprint, LayoutGrid, ScreenShare } from 'lucide-react'
import { caseDetail, caseStudies, partner, sectors, testimonials } from '../content.ts'
import Title from '../components/Title.tsx'
import Chevrons from '../components/Chevrons.tsx'
import Photo from '../components/Photo.tsx'
import PurdueDiagram from '../components/PurdueDiagram.tsx'
import Faq from '../components/Faq.tsx'
import Contact from '../components/Contact.tsx'
import { Arrow, External } from '../components/Icon.tsx'

const services = [
  {
    to: '/consulting',
    title: 'OT Cyber Consulting',
    body: 'Expert guidance on SOCI, AESCSF and IEC 62443. We assess your OT security posture, find the gaps and build a practical, risk-based program your board can sign off.',
  },
  {
    to: '/protection',
    title: 'OT Cyber Protection',
    body: 'As the official Australian partner of BlastWave, we deploy the patented BlastShield™ platform to hide critical assets from attackers, with no downtime.',
  },
  {
    to: '/consulting',
    title: 'Critical Infrastructure Compliance',
    body: 'CIRMP development, annual board reporting and incident reporting readiness under the Security of Critical Infrastructure Act 2018.',
  },
  {
    to: '/sectors',
    title: 'Sector Specialists',
    body: 'Rail and transport, aviation, energy, water, ports, mining and government: the sectors SOCI protects.',
  },
]

const benefits = [
  { icon: EyeOff, title: 'Network Cloaking', body: 'Make PLCs, RTUs and HMIs invisible to scanners and attackers.' },
  { icon: Fingerprint, title: 'Passwordless MFA', body: 'Remove stolen and shared passwords from the equation.' },
  { icon: LayoutGrid, title: 'Microsegmentation', body: 'Contain a breach and stop lateral movement across the plant.' },
  { icon: ScreenShare, title: 'Secure Remote Access', body: 'Replace VPNs with recorded, zero trust access for vendors.' },
]

const featured = caseStudies[1]
const metrics = caseDetail[featured.title].metrics

export default function Home() {
  return (
    <>
      {/* Hero: the Kays banner composition */}
      <section className="k-hero">
        <Chevrons dir="left" color="blue" className="k-hero-chev-top" />
        <div className="k-hero-img">
          <img src="/brand/hero-visual.png" alt="Phone showing a security shield and padlock" width={471} height={313} />
        </div>
        <div className="wrap k-hero-grid">
          <div className="k-hero-copy">
            <Title as="h1" text="Your {Trusted Partner} in OT Cybersecurity and Critical Infrastructure Compliance." />
            <p className="lead">
              Tailored OT security consulting and field-proven protection for Australia's transport, energy, water and
              government infrastructure.
            </p>
            <div className="btn-row">
              <Link to="/contact" className="btn">
                Contact Us
              </Link>
              <Link to="/case-studies" className="btn btn-outline">
                See the evidence
              </Link>
            </div>
            <p className="partner-line">
              Official Australian partner of <b>BlastWave</b> · BlastShield™ patented zero trust OT platform
            </p>
          </div>
        </div>
        <Chevrons className="k-hero-chev-bottom" />
      </section>

      {/* Services grid, as on the original home page */}
      <section className="k-services">
        <div className="wrap">
          <div className="svc-grid">
            {services.map((s) => (
              <Link key={s.title} to={s.to} className="svc">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <span className="more-link">
                  Learn more <Arrow />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits row with line icons */}
      <section className="k-benefits">
        <div className="wrap">
          <Title text="Must-Know OT Security {Benefits}" />
          <div className="ben-grid">
            {benefits.map((b) => (
              <div key={b.title} className="ben">
                <div className="ben-head">
                  <b.icon size={40} strokeWidth={1.25} />
                  <h3>{b.title}</h3>
                </div>
                <p>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach block (image left, text right), mirroring "Our Approach to Essential Eight Assessment" */}
      <section className="k-approach">
        <div className="wrap approach-grid">
          <PurdueDiagram />
          <div>
            <Title text="Our Approach to {IEC 62443 and SOCI} Assessment" />
            <p>
              We map your real architecture into zones and conduits, assess each against IEC 62443 and your SOCI
              obligations, and deliver a prioritised roadmap that engineering can implement and your board can attest to.
            </p>
            <ol className="k-steps">
              <li>
                <b>Assess.</b> Asset visibility, risk and maturity against AESCSF, IEC 62443 or NIST CSF.
              </li>
              <li>
                <b>Protect.</b> Close the highest-risk gaps first, with BlastShield™ and practical controls.
              </li>
              <li>
                <b>Prove.</b> Map every control to your CIRMP, ready for annual attestation and audit.
              </li>
            </ol>
            <Link to="/consulting" className="btn">
              Our consulting services
            </Link>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className="k-proof">
        <div className="wrap">
          <Title text="Proven in the {Field}" />
          <p className="sub">{featured.title}. BlastWave case study, manufacturing.</p>
          <div className="proof-grid">
            {metrics.map((m) => (
              <div key={m.k} className="proof-stat">
                <b>{m.v}</b>
                <span>{m.k}</span>
              </div>
            ))}
          </div>
          <blockquote className="k-quote">
            “{testimonials[0].quote}”<cite>{testimonials[0].who}</cite>
          </blockquote>
          <div className="trusted">
            <span>BlastShield™ is trusted by</span>
            {partner.customers.slice(0, 5).map((c) => (
              <b key={c}>{c}</b>
            ))}
          </div>
          <p className="center-links">
            <Link to="/case-studies" className="more-link">
              Read all four case studies <Arrow />
            </Link>
            <a href={featured.href} target="_blank" rel="noopener noreferrer" className="more-link">
              Original case study (PDF) <External />
            </a>
          </p>
        </div>
      </section>

      {/* Specialist areas, like the original four image cards */}
      <section className="k-specialist">
        <div className="wrap">
          <Title text="Critical Infrastructure {Sectors}" />
          <div className="spec-grid">
            {sectors.slice(0, 4).map((s) => (
              <Link key={s.slug} to={`/sectors/${s.slug}`} className="spec">
                <Photo name={s.photo} alt="" width={280} ratio={16 / 10} sizes="(max-width: 760px) 100vw, 280px" />
                <h3>{s.name}</h3>
                <p>{s.summary}</p>
              </Link>
            ))}
          </div>
          <p className="center-links">
            <Link to="/sectors" className="more-link">
              All sectors <Arrow />
            </Link>
          </p>
        </div>
      </section>

      <Faq />
      <Contact />
    </>
  )
}
