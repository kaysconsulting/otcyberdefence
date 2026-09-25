import { useState } from 'react'
import { company, formServices } from '../content.ts'
import Placeholder from './Placeholder.tsx'
import Title from './Title.tsx'

// Kays "Let's work together" form.
export default function Contact() {
  const [sent, setSent] = useState(false)
  return (
    <section className="work-together" id="contact">
      <div className="wrap">
        <Title text="Let’s {work} together" />
        <p className="sub">Simply fill in this form and one of our specialists will be in touch.</p>
        {sent ? (
          <div className="sent">
            <h3>Thank you</h3>
            <p>We will be in touch within one business day.</p>
          </div>
        ) : (
          /* TODO: connect to a form backend / email service. */
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSent(true)
            }}
          >
            <div className="two">
              <label>
                First Name <i>*</i>
                <input name="firstName" required />
              </label>
              <label>
                Last Name <i>*</i>
                <input name="lastName" required />
              </label>
            </div>
            <div className="two">
              <label>
                Email <i>*</i>
                <input name="email" type="email" required />
              </label>
              <label>
                Phone <i>*</i>
                <input name="phone" type="tel" required />
              </label>
            </div>
            <label>
              Organisation
              <input name="organisation" />
            </label>
            <fieldset>
              <legend>Our Services</legend>
              {formServices.map((s) => (
                <label key={s} className="check">
                  <input type="checkbox" name="services" value={s} /> {s}
                </label>
              ))}
            </fieldset>
            <label>
              Message
              <textarea name="message" rows={5} />
            </label>
            <button className="btn" type="submit">
              Submit
            </button>
          </form>
        )}
        <div className="contact-list">
          <div>
            <b>Office</b>
            {company.address}
          </div>
          <div>
            <b>Email</b>
            {company.email ? <a href={`mailto:${company.email}`}>{company.email}</a> : <Placeholder value="" label="email address" />}
          </div>
          <div>
            <b>Phone</b>
            {company.phone ? <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a> : <Placeholder value="" label="phone number" />}
          </div>
        </div>
      </div>
    </section>
  )
}
