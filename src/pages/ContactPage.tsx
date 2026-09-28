import { useState } from 'react'
import { company } from '../content.ts'
import Banner from '../components/Banner.tsx'
import Placeholder from '../components/Placeholder.tsx'

const topics = [
  'SOCI & CIRMP compliance',
  'AESCSF assessment',
  'IEC 62443 assessment & design',
  'OT risk assessment',
  'OT cyber protection (zero trust)',
  'Secure remote access',
  'Incident response readiness',
]

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  return (
    <>
      <Banner
        image="water-wastewater"
        crumbs={[{ label: 'Contact' }]}
        title={
          <>
            Book an Appointment with an <span style={{ color: '#FF3B47' }}>OT Security Specialist</span>
          </>
        }
        text="Thirty minutes on your obligations, your systems and where to start. No obligation."
        button={false}
      />
      <section>
        <div className="wrap contact">
          {/* TODO: connect to a form backend / email service. */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSent(true)
            }}
          >
            {sent ? (
              <>
                <h2 style={{ fontSize: '1.8rem' }}>Thank you</h2>
                <p style={{ color: 'var(--muted)' }}>One of our specialists will be in touch within one business day to confirm your appointment.</p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Let's work together</h2>
                <p style={{ color: 'var(--muted)', marginTop: -8 }}>Fill in this form and one of our specialists will be in touch to confirm a time.</p>
                <div className="row2">
                  <label>First name <em>*</em><input name="firstName" required autoComplete="given-name" /></label>
                  <label>Last name <em>*</em><input name="lastName" required autoComplete="family-name" /></label>
                </div>
                <div className="row2">
                  <label>Email <em>*</em><input name="email" type="email" required autoComplete="email" /></label>
                  <label>Phone <em>*</em><input name="phone" type="tel" required autoComplete="tel" /></label>
                </div>
                <div className="row2">
                  <label>Organisation<input name="organisation" autoComplete="organization" /></label>
                  <label>
                    I'd like to discuss
                    <select name="topic">
                      {topics.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>Message<textarea name="message" rows={4} /></label>
                <button className="btn btn-blue" type="submit" style={{ justifySelf: 'start' }}>
                  Book an appointment
                </button>
              </>
            )}
          </form>
          <div className="cinfo">
            <div><b>Office</b>Unit 217, 14 Lexington Drive<br />Bella Vista NSW 2153</div>
            <div><b>Email</b>{company.email ? <a href={`mailto:${company.email}`}>{company.email}</a> : <Placeholder value="" label="email address" />}</div>
            <div><b>Phone</b>{company.phone ? <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a> : <Placeholder value="" label="phone number" />}</div>
            <div><b>Hours</b>Monday to Friday, 8.30am to 5.30pm AEST</div>
          </div>
        </div>
      </section>
    </>
  )
}
