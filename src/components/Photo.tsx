import { photos, type PhotoKey } from '../media.ts'

type Props = {
  name: PhotoKey
  alt: string
  /** Rendered CSS width in px at its largest; used to pick sharp sources. */
  width: number
  /** Aspect ratio (w/h) the crop is served at, so the image is never upscaled. */
  ratio?: number
  className?: string
  eager?: boolean
  sizes?: string
}

export default function Photo({ name, alt, width, ratio = 4 / 3, className, eager, sizes }: Props) {
  const src = (w: number) => photos[name](Math.round(w), Math.round(w / ratio))
  return (
    <img
      className={className}
      src={src(width * 2)}
      srcSet={[1, 1.5, 2, 3].map((d) => `${src(width * d)} ${Math.round(width * d)}w`).join(', ')}
      sizes={sizes ?? `(max-width: 760px) 100vw, ${width}px`}
      width={width}
      height={Math.round(width / ratio)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}
