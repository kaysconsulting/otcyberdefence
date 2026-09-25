// The chevron accents from the Kays banner: red ›››› and blue ‹‹‹‹.
export default function Chevrons({ dir = 'right', color = 'red', className = '' }: { dir?: 'right' | 'left'; color?: 'red' | 'blue'; className?: string }) {
  return (
    <svg className={`chev-row ${color} ${className}`} width="52" height="14" viewBox="0 0 52 14" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={dir === 'right' ? `M${2 + i * 12} 2l5 5-5 5` : `M${9 + i * 12} 2l-5 5 5 5`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.45 + i * 0.18}
        />
      ))}
    </svg>
  )
}
