import type { IconName } from '../content.ts'

const paths: Record<IconName, React.ReactNode> = {
  shieldCheck: (
    <>
      <path d="M11 2 19 5v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5z" />
      <path d="m7.5 11 2.5 2.5L15 8.5" />
    </>
  ),
  chart: (
    <>
      <rect x="3" y="3" width="16" height="16" rx="2" />
      <path d="M7 14V10M11 14V7M15 14v-2" />
    </>
  ),
  clock: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="M11 7v4l3 2" />
    </>
  ),
  bars: <path d="M3 18h16M5 18V9M9 18V5M13 18v-7M17 18V8" />,
  chat: <path d="M4 4h14v10H9l-5 4z" />,
  target: (
    <>
      <path d="M11 2v4M11 16v4M2 11h4M16 11h4" />
      <circle cx="11" cy="11" r="5" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M2 11s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
      <path d="M3 3l16 16" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="12" height="9" rx="2" />
      <path d="M8 10V7a3 3 0 0 1 6 0v3" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="12" y="3" width="7" height="7" />
      <rect x="3" y="12" width="7" height="7" />
      <rect x="12" y="12" width="7" height="7" />
    </>
  ),
  plus: (
    <>
      <path d="M4 11h14M11 4v14" />
      <circle cx="11" cy="11" r="8" />
    </>
  ),
}

export default function Icon({ name }: { name: IconName }) {
  return (
    <div className="ico">
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        {paths[name]}
      </svg>
    </div>
  )
}
