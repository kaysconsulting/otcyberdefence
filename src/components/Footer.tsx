import { Link } from 'react-router-dom'
import { company, navLinks } from '../content.ts'
import Placeholder from './Placeholder.tsx'

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div>
          <b style={{ color: 'var(--text)' }}>{company.legalName}</b> · ACN <Placeholder value={company.acn} label="ACN" />
          <br />
          {company.address}
          <br />
          Official Australian partner of BlastWave, Inc.
        </div>
        <nav className="foot-links" aria-label="Footer">
          {navLinks.map((l) => (
            <Link key={l.href} to={l.href}>
              {l.label}
            </Link>
          ))}
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
      <div className="wrap">
        <p className="fine">
          * BlastWave and BlastShield are trademarks of BlastWave, Inc. OT Cyber Defence is an official partner of
          BlastWave in Australia. Customer names, device-hour figures, case studies and testimonials relate to BlastWave
          deployments and are drawn from BlastWave's published materials (blastwave.com). Organisations listed under Our
          expertise are where our team members have held roles. They are listed to show experience and do not imply
          endorsement. Photography via Unsplash.
        </p>
        <div>© {new Date().getFullYear()} OT Cyber Defence. All rights reserved.</div>
      </div>
    </footer>
  )
}
