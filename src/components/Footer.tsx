import { Link } from 'react-router-dom'
import { company, sectors } from '../content.ts'
import Placeholder from './Placeholder.tsx'
import Logo from './Logo.tsx'

export default function Footer() {
  return (
    <footer>
      <div className="wrap foot-grid">
        <div>
          <Logo />
          <p>
            OT cybersecurity consulting and protection for Australian critical infrastructure. Official Australian partner
            of BlastWave, Inc.
          </p>
        </div>
        <div>
          <h2>Company</h2>
          <Link to="/expertise">Expertise</Link>
          <Link to="/case-studies">Case studies</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h2>Services</h2>
          <Link to="/consulting">OT Cyber Consulting</Link>
          <Link to="/protection">OT Cyber Protection</Link>
          <Link to="/sectors">Sectors</Link>
        </div>
        <div>
          <h2>Sectors</h2>
          {sectors.slice(0, 4).map((s) => (
            <Link key={s.slug} to={`/sectors/${s.slug}`}>
              {s.name}
            </Link>
          ))}
        </div>
        <div>
          <h2>Contact</h2>
          <span>{company.address}</span>
          <span>{company.email || <Placeholder value="" label="email address" />}</span>
          <span>{company.phone || <Placeholder value="" label="phone number" />}</span>
        </div>
      </div>
      <div className="wrap foot-base">
        <span>
          © {new Date().getFullYear()} {company.legalName} · ACN <Placeholder value={company.acn} label="ACN" />
        </span>
        <p className="fine">
          * BlastWave and BlastShield are trademarks of BlastWave, Inc. Customer names, device-hour figures, case studies
          and testimonials relate to BlastWave deployments and are drawn from BlastWave's published materials
          (blastwave.com). Organisations listed under Expertise are where our team members have held roles and do not
          imply endorsement.
        </p>
      </div>
    </footer>
  )
}
