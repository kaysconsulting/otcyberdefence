import { Link } from 'react-router-dom'
import { caseDetail, caseStudies, partner, sectors, stats, testimonials } from '../content.ts'
import Photo from '../components/Photo.tsx'
import Backdrop from '../components/Backdrop.tsx'
import CtaBand from '../components/CtaBand.tsx'
import { Arrow, ArrowCircle } from '../components/Icon.tsx'

const featured = caseStudies[1]
const featuredDetail = caseDetail[featured.title]

export default function Home() {
  return (
    <>
      {/* 1 · Full-bleed hero: who we are, in one line */}
      <section className="home-hero on-image">
        <Backdrop name="hero" eager />
        <div className="wrap">
          <div className="partner-badge">
            <span className="dot" />
            <span>
              Official Australian partner of <b>BlastWave</b> · BlastShield™ patented zero trust OT platform
            </span>
          </div>
          <h1>
            Compliance you can prove.
            <br />
            <span>Protection that's already proven.</span>
          </h1>
          <p className="lead">
            OT cybersecurity for the systems that run Australia's transport, energy, water and government
            infrastructure.
          </p>
          <div className="hero-actions">
            <Link to="/contact" className="btn btn-primary">
              Book a briefing <Arrow />
            </Link>
            <Link to="/case-studies" className="btn btn-ghost">
              See the evidence
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="wrap">
            {stats.map((s) => (
              <div key={s.label} className="stat">
                <b>
                  {s.value}
                  {s.sup && <sup>{s.sup}</sup>}
                </b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2 · Trust strip */}
      <div className="trust">
        <div className="wrap">
          <span className="mono">BlastShield™ is trusted by</span>
          <ul className="wordmarks">
            {partner.customers.slice(0, 5).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3 · What we do: two doors */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="mono eyebrow">What we do</div>
              <h2>Two services. One accountable partner.</h2>
            </div>
            <p className="lead">
              Advice without implementation leaves gaps. Technology without governance can't be proven. We deliver
              both.
            </p>
          </div>
          <div className="doors">
            <Link to="/consulting" className="door door-blue">
              <Photo name="advisory" alt="Engineer assessing industrial control equipment" width={560} ratio={16 / 8} />
              <div>
                <span className="mono num">01</span>
                <h3>OT Cyber Consulting</h3>
                <p>SOCI, AESCSF and IEC 62443, delivered by engineers who have secured safety-critical systems.</p>
                <ul>
                  <li>SOCI & CIRMP compliance</li>
                  <li>Framework maturity assessments</li>
                  <li>OT risk & segmentation design</li>
                </ul>
                <span className="go">
                  Explore consulting <ArrowCircle />
                </span>
              </div>
            </Link>
            <Link to="/protection" className="door door-navy">
              <Photo name="network" alt="Fibre connections into an industrial network switch" width={560} ratio={16 / 8} />
              <div>
                <span className="mono num">02</span>
                <h3>OT Cyber Protection</h3>
                <p>BlastShield™ hides critical assets from attackers and deploys without downtime.</p>
                <ul>
                  <li>Network cloaking</li>
                  <li>Passwordless MFA</li>
                  <li>Microsegmentation</li>
                </ul>
                <span className="go">
                  Explore protection <ArrowCircle />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 · Proof, over an industrial backdrop */}
      <section className="proof-band on-image">
        <Backdrop name="refinery" tone="left" />
        <div className="wrap feature-case">
          <div>
            <div className="mono eyebrow">Proven in the field</div>
            <h2>{featured.title}</h2>
            <p className="lead">{featured.body}</p>
            <Link to="/case-studies" className="btn btn-ghost">
              Read all four case studies <Arrow />
            </Link>
          </div>
          <div className="metric-stack glass">
            {featuredDetail.metrics.map((m) => (
              <div key={m.k}>
                <b>{m.v}</b>
                <span>{m.k}</span>
              </div>
            ))}
            <p className="attrib">BlastWave case study, manufacturing · blastwave.com</p>
          </div>
        </div>
      </section>

      {/* 5 · Quote on white */}
      <section className="quote-section">
        <div className="wrap">
          <figure className="pull-quote">
            <blockquote>“{testimonials[0].quote}”</blockquote>
            <figcaption>
              <b>{testimonials[0].big}</b> · {testimonials[0].bigSub}
              <span>
                {testimonials[0].who} · {testimonials[0].source}
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 6 · Find your sector */}
      <section className="light">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="mono eyebrow">Sectors</div>
              <h2>Built for the sectors SOCI protects</h2>
            </div>
            <Link to="/sectors" className="text-link">
              All sectors <Arrow />
            </Link>
          </div>
          <div className="tiles">
            {sectors.map((s) => (
              <Link key={s.slug} to={`/sectors/${s.slug}`} className="tile">
                <Photo name={s.photo} alt="" width={280} ratio={4 / 3} sizes="(max-width: 760px) 100vw, (max-width: 980px) 50vw, 280px" />
                <div>
                  <b>{s.name}</b>
                  <span>{s.summary}</span>
                  <ArrowCircle sm />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7 · Who does the work, over a site photo */}
      <section className="expertise-band on-image">
        <Backdrop name="engineers" tone="left" />
        <div className="wrap">
          <div className="panel">
            <div className="mono eyebrow">Our expertise</div>
            <h2>18+ years in safety-critical OT</h2>
            <p className="lead">
              Our practitioners have secured rail signalling, traction power, tunnels, SCADA and building systems on
              major Australian transport programs.
            </p>
            <ul className="checks">
              <li>ISA/IEC 62443 Approved Instructor</li>
              <li>ISO/IEC 27001 Lead Auditor</li>
              <li>AESCSF assessments for power, gas and renewables</li>
            </ul>
            <Link to="/expertise" className="btn btn-ghost">
              See our expertise <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
