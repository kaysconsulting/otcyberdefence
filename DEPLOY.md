# Deploying OT Cyber Defence (Coming Soon + Test site)

One codebase, two behaviours, controlled by an environment variable:

| Variable | Value | Effect |
|---|---|---|
| `VITE_SITE_MODE` | `coming-soon` | Every URL shows the Coming Soon page |
| `VITE_SITE_MODE` | `full` (or unset) | The full website |
| `VITE_NOINDEX` | `true` | Adds `noindex, nofollow` so search engines skip it |

The goal:

| Address | Branch | Vercel environment | Shows |
|---|---|---|---|
| `otcyberdefence.com.au` (+ `www`) | `main` | Production | Coming Soon |
| `test.otcyberdefence.com.au` | `develop` | Preview | Full site, hidden from Google |

> Replace `otcyberdefence.com.au` with your real domain throughout.

---

## 1. Push the code to GitHub

```bash
git checkout main
git add -A
git commit -m "Coming soon mode"
git push origin main
git checkout -b develop
git push -u origin develop
```

`main` = what the public domain serves. `develop` = the test site.

> **Order matters:** the Coming Soon code must be pushed to GitHub (step 1) before the environment variable in step 3 can have any effect.

## 2. Create the Vercel project

1. Go to **vercel.com → Add New… → Project**.
2. Import **kaysconsulting/otcyberdefence**.
3. Framework preset: **Vite** (detected automatically). Build command `npm run build`, output directory `dist`. Leave the defaults.
4. Click **Deploy**. (The first deploy shows the full site; the next step switches Production to Coming Soon.)

`vercel.json` is already in the repo so deep links like `/sectors/rail` work.

## 3. Set the environment variables

**Project → Settings → Environment Variables**

Add just **two** variables (each key once):

| Key | Value | Environments to tick |
|---|---|---|
| `VITE_SITE_MODE` | `coming-soon` | **Production** only (untick Preview and Development) |
| `VITE_NOINDEX` | `true` | **Preview** only (untick Production and Development) |

Preview needs no `VITE_SITE_MODE`: when it isn't set, the full site is shown. If you already added `VITE_SITE_MODE` with several environments ticked, edit it (⋯ → Edit) so only **Production** is ticked.

Then **Deployments → latest Production deployment → ⋯ → Redeploy**. Vite reads these at build time, so every change needs a redeploy.

## 4. Attach the domains

**Project → Settings → Domains**

1. Add `otcyberdefence.com.au` → assign to **Production**.
2. Add `www.otcyberdefence.com.au` → choose **Redirect to `otcyberdefence.com.au`**.
3. Add `test.otcyberdefence.com.au` → choose **Git Branch → `develop`** (so it always shows the latest test build).

Vercel then shows the DNS records to create. At your domain registrar (GoDaddy, VentraIP, Crazy Domains, etc.) add them. Typically:

| Type | Name / Host | Value |
|---|---|---|
| A | `@` | `216.150.1.1` |
| CNAME | `www` | the project-specific value Vercel shows, e.g. `a02108169f7c1c09.vercel-dns-016.com` |
| CNAME | `test` | the project-specific value Vercel shows for `test` |

(The older `76.76.21.21` / `cname.vercel-dns.com` still work. Vercel just flags them as "DNS Change Recommended".)

Always use the exact values Vercel displays for your project if they differ. DNS usually works in minutes, sometimes up to 24 hours. Vercel issues the HTTPS certificates automatically.

### Keeping email working (email is hosted elsewhere)

**Do not change the nameservers** and do not move DNS to Vercel. Stay at your current DNS provider and only touch the web records above.

Email uses different records, and none of the steps above change them:

| Record | Used for | Action |
|---|---|---|
| **MX** | Delivering email | **Leave unchanged** |
| **TXT** (SPF `v=spf1…`, DMARC `_dmarc`, verification codes) | Email authentication | **Leave unchanged** |
| **CNAME/TXT** for DKIM (`selector1._domainkey`, `google._domainkey`, etc.) | Email signing | **Leave unchanged** |
| `autodiscover`, `mail`, `webmail`, `imap`, `smtp` | Mail client setup | **Leave unchanged** |
| **A `@`** | The website | Change to Vercel |
| **CNAME `www`**, **CNAME `test`** | The website | Point to Vercel |

**Check this one case before changing the `@` A record.** If your MX record points at the domain itself (e.g. MX = `otcyberdefence.com.au`), or at a `mail` name that is a CNAME to `@`, then email currently follows the website's IP. Changing `@` would break it. Fix it first:

1. Note the current IP in the `@` A record (your old host).
2. Create **A `mail` → that old IP** (or edit `mail` if it's a CNAME).
3. Change the **MX** to point to `mail.otcyberdefence.com.au`, then wait for it to update.
4. Only then change **A `@`** to Vercel.

If your MX already points to an outside provider (e.g. `*.mail.protection.outlook.com` for Microsoft 365, `*.google.com` / `smtp.google.com` for Google Workspace, or `*.zoho.com`), you're safe. Changing `@` won't affect email.

**Lowest-risk alternative:** leave `@` and `www` exactly as they are for now. Only add **CNAME `test` → `cname.vercel-dns.com`** for the test site. Later, point `@`/`www` at Vercel for Coming Soon or launch once you've confirmed the MX setup above.

## 5. Lock down the test site (recommended)

**Project → Settings → Deployment Protection**

- **Vercel Authentication** (free): only people logged in to your Vercel team can view Preview deployments, including `test.` Turn it on for **Preview**.
- **Password Protection** (paid add-on): share one password with reviewers instead.

`VITE_NOINDEX=true` also keeps the test site out of search results.

## 6. Day-to-day

- Work on `develop` → push → `test.otcyberdefence.com.au` updates automatically.
- The public domain keeps showing Coming Soon.
- Fill in `company.email`, `company.phone` and `company.acn` in `src/content.ts`. The email and phone appear on the Coming Soon page automatically once set.

## 7. Launch day

1. Merge `develop` into `main` and push:
   ```bash
   git checkout main && git merge develop && git push
   ```
2. Vercel → Settings → Environment Variables → **delete** `VITE_SITE_MODE` (or change its value to `full`).
3. Redeploy Production.

No DNS changes are needed. The domain stays attached the whole time.

## Try it locally

```bash
npm run dev        # full site
npm run dev:soon   # Coming Soon page
```
