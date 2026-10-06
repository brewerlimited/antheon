# Anthēon Search & Growth

## Current delivery and boundaries

This is a local implementation inside the existing Next.js application. No SEO-platform deployment or production database change has been made. The public site's components, styles, city, concepts, pricing and private GJL route remain separate from the product.

The local demonstration is at `/seo/demo/admin`, with `/seo/demo/portal` for the client experience. It uses fictional contractors and deterministic isolated fixtures. It never queries Supabase or Google. Demo write controls are disabled: the demonstration must not pretend to have saved work to a real account. Real workspaces use Supabase persistence through authenticated server actions.

Real authentication and Google consent/refresh/sync must be exercised against your configured accounts before using the platform for paying clients. Local tests cover PostgreSQL policies and transactions, calculations, reports, encryption, crawler guards, anonymous route protection and the interface. They do not substitute for a real Supabase/Google acceptance test.

## Repository assessment and decisions

- Existing framework was Next.js 16.2.6, React 19.2.6, App Router, TypeScript and Tailwind 4. No shared authentication/database existed. The GJL cookie is a separate private-preview mechanism and is unchanged.
- Next.js and its lint plugin were moved to 16.3.8 after the dependency audit identified security fixes. Non-breaking transitive dependency fixes were applied. No forced major downgrade of the lint plugin was made.
- Geist remains the local font. Product CSS is scoped to `.seo-app`, using the existing charcoal/warm-white palette and the public service headline's `#b9cbff` periwinkle, shared with the city. No product library or chart bundle was added to public routes.
- `/seo/**` alone uses the authentication-refresh proxy. Protected pages and every mutation also verify the user on the server. The proxy is not the authorisation boundary.
- The existing prebuild assembly of GJL's encrypted bundle and Vercel webpack build command remain in place.
- `allowedDevOrigins: ['127.0.0.1']` preserves the existing local browser URL under Next.js 16.3's stricter dev-origin rules. `agentRules: false` prevents framework-generated agent files from creating unrelated repository changes.
- Dependencies are limited to Supabase's SDK/SSR integration, Zod, Cheerio and ipaddr.js. PGlite and tsx are development-only verification tools.

## Architecture

| Area | Location | Responsibility |
| --- | --- | --- |
| Authentication and DB clients | `lib/seo/db.ts`, `proxy.ts` | Verified identity, server cookies, tenant reads, service-only jobs |
| Private product UI | `app/seo`, `components/seo` | Agency operations, client portal, explicit demo |
| Schema | `supabase/migrations` | Relational constraints, RLS, atomic sync replacement and overview aggregation |
| Google connections | `lib/seo/google.ts` | OAuth state + PKCE, encrypted refresh tokens, property discovery, API adapters |
| Syncing | `lib/seo/sync.ts` | Bounded interval, per-project lease, history persistence and logs |
| Technical checks | `lib/seo/crawler.ts` | DNS-pinned, public-address-only requests; robots-aware bounded crawl |
| Evidence/rules | `metrics.ts`, `reports.ts` | Weighted calculations, explicit opportunities, immutable snapshots |
| Provider expansion | `providers.ts` | Inactive capability contracts; no paid credentials needed |

Tables cover users, organisations/members, websites, domains, projects, Google connections, integrations/properties, search and analytics history, keyword/rank/competitor history, conversions, issues, opportunities, tasks, activity, audits, pages/PageSpeed, backlinks, citations, local grids, reports, private notes, notifications, sync logs, baselines and migrations/redirects. One organisation can own multiple websites/projects.

Ordinary reads and writes use the signed-in user's Supabase client and RLS. Service-role credentials are restricted to OAuth storage, operational rate limits/locks, invite management and the explicit scheduler path. Client-facing report snapshots exclude internal notes and private tasks/activity.

## 1. Configure a dedicated Supabase project

1. Create an Anthēon Supabase project in an appropriate region. Review the plan and data retention requirements in your own account; no paid subscription is provisioned by this code.
2. Apply these migration files **in order**, using Supabase CLI migrations or the dashboard SQL editor:
   - `202610060001_seo_platform.sql`
   - `202610060002_overview.sql`
   - `202610060003_sync.sql`
   - `202610060004_project_sources.sql`
3. With CLI: link the intended project using `supabase link --project-ref YOUR_PROJECT_REF`, inspect pending migrations with `supabase db push --dry-run`, then apply with `supabase db push`. Do not point this at an unrelated production database.
4. Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY` (the project's publishable/anon key) and `SUPABASE_SERVICE_ROLE_KEY` in local `.env.local`. Preserve the existing GJL variables. For production, add them through the existing Vercel project's environment settings, with correct environment scope. Do not commit `.env.local` or paste credentials in chat.
5. Disable public signups in Supabase Auth. Enable email/password sign-in. Configure a production SMTP sender before real invitations; Supabase's default mail delivery is limited.
6. Add the exact canonical application origin as Site URL. Allow the development and intended production `/seo/auth/confirm` and `/seo/login` redirect URLs as appropriate.
7. Set invite/recovery email templates to use token-hash confirmation links, rather than browser fragment tokens:

   Invite link:
   `{{ .SiteURL }}/seo/auth/confirm?token_hash={{ .TokenHash }}&type=invite`

   Recovery link:
   `{{ .SiteURL }}/seo/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`

   Use separate local/production auth configuration or the correct `SiteURL` when testing. The confirmation handler verifies the token and sends the user to password setup. The app uses server-managed HttpOnly cookies, not browser localStorage.
8. Create your first account in Supabase Auth. Then promote that exact UUID using the SQL editor (never user signup metadata):

   ```sql
   update public.seo_users
   set role = 'super_admin', full_name = 'Your name'
   where id = 'YOUR_AUTH_USER_UUID';
   ```

9. Sign in at `/seo/login`. Agency role management is available only to a super admin. Admins can invite clients and manage memberships, but cannot assign agency roles.
10. Add a second organisation and two test client accounts. Verify each client sees only its organisation, including direct requests to another project's/report's ID. Remove a membership and verify access disappears immediately. Test invitation, password recovery, sign-out and expired sessions.

### RLS notes

- All product tables have RLS enabled. Anonymous reads are revoked.
- Client selection depends on `seo_members`, never URL ownership claims.
- Agency privileges come from protected `seo_users.role`, not editable auth metadata.
- Task/activity rows must be explicitly client-visible. Clients only read published reports. Internal notes, integration details, migrations and opportunities are agency-only.
- Composite foreign keys stop a child row from pairing one project's ID with another organisation's ID, even when an agency user writes it.
- OAuth secrets, one-time states, rate buckets and locks have no authenticated/anonymous access. Service keys must never be used in client components.
- Published report snapshots and all baselines reject updates/deletes. Draft reports can be reviewed before publication. A mistaken published report needs a deliberate audited correction process; there is no silent overwrite button.

## 2. Create Google OAuth credentials

Follow Google's [web-server OAuth documentation](https://developers.google.com/identity/protocols/oauth2/web-server).

1. Open Google Cloud Console and create/select an Anthēon-controlled project.
2. Enable **Google Search Console API**, **Google Analytics Data API**, **Google Analytics Admin API** (property discovery) and **PageSpeed Insights API** if using an API key.
3. In Google Auth Platform, configure Branding (app name, support/developer email, logo if required, homepage and privacy-policy links).
4. Set Audience appropriately. For external clients this will generally be External. While Testing, add the actual Google accounts used to connect properties as test users. Testing-mode refresh tokens can expire; this is not suitable as a permanent service setup.
5. Configure these requested scopes: `openid`, `email`, `https://www.googleapis.com/auth/webmasters.readonly`, `https://www.googleapis.com/auth/analytics.readonly`. The app requests only the relevant service's data scope during connection.
6. Create a **Web application** OAuth client. Add exact redirect URIs:
   - Local: `http://localhost:3095/seo/auth/google/callback`
   - Intended live: `https://www.antheon.co.uk/seo/auth/google/callback`
7. Store the client ID, secret and exact redirect URI in the corresponding environment. Set `SEO_APP_URL` to the matching origin. Use the canonical host consistently for login and OAuth; changing localhost to 127.0.0.1 changes the cookie origin.
8. Generate a 32-byte encryption key (64 hexadecimal characters) in a secure terminal and store it as `SEO_TOKEN_ENCRYPTION_KEY`. Do not publish its output. Back it up securely; losing/changing it makes existing tokens unreadable. Reconnect Google accounts when rotating unless an explicit re-encryption migration is implemented.
9. Complete Google's required verification and move the OAuth app out of Testing before relying on it for clients. Google may request domain ownership, privacy-policy and scope justification evidence.
10. The connecting Google account must already have access to the client's Search Console property and GA4 property. OAuth consent does not grant access to properties the account does not own/manage.

Only encrypted refresh tokens are persisted. Access tokens are short-lived and used server-side. OAuth states are random, expire after ten minutes, are bound to the administrator and are atomically consumed. Disconnect deletes this project's stored credentials. It deliberately does not revoke an account-wide Google grant that may support other clients; account-wide revocation is available in the Google account's security settings.

## 3. Connect the first real client

1. Sign in as Anthēon admin and choose **Add a client**. Enter the company, website, service area, services and SEO start date.
2. In **Integrations**, connect Search Console. Select the correct domain or URL-prefix property. Repeat for Analytics and choose the GA4 property.
3. Run an initial sync for each service. The ending date defaults to three days ago; each call fetches a bounded 28-day interval.
4. Backfill the preceding comparison interval by choosing an ending date 28 days earlier. Repeat for the historical coverage you need. Charts never fetch Google on page load.
5. In **Conversions**, mark only events actually implemented and verified on the website. Add custom definitions as needed. Saving a definition does not install a tracking script or create a GA4 event.
6. Recommended contractor events: `quote_form_submitted`, `phone_clicked`, `email_clicked`, `whatsapp_clicked`, `brochure_download`, `callback_requested`. Track successful submissions rather than button clicks for quote forms. Review consent behaviour on the client website. Phone/email/WhatsApp events remain lead actions, not sales.
7. Add keywords, service-area targets, target pages, tags and competitors. Exact rank history remains inactive until a paid provider is implemented.
8. Run a technical audit and a PageSpeed test, review findings, then capture a baseline using a meaningful, fully stated reporting period.
9. Add initial tasks and explicitly mark the priorities you want clients to see. Record completed work in **Activity** with a clear client-facing explanation.
10. Invite the client from **Settings**. Verify the correct organisation membership. Existing accounts can be added by their auth user UUID without creating another user.
11. After a completed month, create a draft report. Review its date ranges, coverage and wording, then publish it. Clients can read only the published snapshot. Print/save PDF uses dedicated print styles.
12. For a redesign or domain change, create a **Migration** workspace, complete the checklist and save/check redirects. The app does not change redirects, DNS, Search Console Change of Address or business listings automatically.

## Reporting semantics and limitations

- Search Console totals are fetched separately from query/page rows. CTR is clicks divided by impressions; average position is weighted by impressions. Query rows may omit anonymised searches and provider-limited data.
- Google uses its own source timezones; GA4 uses the property's reporting timezone. The two sources need not reconcile exactly.
- GA4 reporting is filtered to Organic Search sessions. It stores daily active users, sessions, engaged sessions, landing pages, source/medium and event counts. Daily users are **not** summed into a false period-unique total. A future range-level GA4 snapshot can supply deduplicated period users.
- Conversion reporting includes only configured event definitions. Counts can include repeat actions. A session conversion rate is intentionally not inferred from event count divided by sessions.
- Status thresholds are exposed in the interface. They require comparable stored days and previous volume. These are operational classifications, not invented SEO scores.
- Lighthouse SEO is a limited checklist score, never a ranking score. LCP/INP/CLS shown as field values require Google's field data. Lab LCP is stored separately. Missing field data remains missing.
- The technical crawler is HTML-only, same-origin, capped at 20 pages/65 seconds and a 2MB response. It honours robots disallow/allow and crawl delay, stops on blocking/overload responses, validates each DNS result and redirect, and pins the verified IP to the request. It does not execute JavaScript, recurse sitemap indexes, download images for file-size analysis, or claim actual Google index status. Potential orphan pages are explicitly sample-based.
- Workspace history loads are capped at 30,000 rows/source; operational lists at 500 records. Partial coverage is visible and truncated views cannot create baseline/report snapshots. Narrow periods for high-volume clients. The portfolio uses a paged database aggregation (25 clients/page), not one API call per client.
- Provider calls are bounded and quota errors are classified without exposing raw tokens/API responses. A sync interval replaces stored rows transactionally; failed replacement rolls back. Locks prevent simultaneous syncs for the same project.
- Scheduled syncing is prepared, not enabled. An authenticated `POST /seo/api/sync` processes one eligible stale connection per call, only for active projects. Configure `SEO_CRON_SECRET` and an external scheduler that sends `Authorization: Bearer …` when ready. Never put the bearer secret in a URL. Set a suitable frequency/concurrency and monitor sync logs before scaling. No background job silently runs from dashboard reads.
- Operational rate-limit and OAuth-state retention should be maintained: periodically remove expired `seo_rate_limits`, `seo_job_locks` and `seo_oauth_states` records. Sync/audit history retention should follow your client agreement.

## Future integrations

| Capability | Adapter work | Activation checks |
| --- | --- | --- |
| Rank tracking | Implement the ranking provider contract; persist keyword/date/device/location history | Explicit budget, refresh interval, duplicate-job handling, provenance |
| Search volume | Store provider estimates separately from impressions | Locale, database month, estimate labels |
| Local grids | Store coordinate grid observations in `seo_local_rank_checks` | Consistent grid geometry, location settings, paid quota limits |
| Backlinks | Map referring URLs, targets, anchors and first/last seen | Provider licensing, paging, canonical URL normalisation |
| Competitor SERPs | Persist competitor and keyword observations | Same location/device/date as the client comparison |
| Citations | Add discovery/consistency checking alongside manual records | Confidence and last-checked timestamps |

Environment placeholders are commented in `.env.example`. They do not imply active integrations. Each provider must pass fixture/contract tests, limit handling, tenant isolation and reporting-provenance review before activation. No direct scraping of Google search results is implemented.

## Verification commands

```sh
node --import tsx --test tests/seo/*.test.ts
npm run lint
npx tsc --noEmit
npm run build -- --webpack
npm audit --omit=dev
```

The PGlite tests execute the real migration SQL with simulated Supabase auth roles, then verify RLS and rollback behaviour. They do not apply changes to a remote database. Browser checks exercise demo navigation, filters, date controls, desktop/mobile layout, server redirects, noindex/no-store headers and scheduler rejection. Public-site and GJL regression checks must accompany the eventual deployment.

## Manual-dashboard checklist before real use

- [ ] Create Supabase, apply all migrations and configure backups/retention.
- [ ] Configure authentication, email templates, SMTP, redirect URLs and disabled public signup.
- [ ] Create and promote the first agency super admin.
- [ ] Configure local and Vercel environment variables without overwriting GJL secrets.
- [ ] Create Google Cloud credentials, enable four APIs, configure consent and exact callback URLs.
- [ ] Complete Google verification/publishing requirements.
- [ ] Confirm property permissions and run a real connect → select → sync → refresh-token → disconnect test.
- [ ] Verify two-client isolation with real accounts, invitation/recovery delivery and revoked membership.
- [ ] Implement and verify contractor events on the first client's site.
- [ ] Review real-data baseline and monthly report before client access.
- [ ] Configure scheduler/monitoring only after manual sync is reliable.
- [ ] Review the local build and authorise a production deployment separately.

### Additional websites and source integrity

Use a client’s **Settings → Add website workspace** for another site or a new reporting property under the same organisation. Existing client memberships apply to both websites; the client portal offers a website selector. Google properties cannot be changed after a project has stored data, or during a sync. Reconnecting or disconnecting Google preserves the original property association and history. Create a separate workspace for a different source to prevent mixed historical comparisons.

Each workspace tab loads only the sections it uses. Report/baseline jobs load all required snapshot data, and refuse to save when a record cap is reached. GA4 sampling, thresholding or data loss reported by Google is marked as partial sync coverage.

## Local verification record — 6 October 2026

- `npm run test:seo`: 13 tests passed, including the actual SQL migrations in PGlite, client isolation, role escalation denial, immutable snapshots, atomic sync rollback, property-history protection and multi-website membership.
- `npm run lint`, `npx tsc --noEmit` and `npm run build -- --webpack`: passed. The encrypted GJL bundle assembled successfully during prebuild.
- Chrome: all 17 demo workspace tabs rendered. Client filtering, table sorting, date selection, chart metric switching, sample reporting, disabled demo writes and narrow mobile layouts passed. Anonymous admin/client routes redirect to sign-in. The scheduler rejects anonymous requests; private pages have noindex/no-store headers.
- Public-site regression suite passed against the compiled local server: intro, city scroll/hover/keyboard interactions, mobile, reduced motion, no-JavaScript/no-WebGL fallbacks, restored group section, ventures, gallery and pricing.
- GJL regression suite passed: original access link, protected assets, scroll choreography, service wheel, live 3D builder, editable plan, material controls, downloads, gallery and mobile.
- `npm audit --omit=dev`: zero known production dependency vulnerabilities. Four high advisories remain in the development-only ESLint/fast-glob/micromatch/braces chain. The suggested automatic fix would downgrade the Next lint plugin to an incompatible older major; no forced downgrade was applied.

These checks used local fixtures and local PostgreSQL execution. Real Supabase authentication, SMTP, Google consent/property permissions, refresh-token behaviour and live reporting still need the account setup and acceptance checks above. No SEO changes have been pushed or deployed.
