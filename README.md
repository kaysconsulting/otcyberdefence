# OT Cyber Defence website

React + Vite + TypeScript marketing site for OT Cyber Defence.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
```

- Multi-page (React Router): `/`, `/consulting`, `/protection`, `/case-studies`, `/sectors`, `/sectors/:slug`, `/expertise`, `/contact`. `vercel.json` rewrites all paths to `index.html`.
- Pages are layered: overview → detail (collapsed `More` toggles) → evidence (sources and standards).
- Photography is in `src/media.ts` (Unsplash, hotlinked). Swap in your own site photos there.
- All copy lives in `src/content.ts`. Fill in `company.email`, `company.phone` and `company.acn` there. Until they're set, they show as highlighted placeholders.
- Styles are in `src/index.css`, carried over unchanged from the original HTML design.
- `reference-original.html` is the source HTML the site was built from.
- The contact form only shows a thank-you message for now. It isn't connected to email or a backend yet.
