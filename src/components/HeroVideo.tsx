import { useEffect, useRef, useState } from 'react'
import { CLIPS, clip, poster } from '../media.ts'

const DUR = 7000

// Cross-fading carousel of the five self-hosted hero clips, with progress dots.
export default function HeroVideo() {
  const refs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)]
  const [i, setI] = useState(0)
  const [cur, setCur] = useState(0)
  const small = typeof window !== 'undefined' && matchMedia('(max-width:820px)').matches
  const reduced = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const next = refs[1 - cur].current
    if (!next) return
    // Browsers only autoplay muted video; set it on the element itself (React doesn't always reflect `muted`).
    next.muted = true
    next.defaultMuted = true
    next.src = clip(CLIPS[i].k, small)
    next.currentTime = 0
    next.play().catch(() => {})
    setCur(1 - cur)
    if (reduced) return
    const t = setTimeout(() => setI((i + 1) % CLIPS.length), DUR)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  return (
    <>
      {refs.map((r, k) => (
        <video
          key={k}
          ref={r}
          className={k === cur ? 'on' : ''}
          muted
          autoPlay
          playsInline
          loop
          preload="auto"
          poster={k === 0 ? poster(CLIPS[0].k) : undefined}
        />
      ))}
      <div className="hero-foot">
        <div className="wrap">
          <div className="clip-label">
            Protecting <b>{CLIPS[i].n}</b>
          </div>
          <div className="dots" style={{ ['--dur' as string]: `${DUR}ms` }}>
            {CLIPS.map((c, k) => (
              <button key={c.k} aria-label={`Show ${c.n}`} className={k === i ? 'on' : ''} onClick={() => setI(k)} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
