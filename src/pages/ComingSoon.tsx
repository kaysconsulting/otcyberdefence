import { Mail, MapPin, Phone } from 'lucide-react'
import { company } from '../content.ts'
import Title from '../components/Title.tsx'
import Chevrons from '../components/Chevrons.tsx'

// Shown on the live domain while VITE_SITE_MODE=coming-soon. Contact lines only appear once filled in content.ts.
export default function ComingSoon() {
  return (
    <main className="soon">
      <Chevrons dir="left" color="blue" className="soon-chev-top" />
      <div className="soon-card">
        <img className="soon-logo" src="/brand/otcd-logo.png" alt="OT Cyber Defence · Securing OT Systems" width={487} height={260} />
        <span className="soon-badge">New website coming soon</span>
        <Title as="h1" text="Your {Trusted Partner} in OT Cybersecurity" />
        <p className="lead">
          OT security consulting and field-proven protection for Australia's critical infrastructure: SOCI and AESCSF
          compliance, IEC 62443 assessment and design, and zero trust protection for ICS and SCADA systems.
        </p>
        <ul className="soon-tags">
          <li>SOCI &amp; CIRMP</li>
          <li>AESCSF</li>
          <li>IEC 62443</li>
          <li>OT Protection</li>
        </ul>
        <p className="partner-line">
          Official Australian partner of <b>BlastWave</b> · BlastShield™ patented zero trust OT platform
        </p>
        <div className="soon-contact">
          {company.email && (
            <a href={`mailto:${company.email}`}>
              <Mail size={18} strokeWidth={1.75} /> {company.email}
            </a>
          )}
          {company.phone && (
            <a href={`tel:${company.phone.replace(/\s/g, '')}`}>
              <Phone size={18} strokeWidth={1.75} /> {company.phone}
            </a>
          )}
          <span>
            <MapPin size={18} strokeWidth={1.75} /> {company.address}
          </span>
        </div>
        {company.email && (
          <a className="btn" href={`mailto:${company.email}?subject=Briefing%20request`}>
            Book an appointment
          </a>
        )}
      </div>
      <Chevrons className="soon-chev-bottom" />
      <p className="soon-foot">
        © {new Date().getFullYear()} {company.legalName}
        {company.acn && ` · ACN ${company.acn}`}
      </p>
    </main>
  )
}
