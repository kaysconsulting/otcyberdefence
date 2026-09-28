import { Link } from 'react-router-dom'
import { SECTORS } from '../data.ts'
import { company } from '../content.ts'
import Placeholder from './Placeholder.tsx'

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div>
            <span className="flogo">
              <img src="/brand/otcd-logo.png" alt="OT Cyber Defence" />
            </span>
            <p>OT cybersecurity consulting and protection for Australian critical infrastructure.</p>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to="/expertise">Expertise</Link></li>
              <li><Link to="/case-studies">Case studies</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              <li><Link to="/consulting">OT Cyber Consulting</Link></li>
              <li><Link to="/protection">OT Cyber Protection</Link></li>
            </ul>
          </div>
          <div>
            <h4>Sectors</h4>
            <ul>
              {SECTORS.map((x) => (
                <li key={x.s}>
                  <Link to={`/sectors/${x.s}`}>{x.n}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>{company.address}</li>
              <li>{company.email ? <a href={`mailto:${company.email}`}>{company.email}</a> : <Placeholder value="" label="email address" />}</li>
              <li>{company.phone ? <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a> : <Placeholder value="" label="phone number" />}</li>
            </ul>
          </div>
        </div>
        <div className="fbot">
          <span>
            © {new Date().getFullYear()} {company.legalName}
          </span>
          <span>Securing OT Systems</span>
        </div>
      </div>
    </footer>
  )
}
