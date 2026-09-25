import { Link } from 'react-router-dom'
import { caseDetail, caseStudies, partner, sectors, stats, testimonials } from '../content.ts'
import { photos } from '../media.ts'
import CtaBand from '../components/CtaBand.tsx'

const featured = caseStudies[1]
const featuredDetail = caseDetail[featured.title]

export default function Home() {
  return (
    <>
      {/* 1 · Who we are, in one sentence */}
      <section className="home-hero" style={{ backgroundImage: `url(${photos.hero(2200)})` }}>
        <div className="wrap">
          <div className="partner-badge">
            <span className="dot" />
            <span>
              Official Australian partner of <b>BlastWave</b> · BlastShield™ patented zero trust OT platform
            </span>
          </div>
          <h1>
            Compliance you can prove. <span>Protection that's already proven.</span>
          </h1>
          <p className="lead">
            OT cybersecurity for the systems that run Australia's transport, energy, water and government
            infrastructure.
          </p>
          <Link to="/contact" className="btn btn-primary">
            Book a briefing →
          </Link>
        </div>
      </section>

      {/* 2 · Why believe us */}
      <div className="stats">
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
      <div className="trust">
        <div className="wrap">
          <span className="mono">BlastShield™ is trusted by</span>
          <ul>
            {partner.customers.slice(0, 6).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3 · What we do: two doors */}
      <section className="light">
        <div className="wrap">
          <div className="mono eyebrow">What we do</div>
          <h2>Two services. One accountable partner.</h2>
          <div className="doors">
            <Link to="/consulting" className="door">
              <img src={photos.control(1200)} alt="Industrial control room" loading="lazy" />
              <div>
                <span className="mono num">01</span>
                <h3>OT Cyber Consulting</h3>
                <p>SOCI, AESCSF and IEC 62443, delivered by engineers who have secured safety-critical systems.</p>
                <ul>
                  <li>SOCI & CIRMP compliance</li>
                  <li>Framework maturity assessments</li>
                  <li>OT risk & segmentation design</li>
                </ul>
                <span className="go">Explore consulting →</span>
              </div>
            </Link>
            <Link to="/protection" className="door">
              <img src={photos.network(1200)} alt="Fibre connections into an industrial network switch" loading="lazy" />
              <div>
                <span className="mono num">02</span>
                <h3>OT Cyber Protection</h3>
                <p>BlastShield™ hides critical assets from attackers and deploys without downtime.</p>
                <ul>
                  <li>Network cloaking</li>
                  <li>Passwordless MFA</li>
                  <li>Microsegmentation</li>
                </ul>
                <span className="go">Explore protection →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 · One piece of proof, with the rest a click away */}
      <section>
        <div className="wrap feature-case">
          <div>
            <div className="mono eyebrow">Proven in the field</div>
            <h2>{featured.title}</h2>
            <p className="lead">{featured.body}</p>
            <Link to="/case-studies" className="text-link">
              Read all four case studies →
            </Link>
          </div>
          <div className="metric-stack">
            {featuredDetail.metrics.map((m) => (
              <div key={m.k}>
                <b>{m.v}</b>
                <span>{m.k}</span>
              </div>
            ))}
            <p className="attrib">BlastWave case study, manufacturing. Source: blastwave.com</p>
          </div>
        </div>
        <div className="wrap">
          <div className="quote">
            <div>
              <q>{testimonials[0].quote}</q>
              <small>
                {testimonials[0].who} · {testimonials[0].source}
              </small>
            </div>
            <div className="big">
              {testimonials[0].big}
              <span>{testimonials[0].bigSub}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · Find your sector */}
      <section className="light">
        <div className="wrap">
          <div className="mono eyebrow">Sectors</div>
          <h2>Built for the sectors SOCI protects</h2>
          <div className="tiles">
            {sectors.map((s) => (
              <Link key={s.slug} to={`/sectors/${s.slug}`} className="tile">
                <img src={photos[s.photo](700)} alt="" loading="lazy" />
                <div>
                  <b>{s.name}</b>
                  <span>{s.summary}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · Who does the work */}
      <section>
        <div className="wrap split">
          <img className="split-img" src={photos.engineers(1200)} alt="Engineers reviewing plans on site" loading="lazy" />
          <div>
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
            <Link to="/expertise" className="text-link">
              See our expertise →
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
