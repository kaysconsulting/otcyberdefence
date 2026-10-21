import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { company } from '../content.ts'
import Banner from '../components/Banner.tsx'

const UPDATED = '21 October 2026'

export default function Privacy() {
  useEffect(() => {
    document.title = 'Privacy policy | OT Cyber Defence'
  }, [])
  return (
    <>
      <Banner
        image="consulting-banner"
        crumbs={[{ label: 'Privacy policy' }]}
        eyebrow="Privacy"
        title="Privacy Policy"
        text="How OT Cyber Defence collects, uses and protects your personal information, in line with the Australian Privacy Principles."
        button={false}
      />
      <section>
        <div className="wrap legal">
          <p className="fine" style={{ marginTop: 0 }}>Last updated: {UPDATED}</p>

          <h2>1. Who we are</h2>
          <p>
            This policy applies to {company.legalName} ("OT Cyber Defence", "OTCD", "we", "us"), {company.address}. We
            handle personal information in line with the <i>Privacy Act 1988</i> (Cth) and the Australian Privacy
            Principles (APPs).
          </p>

          <h2>2. What we collect</h2>
          <p>We only collect personal information that you choose to give us, or that we need to respond to you.</p>
          <ul>
            <li>
              <b>Contact and booking form:</b> your first and last name, email, phone, organisation, the topic you would
              like to discuss and your message.
            </li>
            <li>
              <b>OT Blast Radius review request:</b> your name, work email, company, role, sector, state and an optional
              message. If you tick the box to share them, we also receive the generic settings you chose in the tool.
            </li>
            <li>
              <b>OT Blast Radius board summary:</b> your name, work email and company, together with your result and the
              generic settings you chose in the tool, so we can follow up if you would like help.
            </li>
            <li>
              <b>Emails and calls:</b> the details you give us when you contact us directly.
            </li>
          </ul>
          <p>
            <b>OT Blast Radius never asks for real network details.</b> It does not ask for IP addresses, hostnames,
            device models, firmware versions, site names or diagrams. The settings you choose are generic, stay in your
            browser while you use the tool, and are only sent to us if you ask for the board summary or choose to share them
            with a review request.
          </p>

          <h2>3. Anonymous usage information</h2>
          <p>
            We may record anonymous usage events, such as which steps of OT Blast Radius are used, to improve our website
            and tools. These events do not include your name, contact details or the settings you choose, and are not
            used to identify you. Like most websites, our hosting provider may also keep standard technical logs (such as
            IP address and browser type) for security and to keep the site running.
          </p>

          <h2>4. How we use your information</h2>
          <ul>
            <li>To respond to your enquiry and arrange appointments or architecture reviews</li>
            <li>To prepare for a review, if you chose to share your OT Blast Radius settings</li>
            <li>To provide the services you ask us for</li>
            <li>To keep records of our communications, and to meet our legal obligations</li>
          </ul>
          <p>We do not sell your personal information, and we do not use it for unrelated marketing without your consent.</p>

          <h2>5. Who we share it with</h2>
          <p>
            We share personal information only with trusted service providers who help us run our business, such as those
            that host our website and deliver form submissions and email to us, and only so they can provide that
            service. We may also disclose information where the law requires or allows it.
          </p>

          <h2>6. Overseas disclosure</h2>
          <p>
            Some of our service providers store or process information outside Australia, including in the United
            States. Where this happens, we take reasonable steps to make sure your information is handled in a way that
            is consistent with the APPs.
          </p>

          <h2>7. How we protect it</h2>
          <p>
            We take reasonable steps to protect personal information from misuse, interference, loss and unauthorised
            access, modification or disclosure. Information sent through our website forms is transmitted over an
            encrypted (HTTPS) connection. We keep personal information only for as long as we need it for the purposes
            above, or as required by law, and then securely delete or de-identify it.
          </p>

          <h2>8. Access and correction</h2>
          <p>
            You can ask to see the personal information we hold about you, or ask us to correct it. Contact us using the
            details below. We will respond within a reasonable time, usually within 30 days.
          </p>

          <h2>9. Questions and complaints</h2>
          <p>
            If you have a question or a complaint about how we have handled your personal information, please contact us
            first so we can try to resolve it. If you are not satisfied with our response, you can contact the Office of
            the Australian Information Commissioner (OAIC) at{' '}
            <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">
              oaic.gov.au
            </a>
            .
          </p>

          <h2>10. Contact us</h2>
          <div className="cinfo" style={{ marginTop: 16 }}>
            <div>
              <b>Email</b>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </div>
            <div>
              <b>Phone</b>
              <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
            </div>
            <div>
              <b>Post</b>
              {company.address}
            </div>
          </div>

          <h2>11. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The latest version will always be on this page, with the date it
            was last updated.
          </p>
          <p style={{ marginTop: 30 }}>
            <Link to="/contact" className="more">
              Contact us →
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
