# Hoang Luxury Travel

React/Vite homepage for Hoang Luxury Travel.

## Scripts

```bash
npm ci
npm run dev
npm run build
npm run preview
```

## Structure

- `src/main.jsx` - Entry point and pathname-to-page routing.
- `src/App.jsx` - Homepage composition; individual sections live in `src/components/home/`.
- `src/components/layout/` - Shared header, footer, and sticky actions.
- `src/BookingPage.jsx` and `src/CatalogPage.jsx` - Standalone page components.
- `src/data.js` - Content, navigation, and external URLs.
- `src/config/assets.js` - Central asset imports and image mappings.
- `src/styles/index.css` - Ordered CSS entry point; feature styles live beside it.
- `AGENTS.md` - Short navigation and validation guide for AI coding agents.
- `assets/` - Source images bundled by Vite.

## Keeping the project lean

Secondary pages are loaded on demand from `src/main.jsx`; shared CSS keeps its
explicit cascade order in `src/styles/index.css`. Assets in this repository are
the versions referenced by the app. Keep original editing sources and old ZIP
releases in a separate local archive, not in the deployment/source tree.
Old design prototypes and the retired file-based Markdown blog examples are
not part of the app. Write/publish blog posts in `/admin/` using Supabase;
see `supabase/README.md` for the current workflow.

Run `npx --yes knip` for unused files, exports and dependencies, then review each
finding before removing it. `knip.json` includes the serverless API, build scripts
and tests as entry points so they are not incorrectly treated as unused.
Finish with `npm run build` and `npm run test:blog-security`. Do not purge CSS
based on only one page or viewport: responsive rules and dynamic states matter.

## External links

Copy `.env.example` to `.env` and provide:

- `VITE_CATALOG_URL`: the public Google Drive link for the catalog or price list.
- `VITE_FORMS_PROXY_URL`: the deployed Supabase `forms-proxy` HTTPS endpoint.
- `VITE_TURNSTILE_SITE_KEY`: the public Cloudflare Turnstile site key.

Restart the Vite development server after changing `.env`.

Forms use a server-verified CAPTCHA proxy and require a readable positive server
acknowledgement. Missing configuration fails closed; WhatsApp remains available.
The concierge team still confirms journey availability/pricing with the customer.
The legacy VITE_BOOKING_SHEET_ENDPOINT is no longer used by the form UI.

## Deployment

The app uses pathname routes (`/booking/` and `/catalog/`). Configure the
production web server to serve `index.html` as the fallback for unknown file
paths. Without this SPA fallback, opening either page directly may return a
server-level 404.

For Vercel, the required SPA fallback is already defined in `vercel.json`.
Keep the project Root Directory pointed at this repository, use `npm run build`,
and leave the Output Directory as `dist`.

## Google Sheets booking integration

Follow [Forms security migration and setup](google-apps-script/README.md) on a
separate test Sheet first. The migration adds a private request ledger, server
shared secret, rate controls and verified CAPTCHA. Feedback is public: guests
enter their Booking ID manually; no invitation link or proof of a real booking
is required. Update both the frontend and Apps Script when changing this flow.
Existing booking/feedback columns are preserved. Do not deploy only the frontend:
the new form and both server deployments must be configured together.
Spreadsheet IDs and server secrets never belong in VITE_ variables or Git.

## Blog administration and security

See [One-time Supabase setup and hosting test checklist](supabase/README.md).
Public blog reads published/due articles through a separate anonymous client.
Admin supports sanitized Markdown, images, scheduling, account creation and
password resets via Supabase Edge Functions. The current account workflow sends
no email: the admin securely shares the credentials with the writer. Existing
databases need `02-lock-permissions.sql`, `03-blog-runtime.sql`,
`04-security-hardening.sql`, then `05-writer-collaboration.sql`; new projects run
`01-schema.sql`, `04-security-hardening.sql`, then `05-writer-collaboration.sql`.
Back up an existing database before migrations. Builds do not apply SQL.
Active writers intentionally read/edit all articles, including drafts, but can
only delete their own articles and cannot change an article's author.
New posts appear without redeploying. Route HTML SEO and sitemap are build-time
snapshots: rebuild/upload to update them. SPA fallback is not a real HTTP 404.

Run `npm run test:blog` for offline DB permissions, public API, HTML sanitization,
upload/password validation and account-management authorization tests. It does
not connect to live Supabase or validate live authentication.

This README contains instructions, variable names and placeholders, not real
credentials. Never commit real env files, server keys, passwords, database dumps
or customer records. Gitignore does not remove secrets from old commits; rotate
exposed keys and handle Git history separately. Public source/content/images also
require the owner's permission to publish.

See [OWASP review, deployment steps and remaining risks](SECURITY.md).
`npm run test:security` runs the complete offline regression suite including
Apps Script validation/error redaction and production header configuration.
`npm run security:secrets` checks known secret formats without printing values;
`npm run security:audit` checks npm advisories. These do not certify production.
Apply SQL and redeploy the Edge Function/Apps Script before testing the new controls.

## Vercel release checklist

1. In the same Supabase project used by the frontend, open Edge Functions →
   Secrets. If this deployment needs blog account management, add its exact
   origin to the existing `BLOG_ALLOWED_ORIGINS` value, preserving other intended
   origins. Example: `https://hoangluxury.travel,https://www.hoangluxury.travel,https://hoangluxury.vercel.app`.
   No trailing slash, path or wildcard. Save the secret; a secret-only change
   does not require redeploying the function. Function code changes do.
   See [Supabase secrets](https://supabase.com/docs/guides/functions/secrets).
2. In Vercel's project settings, check Environment Variables for Production
   (and Preview if used): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `VITE_FORMS_PROXY_URL`, `VITE_TURNSTILE_SITE_KEY`. `VITE_CATALOG_URL` is optional
   when using the app's existing catalog fallback. The Supabase frontend key
   must be publishable/anon, never secret/service-role. Server secrets stay in
   Supabase/Apps Script, not Vercel frontend variables or Git.
3. The deployed browser origin must also be allowed by `FORMS_ALLOWED_ORIGINS`
   and the Turnstile widget's hostname configuration. Keep an already-working
   form configuration; do not weaken CAPTCHA or use wildcard origins. Preview
   URLs need their own deliberately allowed origins or a separate staging setup.
4. Review `git status --short`. Include referenced new source files and images,
   including `src/admin/AdminModal.jsx`, with the commit. Do not commit `.env`,
   `.env.local`, `dist/`, `node_modules/`, secrets or customer data. Gitignore
   does not protect files already tracked or old commits.
5. Run `npm ci`, `npm test`, `npm run security:secrets`, `npm run security:audit`,
   `npm run build`, and `git diff --check`. A clean npm audit only covers known
   advisories; the secret scanner checks known formats, not all possible secrets
   or Git history. Review changes before committing and pushing.
6. Vercel Root Directory must be this repository, Build Command `npm run build`,
   Output Directory `dist`. Deploy the new commit; environment-variable changes
   require a new deployment to enter the frontend bundle.
7. Test the deployed site using dummy data: direct route loading, booking and
   feedback acknowledgements/popups, admin login, account creation/reset, writer
   permissions, and anonymous rejection of draft articles. Use a staging
   Sheet/project where possible; do not send real customer data for tests.
8. Inspect `/admin/` response headers after deployment: `Cache-Control: no-store`
   and `X-Robots-Tag: noindex, nofollow`. The configuration also sets targeted
   CDN no-store headers; Vercel consumes `Vercel-CDN-Cache-Control` so it is not
   visible in the browser response. The admin HTML shell contains no private
   account data, and noindex is not authorization. If the live headers differ,
   check the deployed commit and project root before declaring this complete.
   See [Vercel cache-control headers](https://vercel.com/docs/caching/cache-control-headers).

Offline tests/builds do not prove the live database policies, deployed server
code, dashboard environment variables or end-to-end production behavior.
