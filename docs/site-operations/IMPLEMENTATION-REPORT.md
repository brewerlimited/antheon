# Anthēon — search, measurement and site operations

**Later release:** the owner subsequently authorised production deployment. See [the release record](RELEASE-2026-10-06.md) for the deployed revision and successful live checks. The report below records the preceding local implementation handover.

**Delivered locally on 6 October 2026. No production deployment, deployment-triggering push, DNS edit, account purchase, listing submission or outreach was performed.** The current local website remains the source of truth.

## What changed

Anthēon now has a focused public service structure, repeatable search checks, a consent-controlled measurement implementation, a real persistence path for enquiries and a small operations area inside the existing private workspace. The intro, city, gallery, approved pricing, venture destinations and private GJL preview are preserved.

The code is implemented and locally tested. Supabase, Google properties, a working mailbox and continuous monitoring are **not connected or verified by this delivery**. Public pages work from reviewed code defaults without Supabase. Editing and accepted enquiries require the documented database setup; the interface does not pretend that missing configuration is a working service.

### Handover index

- [Requirements matrix](REQUIREMENTS-MATRIX.csv): capability-by-capability implementation, evidence, verification and remaining dependencies.
- [Keyword/page map](KEYWORD-PAGE-MAP.csv): 18 focused clusters, intent, evidence and page ownership.
- [Owner setup](OWNER-SETUP.md): exact remaining account and release actions.
- [Operations playbook](OPERATIONS-PLAYBOOK.md): editing, checks, reporting, DNS/email safety, incidents and recovery.
- [90-day plan](90-DAY-PLAN.md): priorities tied to business value, evidence and dependencies.
- [Research](RESEARCH.md): competitors, business facts, live DNS/hosting observations, costs and source limitations.
- [Public search details](PUBLIC-SEARCH.md) and [tracking specification](TRACKING.md).
- [Before/after visual comparison](evidence/visual-comparison.html): full unmasked matching hero states, mobile and tablet.

## Baseline and preservation

Before implementation, existing uncommitted work was preserved in local commit **`987b813`** on isolated branch **`work/site-operations-upgrade`**. This includes the existing SEO platform and periwinkle palette; the older live website was not copied over it. Secrets and generated unencrypted GJL material remain ignored.

The repository is Next.js 16.3.8, React 19.2.6, TypeScript and Tailwind 4. It already had the interactive Three.js city, intro, six independently labelled design concepts, approved £695 / £35 / £149 pricing, encrypted GJL route, and a local-first Supabase/Google SEO platform. The upgrade reuses that authentication, crawler, metrics and reporting implementation. No framework migration, dependency upgrade or new client tenancy was introduced.

`components/city`, `components/intro`, `public/images/city` and `app/globals.css` are byte-for-byte unchanged from the saved baseline. Homepage component edits add only a discreet service link row in the footer; metadata/JSON-LD and the root measurement component are separate. Public additions use scoped styles and existing typography/colours. The small Cookie choices control is intentionally new.

The GJL URL and private access mechanism remain unchanged. Its prebuild successfully assembled the encrypted bundle. Original-link access and all tested interactive behaviour passed locally. No unencrypted GJL asset, access key or private screenshot was added to the handover folder or repository.

## Public pages and search foundations

| Route | Final local behaviour |
| --- | --- |
| `/` | Existing venture-group and city presentation; shared Organization/WebSite identity and canonical metadata; discreet service discovery |
| `/web-design` | Original six concepts and three prices retained; useful service detail, process, trade-business context and FAQs added below |
| `/website-redesign` | Existing-site intent, URL/content preservation, migration process, examples and enquiry route |
| `/seo-services` | Approved £149/month service, realistic inclusions, data distinctions and no ranking guarantees |
| `/website-care` | Approved £35/month care/hosting, routine versus additional work and domain/email responsibilities |
| `/contact` | Necessary enquiry fields, honest unavailable/error/accepted states and existing email contact |
| `/privacy` | Actual enquiry/consent behaviour, processing limitations and owner-review requirements |
| `/sitemap.xml`, `/robots.txt` | Generated canonical public URLs and environment-specific crawl policy |

Four controlled service documents supply metadata, visible HTML, FAQs and links. Substantive content is server-rendered and readable without WebGL or JavaScript. There are no hidden keyword blocks, duplicate town pages, fictitious offices, construction-service claims, invented testimonials or fabricated project outcomes. Existing concepts remain independent explorations. A city case-study outline stays an unpublished evidence-gathering draft; no empty blog was created.

The canonical origin is **`https://www.antheon.co.uk`**, confirmed by the existing live apex redirect. Metadata is page-specific and does not derive from the preview hostname. Sitemap dates are real publication timestamps when available; static defaults omit a fabricated last-modified date. Drafts, private routes and concepts are excluded.

Production rules allow public crawling. Preview/development responses carry `X-Robots-Tag: noindex, nofollow` and robots disallow crawling; these are indexability measures, not access controls. Private routes keep server authentication and noindex. Production private noindex URLs are not blocked from receiving the directive by robots. A previously indexed URL would require its own removal/recrawl process.

JSON-LD adds accurate Organization, WebSite, Service, BreadcrumbList and ContactPage where relevant, sharing entity IDs. It omits unsupported addresses, hours, ratings, registrations and social profiles. FAQ content is useful HTML without a rich-result promise. Local syntax/entity consistency tests passed; Google's external rich-result/URL Inspection tools were not used to claim live validation.

No existing public slug was renamed. The existing redirect map remains:

| Existing URL | Permanent destination |
| --- | --- |
| `/concepts/hs-flooring` | `/concepts/surefix-interiors` |
| `/previews/hs-flooring/index.html` | `/previews/surefix-interiors/index.html` |

Both tested as single permanent redirects. Genuine missing public pages return 404. Invalid site-admin/demo routes are rejected before streaming can accidentally return HTTP 200.

## Measurement and enquiry handling

The prior unconditional Vercel Analytics component was removed. One GA4 implementation now requires explicit opt-in, actual configuration, the production hostname and an allowlisted public route. It neither loads optional tracking before consent nor replays earlier activity. Private, concept, preview and local activity is excluded. Accept, reject, revisit and withdrawal are supported; accessible consent UI follows the existing design.

The taxonomy separates contact intent, form/quote starts and accepted enquiries. `generate_lead` follows a newly persisted submission only, not a submit click, validation error or duplicate retry. Parameters use fixed context values; names, addresses, phone numbers, messages, IDs and sensitive URL parameters are excluded. Account-side Enhanced measurement must be disabled and `generate_lead` must be configured as a key event before activation. Neither account action has occurred.

`POST /api/enquiries` enforces origin and JSON/body bounds, field validation, a honeypot, keyed rate limits and unique submission idempotency. A matching retry can confirm an existing accepted record without another lead event. Missing credentials/storage produce a real 503, preserve the typed message and never display success. The fallback email link exists, but mailbox delivery needs owner verification.

The inbox uses durable PostgreSQL storage, protected by RLS and column privileges. Only agency admins can read messages or update review status; anonymous and ordinary client roles cannot. No email notification/confirmation provider is connected. The owner needs an inbox review routine, retention choice and privacy/controller review. Implementation is not a legal-compliance certification.

## Private site operations

Open `/seo/admin/site` after configuring the existing Supabase authentication. A read-only configuration preview is available locally at `/seo/demo/admin/site`; it uses actual Anthēon templates, disabled writes and explicit unavailable states.

The seven areas cover overview, controlled content, private project drafts, operations, technical checks, accepted enquiries and change history. Editors can save, privately preview, publish and restore revisions of four fixed service pages. Optimistic version checks stop stale drafts overwriting newer work; publication is separate from saving. Restoring creates a new draft rather than silently publishing it. Drafts, revisions and actor information are excluded from anonymous public reads.

Page URLs, template layout, proof classifications, related links and pricing structures stay controlled in code. All four core routes are protected against withdrawal through both the server action and SQL RPC, preserving fixed navigation. Removing a service requires a reviewed code/navigation/redirect change. Service text is validated plain text; private case studies can select only existing managed assets. Arbitrary uploads and public case-study publishing are deliberately outside this small editor.

For web design, the private preview clearly identifies the editable service section; the existing gallery/pricing remain above it on the public page. Other service previews use the public renderer. Content changes are cached and revalidated; public reads use anonymous published-only access, never a service-role key.

Operations records require evidence and a date before a human can mark them verified. Technical checks use fixed live Anthēon routes, bounded safe fetches and same-origin redirect restrictions, then store affected URLs, severity and date. They are point-in-time checks, not a monitor or a Google score. Manual checks come first. The change log provides protected monthly CSV/print reporting; existing Google reporting can be linked to one verified Anthēon workspace via `SITE_ANTHEON_PROJECT_ID`.

Migrations `202610060005_site_operations.sql` and `202610060006_site_enquiries.sql` are provided. They have run in local PostgreSQL-compatible PGlite tests, **not in a connected Supabase account**. Real authentication, SMTP recovery, API persistence, cache revalidation with a real project and live backup restoration remain integration acceptance checks.

## Verification results

All tests below ran locally. “Production rules” means a local compiled server with production indexing configuration, not a deployment.

| Layer | Result / evidence |
| --- | --- |
| Lint | `npm run lint` passed |
| Type/build | `VERCEL_ENV=production npm run build -- --webpack` passed, including TypeScript, 21 static pages and GJL prebuild; follows existing Vercel build command |
| Existing SEO suite | `npm run test:seo`: **13/13** passed |
| New site suite | `npm run test:site`: **12/12** passed; content/schema, actual SQL RLS/privileges, drafts/publication/revisions, idempotency and tracking validation |
| Public HTTP/HTML | **516/516** checks across 13 pages in preview mode; **516/516** again with local production indexing rules |
| Admin browser | **186/186** read-only checks, 22 desktop/mobile views, disabled demo writes, honest statuses, private redirect and invalid-route 404 checks |
| Public browser | Five commercial/contact routes at 1440×1000 and 390×844; single H1, no overflow/runtime errors, keyboard FAQ and no-JS content/CTA checks |
| Measurement browser | **13 checks**: real local missing-configuration failure; mocked accepted response and GA4 collector; opt-in/routing/no-PII/private exclusion/withdrawal/deduplication |
| City compiled regression | **39/39**: intro, actual WebGL draws, hover/keyboard districts, retained CTA, pause/resume, resize/disposal, onward scroll, existing content/gallery, reduced motion, no-WebGL/no-JS |
| Additional city navigation | **7/7**: reverse transition/top-down, return navigation, resumed district interaction and tablet overflow |
| GJL compiled regression | **19/19**: private route/assets, original access link, scroll/service wheel, WebGL builder, dimensions/plan/materials/download/gallery, mobile and no missing assets/runtime errors |
| Matched visual state | **27/27** baseline/after state comparisons; unchanged geometry, viewport, camera progress, stage height and scroll offsets |
| Public bundle inspection | 11 observed homepage script bodies checked: no selected backend-only markers; source imports reviewed. This is not a comprehensive security audit |

Public checks cover metadata, canonical origin, headings, JSON-LD, internal links/anchors, important-page discovery, sitemap, robots, redirects and genuine 404s. Repeat them with `npm run check:site -- --base http://localhost:3095`; use `--production` only when checking production rules.

Evidence JSON lives in [evidence](evidence/visual-comparison.html). Browser harnesses and the larger public/admin screenshot set remain in the task workspace `/Users/jackbrewer/Documents/Codex/2026-09-30/we/work/` and `outputs/site-operations/`. Private GJL screenshots remain local outside this repository handover. The visual comparisons are full screenshots; the hero was not masked out.

The default Turbopack build did not complete in the local sandbox and was stopped. The already configured webpack build completed with no suppressed checks. No dependency or build configuration was changed to evade a failure.

## Performance observations and limits

Three fresh Chrome runs per device, local compiled build, no network throttling, 8-second observation, desktop 1440×1000 at 1× CPU and mobile 390×844 at 4× CPU. Before/after use the same harness. Median observations:

| Measure | Desktop before → after | Mobile before → after |
| --- | --- | --- |
| Recorded eligible-HTML LCP | 56 → 48 ms | 140 → 112 ms |
| CLS | 0.00726 → 0.00729 | 0.01314 → 0.01314 |
| Long tasks / total duration | 2 / 111 → 2 / 107 ms | 2 / 256 → 2 / 257 ms |
| Transferred script bytes | 311,604 → 312,569 | 303,243 → 304,208 |
| Decoded script bytes | 1,113,865 → 1,117,551 | 1,094,295 → 1,097,980 |

The unusually early LCP values reflect eligible HTML during the intro on localhost. **They do not measure completion of the WebGL city, real network experience, INP or field Core Web Vitals.** Small timing differences are noise, not a claimed speed improvement. The meaningful finding is no observed material local regression and approximately 965 additional transferred JavaScript bytes for the new public controls.

The city retains 1,153 instances, 38 geometries and six textures; 40 draw calls at arrival and 42 when active. Existing compressed posters, local font, instancing, responsive fallback, reduced-motion support and offscreen rendering pause remain. Nothing visual was removed to improve a synthetic score. Field LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the relevant 75th percentile remain targets requiring real data.

## What is live-verified and what remains

Read-only public checks verified the www redirect, HTTP responses, authoritative Vercel nameservers and current TLS certificate. They found live `/sitemap.xml` and `/robots.txt` absent before this local work. The connected Vercel account could not retrieve the linked project, so account plan, production branch, environment scopes, logs and rollback availability are unverified. Repository configuration is not evidence of the live account settings.

Selected authoritative DNS queries returned no apex MX/TXT. This needs owner investigation and real inbound/outbound email testing; it is not a complete zone export or a definitive mailbox-failure test. No DNS records were changed. The playbook provides exact inventory, per-record approval, email preservation, validation and rollback procedures.

The owner confirmed Anthēon never meets customers in person. **Google Business Profile is not applicable.** No profile, fictitious address, LocalBusiness schema, review campaign or map-service area was created. Relevant citations and genuine link opportunities were researched only.

Before activation the remaining work is account-dependent: Supabase/auth/storage/backup, real enquiry acceptance, mailbox verification, Google ownership/OAuth/GA4 settings and live receipt, Vercel plan/project review, privacy review, external monitoring and separate release approval. Public Vercel Pro pricing was US$20/month plus applicable usage when researched; actual plan/billing and any other provider costs need owner approval. No services were purchased.

Search Console integration is reused, not fabricated. Generating a sitemap is complete locally; submitting it, Google processing it and indexing pages have not happened. Dedicated location/device rank tracking is not connected; Search Console average position remains correctly distinguished. Scheduled jobs, uptime alerts, citations and outreach are prepared operating steps, not completed services or business results.
