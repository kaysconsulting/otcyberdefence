import { useState } from 'react'
import { company } from '../content.ts'
import Placeholder from './Placeholder.tsx'

export default function Contact() {
  const [sent, setSent] = useState(false)

  return (
    <section className="cta" id="contact">
      <div className="wrap">
        <div>
          <div className="mono eyebrow">Book a briefing</div>
          <h1>Start with a 30-minute briefing</h1>
          <p className="lead">
            Tell us a little about your organisation. A specialist will contact you within one business day to arrange
            a time.
          </p>
          <div className="contact-list">
            <div>
              <b>Office</b>
              <br />
              {company.address}
            </div>
            <div>
              <b>Email</b>
              <br />
              {company.email ? <a href={`mailto:${company.email}`}>{company.email}</a> : <Placeholder value="" label="email address" />}
            </div>
            <div>
              <b>Phone</b>
              <br />
              {company.phone ? <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a> : <Placeholder value="" label="phone number" />}
            </div>
          </div>
        </div>
        {/* TODO: wire to a real endpoint (email service / form backend). Currently only shows a thank-you. */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          {sent ? (
            <>
              <h3>Thank you</h3>
              <p style={{ color: 'var(--muted)' }}>We will be in touch within one business day.</p>
            </>
          ) : (
            <>
              <div className="two">
                <label>
                  Name
                  <input name="name" required />
                </label>
                <label>
                  Organisation
                  <input name="organisation" required />
                </label>
              </div>
              <div className="two">
                <label>
                  Email
                  <input name="email" type="email" required />
                </label>
                <label>
                  Phone
                  <input name="phone" type="tel" />
                </label>
              </div>
              <label>
                How can we help?
                <textarea name="message" rows={4} />
              </label>
              <button className="btn btn-primary" type="submit" style={{ border: 0, cursor: 'pointer', justifyContent: 'center' }}>
                Request a briefing →
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  )
}
