import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Fades sections in as they scroll into view. Content is visible by default; the effect is only
// applied once JS confirms IntersectionObserver works, so nothing can get stuck blank.
export default function Reveal() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = [...document.querySelectorAll<HTMLElement>('main section .wrap > *, main .stats .stat')]
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight) return // already on screen: leave as-is
      el.classList.add('reveal')
      io.observe(el)
    })
    return () => io.disconnect()
  }, [pathname])
  return null
}
