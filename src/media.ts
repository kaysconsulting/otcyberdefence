// All images and videos are self-hosted in /public/media (downloaded from Pexels, free commercial licence).
export type ImgKey =
  | 'rail-transport'
  | 'aviation-airports'
  | 'energy-electricity'
  | 'water-wastewater'
  | 'oil-gas'
  | 'ports-maritime'
  | 'mining-resources'
  | 'government-defence'
  | 'consulting-banner'
  | 'expertise-banner'
  | 'control-room'

const WIDTHS = [800, 1200, 2400] as const
export const img = (k: ImgKey, w: (typeof WIDTHS)[number] = 1200) => `/media/img/${k}-${w}.jpg`
export const srcSet = (k: ImgKey) => WIDTHS.map((w) => `${img(k, w)} ${w}w`).join(', ')

export const CLIPS = [
  { n: 'Energy', k: 'energy' },
  { n: 'Water', k: 'water' },
  { n: 'Rail & Transport', k: 'rail' },
  { n: 'Ports', k: 'ports' },
  { n: 'Renewables', k: 'renewables' },
] as const
export const clip = (k: string, small: boolean) => `/media/video/hero-${k}-${small ? 720 : 1080}.mp4`
export const poster = (k: string) => `/media/video/hero-${k}-poster.jpg`
