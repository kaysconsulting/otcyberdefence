import Contact from '../components/Contact.tsx'
import PageHero from '../components/PageHero.tsx'

export default function ContactPage() {
  return (
    <>
      <PageHero
        photo="jetbridge"
        eyebrow="Contact"
        title="Book an Appointment with an {OT Security} Specialist"
        lead="Thirty minutes on your obligations, your systems and where to start. No obligation."
        crumbs={[{ to: '/contact', label: 'Contact' }]}
        depth={false}
      />
      <Contact />
    </>
  )
}
