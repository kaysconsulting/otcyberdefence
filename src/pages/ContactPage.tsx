import { useState, type FormEvent } from 'react'
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

// Booking form: same backend as the Kays NDIS site (ash-be → POST /api/tickets/send-form-submission),
// which emails the enquiry to `options.to` with reply-to set to the visitor. 201 = sent.
// The backend's CORS list must include this site's domain (see ash-be src/main.ts).
const FORM_API = 'https://ash-be-z3x4.onrender.com/api/tickets/send-form-submission'
const WEBSITE_NAME = 'OT Cyber Defence'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = e.currentTarget
    if (!f.checkValidity()) {
      f.reportValidity()
      return
    }
    const d = new FormData(f)
    if (d.get('botcheck')) return // hidden honeypot: bots tick it, people never see it
    const v = (k: string) => String(d.get(k) ?? '').trim()
    const payload = {
      formData: {
        websiteName: WEBSITE_NAME,
        formName: 'Appointment Request',
        customerName: `${v('first_name')} ${v('last_name')}`.trim(),
        customerEmail: v('email'),
        subject: `Appointment request: ${v('service')}`,
        message: [
          `Organisation: ${v('organisation') || '-'}`,
          `Would like to discuss: ${v('service')}`,
          '',
          v('message') || '(no message)',
        ].join('\n'),
        phone: v('phone'),
        location: '',
      },
      options: { to: company.email, websiteName: WEBSITE_NAME },
    }
    setBusy(true)
    setMsg(null)
    try {
      const r = await fetch(FORM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (r.status === 201 || r.ok) {
        setSent(true)
        return
      }
      setMsg({
        t:
          r.status === 409
            ? 'We already have a request with these details. We will be in touch shortly.'
            : r.status === 400
              ? 'Please check your details and try again.'
              : 'Sorry, your request could not be sent. Please try again, or call or email us directly.',
        ok: r.status === 409,
      })
    } catch {
      setMsg({ t: 'Sorry, your request could not be sent. Please try again, or call or email us directly.', ok: false })
    } finally {
      setBusy(false)
    }
  }

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
          <form id="bookForm" method="POST" noValidate onSubmit={submit}>
            {sent ? (
              <>
                <h2 style={{ fontSize: '1.8rem' }}>Thank you</h2>
                <p style={{ color: 'var(--muted)' }}>Your request has been received. One of our specialists will be in touch within one business day to confirm your appointment.</p>
              </>
            ) : (
              <>
                                <input type="checkbox" name="botcheck" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
                <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Let's work together</h2>
                <p style={{ color: 'var(--muted)', marginTop: -8 }}>Fill in this form and one of our specialists will be in touch to confirm a time.</p>
                <div className="row2">
                  <label>First name <em>*</em><input name="first_name" required autoComplete="given-name" /></label>
                  <label>Last name <em>*</em><input name="last_name" required autoComplete="family-name" /></label>
                </div>
                <div className="row2">
                  <label>Email <em>*</em><input name="email" type="email" required autoComplete="email" /></label>
                  <label>Phone <em>*</em><input name="phone" type="tel" required autoComplete="tel" /></label>
                </div>
                <div className="row2">
                  <label>Organisation<input name="organisation" autoComplete="organization" /></label>
                  <label>
                    I'd like to discuss
                    <select name="service">
                      {topics.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>Message<textarea name="message" rows={4} /></label>
                <p id="formMsg" role="status" style={{ fontWeight: 600, color: msg?.ok ? 'var(--blue)' : 'var(--red)' }}>
                  {msg?.t}
                </p>
                <button className="btn btn-blue" type="submit" disabled={busy} style={{ justifySelf: 'start' }}>
                  {busy ? 'Sending...' : 'Book an appointment'}
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
