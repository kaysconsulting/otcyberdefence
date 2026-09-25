import { Plus } from 'lucide-react'
import { faqs } from '../content.ts'
import Title from './Title.tsx'

export default function Faq() {
  return (
    <section className="faq-section">
      <div className="wrap faq-wrap">
        <Title text="OT Cyber Defence {FAQs}" />
        <div className="faq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>
                <Plus size={16} strokeWidth={2.25} /> {f.q}
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
