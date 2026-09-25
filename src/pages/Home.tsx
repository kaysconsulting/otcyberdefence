import { Link } from 'react-router-dom'
import { caseStudies, partner, sectors, stats, testimonials } from '../content.ts'
import Photo from '../components/Photo.tsx'
import Backdrop from '../components/Backdrop.tsx'
import CtaBand from '../components/CtaBand.tsx'
import { Arrow, ArrowCircle, External } from '../components/Icon.tsx'
import { ArrowRight, CircleCheck, EyeOff, Factory, FileText, Fingerprint, Gauge, LayoutGrid, Network, ShieldCheck } from 'lucide-react'

const featured = caseStudies[1]

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
              <Photo name="advisory" alt="" width={600} ratio={4 / 5} sizes="(max-width: 980px) 100vw, 600px" />
              <div className="door-top">
                <span className="door-label">01 · OT Cyber Consulting</span>
                <span className="door-proof">
                  <b>18+ yrs</b> safety-critical OT
                </span>
              </div>
              <div className="door-body">
                <h3>Know where you stand. Prove it to your board.</h3>
                <p>
                  SOCI, AESCSF and IEC 62443 programs led by engineers who have secured safety-critical rail and energy
                  systems.
                </p>
                <ul className="door-points">
                  <li>
                    <ShieldCheck size={18} strokeWidth={1.75} /> SOCI & CIRMP compliance
                  </li>
                  <li>
                    <Gauge size={18} strokeWidth={1.75} /> Framework maturity assessments
                  </li>
                  <li>
                    <Network size={18} strokeWidth={1.75} /> OT risk & segmentation design
                  </li>
                </ul>
                <span className="door-cta">
                  Explore consulting <ArrowRight size={18} strokeWidth={2} />
                </span>
              </div>
            </Link>
            <Link to="/protection" className="door door-navy">
              <Photo name="network" alt="" width={600} ratio={4 / 5} sizes="(max-width: 980px) 100vw, 600px" />
              <div className="door-top">
                <span className="door-label">02 · OT Cyber Protection</span>
                <span className="door-proof">
                  <b>Patented</b> zero trust
                </span>
              </div>
              <div className="door-body">
                <h3>Make your critical assets invisible to attackers.</h3>
                <p>
                  BlastShield™ from BlastWave, deployed and supported locally. Protects even unpatchable systems, with no
                  downtime and no network redesign.
                </p>
                <ul className="door-points">
                  <li>
                    <EyeOff size={18} strokeWidth={1.75} /> Network cloaking
                  </li>
                  <li>
                    <Fingerprint size={18} strokeWidth={1.75} /> Passwordless MFA
                  </li>
                  <li>
                    <LayoutGrid size={18} strokeWidth={1.75} /> Microsegmentation
                  </li>
                </ul>
                <span className="door-cta">
                  Explore protection <ArrowRight size={18} strokeWidth={2} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 · Proof: one case study, told as a before/after */}
      <section className="proof-band on-image">
        <Backdrop name="refinery" tone="left" />
        <div className="wrap spotlight">
          <div className="spot-copy">
            <div className="mono eyebrow">Proven in the field</div>
            <span className="spot-tag">
              <Factory size={15} strokeWidth={1.75} /> Manufacturing · BlastWave case study
            </span>
            <h2>{featured.title}</h2>
            <p className="lead">{featured.body}</p>
            <div className="hero-actions">
              <a href={featured.href} target="_blank" rel="noopener noreferrer" className="btn btn-white">
                Read the case study <FileText size={16} strokeWidth={2} />
              </a>
              <Link to="/case-studies" className="btn btn-ghost">
                All four case studies <Arrow />
              </Link>
            </div>
          </div>

          <figure className="result-card" aria-label="Outcome of the cyber attack">
            <div className="rc-head">
              <span className="mono">The result</span>
              <span className="rc-live">
                <span className="dot" /> Protected line stayed online
              </span>
            </div>
            <div className="rc-hero">
              <b>0</b>
              <span>
                hours of downtime on the line
                <br />
                protected by BlastShield™
              </span>
            </div>

            <div className="rc-compare">
              <div>
                <div className="rc-row">
                  <span>Protected line</span>
                  <b className="ok">Kept running</b>
                </div>
                <div className="bar">
                  <i className="bar-ok" />
                </div>
              </div>
              <div>
                <div className="rc-row">
                  <span>Rest of the plant</span>
                  <b className="bad">Offline 2+ days</b>
                </div>
                <div className="bar">
                  <i className="bar-bad" />
                </div>
              </div>
            </div>

            <div className="rc-foot">
              <div className="rc-cost">
                <b>US$4.8M</b>
                <span>revenue lost in unprotected areas</span>
              </div>
              <div className="rc-outcome">
                <CircleCheck size={20} strokeWidth={1.75} />
                <span>Management then extended BlastShield™ across the whole network.</span>
              </div>
            </div>
            <figcaption>
              Source:{' '}
              <a href={featured.href} target="_blank" rel="noopener noreferrer">
                BlastWave manufacturing case study <External />
              </a>
            </figcaption>
          </figure>
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
