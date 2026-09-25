import Contact from '../components/Contact.tsx'
import PageHero from '../components/PageHero.tsx'

export default function ContactPage() {
  return (
    <>
      <PageHero
        photo="jetbridge"
        eyebrow="Contact"
        title="Book a briefing with an OT security specialist"
        lead="Thirty minutes on your obligations, your systems and where to start. No obligation."
        crumbs={[{ to: '/contact', label: 'Contact' }]}
        depth={false}
      />
      <Contact />
    </>
  )
}
