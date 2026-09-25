import type { ReactNode } from 'react'

// Layer-2 detail: collapsed by default so the overview stays short.
export default function More({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="more">
      <summary>
        <span>{label}</span>
        <span className="chev" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="more-body">{children}</div>
    </details>
  )
}

// Layer-3 evidence: small, precise, always attributable.
export function Evidence({ children }: { children: ReactNode }) {
  return (
    <div className="evidence">
      <span className="mono">Evidence</span>
      {children}
    </div>
  )
}
