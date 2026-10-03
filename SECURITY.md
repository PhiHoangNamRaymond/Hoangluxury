# Security review — 2026-10-02

Review/hardening against [OWASP Top 10:2025](https://top10.owasp.org/2025/en/) and
selected requirements of [ASVS 5.0](https://github.com/OWASP/ASVS/tree/v5.0.0/5.0).
This is NOT an OWASP certification or an exhaustive ASVS L1/L2 verification.
Local source/tests were reviewed, not a penetration test of production.

## Threat model and evidence

Public static React pages use an isolated anonymous Supabase client. A writer
is untrusted relative to other writers/admins; access rules must hold when they
bypass the UI and call the Data API directly. Active admins can publish any
article, invite accounts and change permissions. The Edge Function holds a
server key; it verifies JWT with Auth and reads role/active from DB, never metadata.
Public booking/feedback sends personal data to an Apps Script endpoint.

| OWASP 2025 area | Local controls / verification | Remaining production work |
|---|---|---|
| A01 Access control | Actual PostgreSQL RLS tests: cross-author writes denied, inactive accounts denied, private profiles, server-only invitation limiter | Run migrations; inspect extra policies, exposed schemas and Storage grants |
| A02 Misconfiguration | Apache/Vercel CSP, nosniff, anti-framing, no-referrer, admin no-store; source/env denial on Apache | Verify actual HTTP headers on Hostinger/Cloudflare; upload only dist |
| A03 Supply chain | Lockfile, npm audit, reproducible npm ci | Audit continuously; enable Dependabot and secret scanning in GitHub |
| A04 Cryptography | HTTPS endpoints, server-key build guard; no custom password hashing | TLS Full (strict), origin certificate; Supabase encrypts/stores passwords, secure backups |
| A05 Injection | React escaping, one DOMPurify renderer, no executable Markdown HTML; parameterized SDK queries; Sheets formula escaping + VM regression tests | No arbitrary server code/file execution; validate upload bytes server-side if assurance required |
| A06 Insecure design | DB-level article bounds; 10 invites/admin/hour, atomic across function instances | Public forms need verified CAPTCHA/server rate limiting; capacity and retention planning |
| A07 Authentication | Verified bearer + active role, password changes reauthenticate, reset callbacks tested, generic login/reset errors; new passwords 15–128 characters | Enforce minimum 15 in Supabase Auth, leaked-password protection if available, Auth rate limits; CMS MFA UI + server AAL2 enforcement not implemented |
| A08 Integrity | Writer cannot assign another author or own role; metadata cannot grant privileges; upload paths UUID + random ID, SVG/HTML denied | Signed/reviewed releases; inspect storage files, do not trust client MIME alone |
| A09 Logging | Role/active changes recorded privately; invitation request ID/actor/status only, no token/email/body | Monitor Auth/Function logs, alert on 401/403/429/5xx, retention/access policy |
| A10 Exceptions | API fails closed if role/limit DB unavailable, bounded/timeout JSON body, generic Apps Script failures; load errors not empty-success | Test outages/backups on staging, no real bookings for tests |

## Apply changes in the correct order

1. Back up Supabase DB first. New project: run `supabase/01-schema.sql`, then
   `supabase/04-security-hardening.sql`. Existing project: `02-lock-permissions.sql`,
   `03-blog-runtime.sql`, then `04-security-hardening.sql` in SQL Editor. These are
   local scripts, NOT automatically executed by build. No data is deleted.
2. Migration 04 leaves the content constraint NOT VALID to preserve legacy rows.
   Review old data, then run `alter table public.articles validate constraint
   articles_input_bounds;`. If validation fails, correct the offending data;
   do not delete all posts or disable RLS. New/changed rows are checked immediately.
3. Deploy the updated `supabase/functions/invite-writer/index.js`. Keep handler
   authentication. `verify_jwt=false` only concerns the gateway/preflight. Set exact
   `BLOG_ALLOWED_ORIGINS`, remove local origins from production when no longer needed.
   The handler fails closed (503) if migration 04 has not been installed.
4. Copy updated `google-apps-script/Code.gs` into the existing project, Save,
   Deploy → Manage deployments → Edit → New version → Deploy. Preserve existing
   Sheet properties. Both `FEEDBACK_SHEET_NAME` and legacy `FEEDBACK_SHEET` work.
   Strict fields match current forms (1–6 passengers, ISO dates, supported journey
   types, 4,000-character message limit). Test on a separate Sheet first.
5. Authentication settings: disable public signups, set password minimum **15**,
   review Auth rate limits, exact callback allowlist, custom SMTP. Frontend password
   length is NOT a substitute for the backend setting. Existing passwords are not
   changed by this patch. Enable MFA for Supabase/GitHub/Hostinger owner accounts;
   this does not automatically add MFA to CMS writers/admins.
6. Run `npm ci`, `npm run test:security`, `npm run security:secrets`,
   `npm run security:audit`, `npm run build`. Upload only contents of `dist/` to
   Hostinger's intended website. Include its hidden `.htaccess`; never upload env,
   SQL, Apps Script, source, repo or zip backups.
7. MERGE the new header/file-protection block with the site's live `.htaccess`.
   Preserve the customer's existing private/404/noindex and domain rules. Do NOT
   overwrite live privacy rules with the SPA fallback in this repository. If this
   is a private site, stop before any action that would publish it.
8. Verify headers in browser Network on the real hosting. Local Vite does not
   apply `.htaccess`/Vercel headers. Test admin callback/login, public article,
   booking, external fonts/images on staging first. Cloudflare script injection
   (Rocket Loader/Zaraz/analytics) is not allowed by current script-src; disable it
   or add only specifically approved sources/hashes. Do not add unsafe-inline/eval
   to script-src to silence a warning. With custom Supabase domains, add that exact
   HTTPS origin to connect-src in both configurations before deploying.

## Deliberate limitations / open risks

- No claim of full ASVS compliance: MFA/step-up for CMS admin actions, backend
  session idle/absolute expiry, CAPTCHA, CI release provenance, independent
  penetration testing and live deployment verification are still outstanding.
- Supabase SDK persists auth in localStorage. XSS remains capable of stealing
  sessions if browser defenses fail. Moving to HttpOnly cookies requires a BFF
  backend/CSRF design, not just setting a React option. noindex is not authentication.
- CSP style-src permits inline CSS because React uses inline style properties.
  img-src accepts HTTPS for legitimate Markdown images and country flags; arbitrary
  remote images can track visitors. connect-src includes Supabase's HTTPS namespace,
  not a per-project origin. Tighten to the real project origin when configuring.
- Apps Script endpoint is intentionally public and has no trustworthy client IP
  or authenticated Origin check. Honeypot and validation do NOT stop deliberate
  spam or identify a feedback author. A future verified CAPTCHA/proxy with server
  throttling is needed; never embed a secret in the frontend or trust submittedFrom.
- no-cors returns opaque responses. Browser success means the send was attempted,
  NOT proof that the Sheet stored it. Confirm in a test Sheet/Apps Script Executions.
- Storage bucket is public, including draft images. MIME/size limits and UUID paths
  are enforced, but content sniffing/re-encoding/AV on a trusted server is not
  implemented. Never store confidential files/customer documents there.
- Private role_audit stores UUID/role/status, not email/body. Trusted-server edits
  may have null actor_id; correlate invitation request IDs with Auth logs. Only
  SQL administrators inspect this schema. Define retention (e.g. 90 days) with the
  owner before scheduling deletion; no automatic deletion added here.
- The secret check finds known Supabase server-key/private-key formats in current
  source/config only. It does not scan ignored local env or Git history and is not
  a replacement for gitleaks/GitHub secret scanning. Rotate any leaked credential;
  adding gitignore cannot remove an existing public leak.
- Custom policy changes can OR extra access into RLS. Re-review every newly added
  policy; do not mark a project safe because an RLS switch is enabled.
- `Options`, `Header ... expr` and `Require` depend on hosting support. If rejected,
  use equivalent Hostinger/Cloudflare controls and verify actual responses. Do not
  leave a 500 error or assume silently skipped IfModule headers are active.

## Reproduction and sources

Local results: `npm run test:security` passed **62/62**, `npm run build` succeeded
(42 static routes), `npm audit` reported **0 known vulnerabilities**, `knip` found
no unused-code findings. Known-format secret scan checked **88** current source/
config files, found no matches; ignored env and Git history were not included.
No live SQL, email, password, DNS or privacy configuration was changed.

Tests use actual PostgreSQL RLS in PGlite plus mocked SDK/email/Google services;
they do not mutate live users, passwords or bookings. Header tests compare source
configuration, not a running Apache instance. Build checks compilation/static routes.
`npm audit` covers known npm advisories at the time of execution, not all flaws.

- [OWASP authentication guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP browser headers](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
- [OWASP input validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [OWASP file uploads](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [Supabase RLS/security-definer guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase production checklist](https://supabase.com/docs/guides/deployment/going-into-prod)

Report suspected vulnerabilities privately to the repository owner with minimal
reproduction and redacted logs. Do not post credentials or customer data in issues.
