import { photos, type PhotoKey } from '../media.ts'

// Full-bleed, high-resolution background photo (real <img> with srcset, so it stays sharp on
// retina and 4K screens). `tone` sets which side carries the scrim for legible text.
export default function Backdrop({ name, eager, tone = 'left' }: { name: PhotoKey; eager?: boolean; tone?: 'left' | 'full' | 'bottom' }) {
  const widths = [960, 1440, 1920, 2560, 3200]
  return (
    <div className={`backdrop tone-${tone}`} aria-hidden="true" style={{ backgroundImage: `url(${photos[name](48)})` }}>
      <img
        onLoad={(e) => e.currentTarget.classList.add('loaded')}
        src={photos[name](1920)}
        srcSet={widths.map((w) => `${photos[name](w)} ${w}w`).join(', ')}
        sizes="100vw"
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
      />
    </div>
  )
}
