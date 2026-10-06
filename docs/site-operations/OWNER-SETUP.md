# Owner setup — activate Anthēon's website operations

Prepared 6 October 2026. **The upgrade is local. Nothing in this checklist authorises a production deployment, DNS change, purchase or public submission.** Complete account setup in a test environment first. Do not paste secrets into chat, commit them, or overwrite the existing GJL preview keys.

This guide is for Anthēon's own website. The older [SEO platform guide](../seo-platform.md) contains detailed authentication/Google setup; its multi-client onboarding is not required for this upgrade.

## 1. Confirm the operational owner and working enquiry destination

**Owner action:** confirm who reviews enquiries, which mailbox receives `hello@antheon.co.uk`, and who controls Vercel, the registrar and DNS. Send and receive a real test message using an independent mailbox, then record the outcome privately.

The address is already displayed on the site, but 6 October public and authoritative checks returned no apex MX/TXT records. This is a configuration check to resolve, not proof that a particular mailbox has failed. Vercel hosting does not itself supply email. If setup is needed, choose an email provider and obtain its exact domain-specific records. Follow the [record-by-record DNS process](OPERATIONS-PLAYBOOK.md#domain-and-email-change-control); do not change nameservers or remove existing records. See [Vercel's domain/email guidance](https://vercel.com/docs/domains/working-with-domains).

**Completion evidence:** inbound/outbound delivery, provider verification and an approved response owner. Keep message contents out of public reports. The new private enquiry inbox does not send email notifications automatically; someone must check it.

## 2. Connect durable storage and private admin access

**Required access:** an owner-controlled Supabase project, its SQL/migration access, and the target environment's secret settings.

1. Select an appropriate Supabase project/region and review the plan, backup availability and costs. Do not use an unrelated database or a public demo project.
2. Apply all pending files in `supabase/migrations` in timestamp order. A new installation needs `202610060001` through `202610060006`; an existing installation needs only unapplied migrations. The new files are `202610060005_site_operations.sql` and `202610060006_site_enquiries.sql`. Inspect the migration history and dry run before applying.
3. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in local `.env.local` for testing. Production values belong in Vercel's **Production** environment only after approval; use separate test storage for preview writes. Never put the service key in a `NEXT_PUBLIC_` variable.
4. Set `SEO_APP_URL` to the exact environment origin: `http://localhost:3095` locally; `https://www.antheon.co.uk` for an eventual approved live release. Keep `SEO_DEMO_MODE=false` in production.
5. In Supabase Auth, disable public signup, configure email/password authentication, approved redirect URLs and a real SMTP sender. Use the invite/recovery token-hash templates in the [platform setup guide](../seo-platform.md#1-configure-a-dedicated-supabase-project).
6. Create the owner's account, then promote that exact auth UUID in `public.seo_users` through the trusted SQL dashboard to `super_admin`. Do not use profile metadata as an admin role.
7. Sign in at `/seo/login`, then open `/seo/admin/site`. Test a service draft, private preview, publication in the test environment and restoration of an earlier revision. All four core service URLs are protected: withdrawal is rejected by both the server action and database function. Use draft, publish and restore for normal edits; removing or renaming a route needs a code-reviewed navigation and redirect change. Sign out and verify the admin, drafts, revisions and inbox cannot be read anonymously or by an ordinary client account.
8. Generate a separate random 32-byte server-side `SITE_ENQUIRY_HASH_KEY` encoded as exactly 64 hexadecimal characters and configure it with the enquiry endpoint. This protects the keyed request hashes used for abuse prevention; it is not a public analytics identifier.

**Completion evidence:** successful login/recovery; persisted content after refresh/restart; real database records; cross-role denial; one accepted test enquiry visible in the private inbox; failed requests show an error rather than a false success. Local SQL/mock tests do not replace these real-service checks.

## 3. Configure Google measurement deliberately

**Required access:** Anthēon's Google Analytics administrator/editor and Google Cloud owner. Do not create a second GA4 installation if a real one already exists.

1. Identify or create the correct GA4 property and a web stream for `https://www.antheon.co.uk`. Record the property ID, stream and time zone.
2. Disable **Enhanced measurement** in that web stream. The application supplies its own restricted page views and events; automatic URL/form/click measurement would risk duplication and unwanted parameters. Verify the setting before setting `GA4_ENHANCED_MEASUREMENT_DISABLED=true`.
3. Configure `GA4_MEASUREMENT_ID` with the actual `G-…` ID. Keep `SITE_ANALYTICS_ENABLED=false` until account settings, policy review and acceptance checks are ready. Enabling analytics requires `SITE_ANALYTICS_ENABLED=true` and the enhanced-measurement confirmation flag.
4. Review Google Signals, advertising personalisation, user-provided data and data-sharing options; keep unnecessary advertising features disabled for this measurement plan. Review GA4 retention and the privacy notice against actual settings.
5. The application only sends optional analytics on the canonical production hostname and approved public routes after consent; Vercel preview environments are also excluded. Localhost and ordinary preview hosts are excluded. A local mocked collector test proves application behaviour, not GA4 receipt. Arrange a controlled acceptance test at the approved production hostname after deployment, with an explicit test record in the change log.
6. In GA4, mark **`generate_lead`** as a key event after confirming it represents an accepted enquiry. Do not mark generic page views, form starts, city interaction or contact clicks as confirmed enquiries. Retain contact clicks as separate intent signals.
7. Confirm one accepted submission produces at most one `generate_lead` event; validation failures, network failures, retries and duplicate server responses do not produce another. Verify no names, email addresses, message text, submission IDs, URL queries or private paths are sent.
8. Test accept, reject, revisit choices, withdrawal and route changes. The consent choice expires after 180 days; optional analytics remains off without a valid acceptance. The enquiry form must work when analytics is rejected.

The precise event parameters, consent lifecycle and form protections are documented in [TRACKING.md](TRACKING.md).

**Completion evidence:** exact account setting screenshots, browser network observations and a matching GA4 event. A configured environment variable is not evidence of receipt. GA4 consented leads may be fewer than stored enquiries; neither count is qualified leads or sales. [Google's event reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)

The conservative opt-in approach remains in place. An analytics exception must not be assumed: the ICO describes purpose-specific conditions, so any alternative needs a separate review. Review the actual controller details, processing purposes, retention, processors/transfers and contact information before launch. [ICO exceptions guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)

## 4. Verify Search Console and link the existing reporting flow

1. In an owner-controlled Google account, create/select **Domain property `antheon.co.uk`**. It is represented as `sc-domain:antheon.co.uk` by the API. Obtain the exact Google-provided TXT/CNAME verification record; no token has been invented or inserted.
2. Export/inventory the current DNS zone, obtain approval for the individual record addition, add it alongside existing records at the authoritative provider, then click **Verify** in Search Console. Leave the record in place. A nameserver change is unnecessary. [Property setup](https://support.google.com/webmasters/answer/34592?hl=en) · [Verification](https://support.google.com/webmasters/answer/9008080?hl=en)
3. Enable Search Console API, Analytics Data API and Analytics Admin API in the owner-controlled Google Cloud project. Configure the OAuth web application and the exact `/seo/auth/google/callback` URI, consent/audience/scopes, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` and a securely backed-up `SEO_TOKEN_ENCRYPTION_KEY`. Follow [the existing Google setup](../seo-platform.md#2-create-google-oauth-credentials); do not build another integration.
4. Create one Anthēon website workspace in the existing private application and select its real Search Console and GA4 properties. This is only for Anthēon's reporting, not a requirement to launch client tenancy. Set `SITE_ANTHEON_PROJECT_ID` to that workspace UUID if using the site-operations reporting shortcut.
5. Run each manual sync. Check source, period, last success and any partial/error state. Backfill the prior comparison interval before drawing trend conclusions. Exercise the real token refresh and reconnect paths.
6. After an approved deployment, check that `https://www.antheon.co.uk/sitemap.xml` is live, then submit that exact sitemap in Search Console. Record submission, processing and page indexing separately. Use URL Inspection's manual live test where needed; the API does not force indexing or perform a live render test.

**Completion evidence:** verified owner property, actual property selection, stored real data, dated successful sync and source-labelled report. Sitemap publication/submission does not guarantee indexing.

## 5. Confirm hosting, monitoring and release ownership

The connected Vercel account could see the team but not retrieve the linked Anthēon project. Log in with the correct owner account and verify **project `antheon`**, domain assignment, Git repository/production branch, build command, environment scopes, deployment protection, log access and last good production deployment.

- Current repo build is `npm run build -- --webpack`, including the encrypted GJL prebuild. Preserve both GJL environment values and its original route.
- Confirm the actual plan and spend limits. Vercel's public Pro price was US$20/month plus applicable usage/seats/add-ons when checked; Hobby is for personal/non-commercial use. Actual account charges remain unverified. Review before approving any purchase. [Current pricing](https://vercel.com/pricing)
- Choose an external uptime/HTTPS-expiry monitor, interval, alert recipients and escalation owner. No monitor or working alerts have been established by this task. Approve any fee, configure it and trigger a test notification before recording “verified”.
- Confirm database backups and perform a restore rehearsal in an isolated environment. Confirm the last good deployment remains available for rollback; code rollback does not restore database content.
- Keep scheduled sync disabled until manual sync works and a real scheduler, bearer secret, quota budget and failure alerts are configured and tested.

**Release gate:** review the local implementation, test evidence, unresolved account dependencies and privacy/service wording. Approve the specific production deployment separately. After release, run public route, hero, GJL, form, consent and indexing checks at the live hostname. Do not call local testing “production verified”.

## Not required for this launch

- **Google Business Profile:** owner confirmed online-only operation with no in-person customer contact; creation is not applicable under [Google eligibility rules](https://support.google.com/business/answer/13763036?hl=en).
- **Paid rank/backlink/local-grid tools:** optional later, with an approved source, budget and implementation. Search Console average position is not exact local rank tracking.
- **New town pages, a blog feed or public case-study claims:** only when genuine evidence and a distinct reader need justify them.
- **Citation submissions and outreach:** researched options are in [RESEARCH.md](RESEARCH.md); nothing has been submitted or messaged. Any action requires owner approval and accurate, privacy-appropriate business details.
