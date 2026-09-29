# Deploying OT Cyber Defence

| Address | Branch | Vercel environment | Shows |
|---|---|---|---|
| `otcyberdefence.com.au` → `www.otcyberdefence.com.au` | `main` | Production | Full site |
| `test.otcyberdefence.com.au` | `develop` | Preview | Full site, hidden from Google |

## Environment variable

| Key | Value | Environments |
|---|---|---|
| `VITE_NOINDEX` | `true` | **Preview** only |

If `VITE_SITE_MODE` is still set in Vercel from the Coming Soon period, delete it. The code no longer uses it.

## Contact form

The form posts to the shared Kays backend (`ash-be` → `POST /api/tickets/send-form-submission`), the same as the Kays NDIS site. It emails `info@otcyberdefence.com.au`. The backend's CORS list in `ash-be/src/main.ts` must include the OT Cyber Defence domains, and that change must be deployed.

## DNS (GoDaddy)

| Type | Name | Value |
|---|---|---|
| A | `@` | `216.150.1.1` |
| CNAME | `www` | the project-specific value Vercel shows |
| CNAME | `test` | the project-specific value Vercel shows |

(The older `76.76.21.21` / `cname.vercel-dns.com` still work. Vercel just flags them as "DNS Change Recommended".)

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

## Try it locally

```bash
npm run dev
```
