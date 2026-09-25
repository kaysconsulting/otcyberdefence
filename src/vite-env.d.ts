/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_MODE?: 'coming-soon' | 'full'
  readonly VITE_NOINDEX?: string
}
