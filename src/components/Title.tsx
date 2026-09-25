import type { ElementType } from 'react'

// Kays style: black heading with the key phrase in Kays red. Mark it with {braces}:
// "Your {Trusted Partner} in OT cybersecurity"
export default function Title({ as: Tag = 'h2', text, className }: { as?: ElementType; text: string; className?: string }) {
  const parts = text.split(/(\{[^}]+\})/g).filter(Boolean)
  return (
    <Tag className={className}>
      {parts.map((p, i) => (p.startsWith('{') ? <span key={i} className="hl">{p.slice(1, -1)}</span> : p))}
    </Tag>
  )
}
