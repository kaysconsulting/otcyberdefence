// Build-time switch, set per environment in the host (e.g. Vercel → Settings → Environment Variables).
//   VITE_SITE_MODE = "coming-soon"  → every URL shows the Coming Soon page (use on the live domain until launch)
//   VITE_SITE_MODE = "full" / unset → the full website
//   VITE_NOINDEX   = "true"         → ask search engines not to index this deployment (use on the test site)
export const comingSoon = import.meta.env.VITE_SITE_MODE === 'coming-soon'
export const noIndex = import.meta.env.VITE_NOINDEX === 'true'
