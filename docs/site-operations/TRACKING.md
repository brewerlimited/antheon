# Public measurement and enquiries

Implementation date: 6 October 2026. This is a local implementation, not evidence of an active GA4 property or live enquiry inbox.

## Existing installation and decision

The root layout previously loaded Vercel Web Analytics unconditionally. It is now removed. A single GA4 integration handles the explicitly listed public marketing routes. There is no Google Tag Manager installation, parallel Vercel analytics tag, server-side Measurement Protocol sender or advertising tag. The Vercel analytics package is left installed to avoid unrelated lockfile churn but no component imports it.

`components/measurement/PublicMeasurement.tsx` owns consent and route handling. `lib/measurement/policy.ts` defines the public route allowlist and event names; `lib/measurement/client.ts` owns the provider. Unknown paths, `/seo/**`, client previews and interactive design concept routes are excluded. Preview hostnames and localhost cannot send analytics. New public routes must be deliberately added to the allowlist.

## Configuration — owner action before activation

Use these server environment variables in the approved **production** environment only:

| Variable | Meaning |
| --- | --- |
| `GA4_MEASUREMENT_ID` | The web stream ID, in `G-...` format. Not an API secret. |
| `SITE_ANALYTICS_ENABLED=true` | Explicitly enables optional measurement. Leave false until the account is ready. |
| `GA4_ENHANCED_MEASUREMENT_DISABLED=true` | Set only after completing the account setting below. |
| `SITE_ENQUIRY_HASH_KEY` | Independent random 32-byte key encoded as 64 hexadecimal characters. Server only. Generate securely, never paste into chat or commit it. |

The first three configure GA4. The last enables form fingerprinting and rate-limit hashing. The form also needs the existing `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` and the applied database migrations. No new service account or paid email service is required by this implementation.

1. Create/select the owner-controlled GA4 property and a web stream for `https://www.antheon.co.uk`.
2. In **Admin → Data collection and modification → Data streams → web stream → Enhanced measurement**, turn **all Enhanced measurement options off**, including page changes based on browser history and form interactions. Automatic form events, URL query extraction and history page views would conflict with the deliberately bounded implementation. The code uses `send_page_view: false`, which alone does not disable account-side history measurement.
3. Keep Google signals, ads personalisation, user-provided data collection, cross-domain measurement, linked advertising products and automatic data sharing off unless separately reviewed and approved. No user IDs or form values are sent by this code.
4. Set property data retention to the shortest useful approved period (review 2 months) and review Google’s processing terms, region/transfer arrangements and access permissions. Review the privacy notice’s controller identity and retention wording with the business owner.
5. Add the environment values above, after approval to deploy. The browser additionally requires exactly `www.antheon.co.uk`; Vercel preview environments and other hosts are disabled.
6. On an approved test visit, accept analytics and use GA4 Realtime/DebugView as appropriate to confirm one `page_view` per pathname transition. Check every event below and inspect network requests for sensitive data. The local test suite uses mocked Google requests; it does not prove receipt by a live property.
7. Mark **`generate_lead` only** as a key event in GA4 (Admin → Data display → Events/Key events). Do not mark contact clicks, starts or city interaction as leads. That account setting has **not** been completed here.

## Consent behaviour

This intentionally uses conservative opt-in, without assuming the UK statistical-purpose exception applies to this installation.

- No Google script, analytics cookies, consent-mode pings or Vercel analytics requests before acceptance.
- Equal prominence for Accept analytics and Reject analytics. No preselected consent. Forms work without analytics.
- Choice stored as the essential preference `antheon:analytics-consent:v1` in local storage, with version and date, for 180 days. Storage failure falls back to the current document’s in-memory choice.
- Cookie choices is available on public pages; the privacy notice also provides a button. Accepting begins measurement from the current page. Earlier navigation/clicks/forms are never replayed.
- Withdrawal immediately disables the Google destination, clears accessible `_ga*`/`_gid`/`_gat` cookies and reloads the document to remove provider timers and listeners. It cannot recall data already received by Google.
- Cross-tab preference changes are observed. The tracking helper rechecks consent and pathname on every event.
- GA4 cookies are configured for at most 180 days without renewal. Advertising storage/personalisation/user-data consent remains denied.

## Event taxonomy

All URLs are constructed from a fixed canonical origin and approved pathname. Search parameters, fragment identifiers, arbitrary DOM text, addresses, email addresses, phone numbers, user IDs and form contents are never used as event parameters. Referrers are blank or the previous approved public path. Form IDs are fixed, not user-provided.

| Event | Trigger | Safe parameters | Interpretation |
| --- | --- | --- | --- |
| `page_view` | Initial accepted page and later pathname changes, once each | canonical `page_location`, safe path title, approved previous path | A consented public page visit; hash changes are not extra page views |
| `contact_click` | `tel:`, `mailto:` or recognised WhatsApp link click | `context`: phone/email/whatsapp | Intent only; not evidence of a completed call or message |
| `service_cta` | Navigation to a known service/contact destination | fixed service/contact context | Service/contact interest only |
| `form_start` | First focus in this enquiry form per mount | `form_id: public_enquiry`, service context | An enquiry was started, not submitted |
| `quote_request_start` | First selection/focus of a specific service per form mount | same fixed form ID and service enum | A service enquiry was started |
| `generate_lead` | API confirms a **new durably saved** enquiry | fixed form ID, service context | Accepted enquiry, not qualification, a sale, value or revenue |

There is no artificial currency/value attached to a lead. Quote requests are the service-specific subset of `generate_lead`; a second success event is deliberately not emitted. Interactive city activity is not currently tracked. If added later it must remain engagement only.

A request UUID is used locally for submission idempotency, never sent to GA4. Duplicate API responses do not emit another `generate_lead`. If the initial response was lost after saving, a retry confirms acceptance without a second event; GA4 can therefore undercount accepted inbox records. Rejection, blockers, network loss and users declining consent also mean the inbox count and GA4 cannot be expected to match.

## Enquiry persistence and operations

Apply `supabase/migrations/202610060006_site_enquiries.sql` after the earlier SEO migrations. The public POST endpoint is `/api/enquiries`. `ContactForm` is reusable with an optional service enum, and `/contact` hosts it. The existing email address remains a working fallback link.

The server enforces same-origin requests, JSON-only payloads, a 16 KiB streaming body cap, field/type/length bounds, a honeypot, and durable rate limits through the existing service-only RPC. On Vercel the platform-owned IP header is used; arbitrary forwarded client IPs are not trusted. IP and email rate-limit identifiers and request fingerprints are keyed hashes. No raw IP is stored in the enquiry table and no form body is logged by this endpoint.

The unique idempotency key makes insert races safe. Only an identical keyed fingerprint can receive a successful duplicate response; a different payload with the same key returns conflict. Missing database/key/migration, failed persistence, rate limits and failed requests cannot produce a success screen or lead event.

The table contains name, email, service, message, received date and review status. Anonymous users have no table privileges. Existing authenticated client accounts cannot read it. Only Anthēon admin roles can read it and update **status** through RLS; user sessions cannot insert, rewrite contact details or delete records. The server service role creates accepted messages. Owner-approved deletion/retention maintenance can be performed securely in the database.

**Delivery is inbox-only. No email notification or confirmation provider is connected.** Administrators must check the private inbox until email notifications are separately implemented and tested. Test submissions use fictional details only. An accepted message is not a promise of a response time.

Owner review before activation: confirm legal controller identity, assign inbox ownership and a review routine, select documented retention periods, verify Supabase backup/location/access settings, review provider agreements and confirm an operational email inbox. The privacy notice is implementation text requiring owner review, not a legal compliance certification.

## Sources reviewed

- [Google: manual page views and disabling history measurement](https://developers.google.com/analytics/devguides/collection/ga4/views).
- [Google: recommended events, including generate_lead](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead).
- [Google: consent mode implementation](https://developers.google.com/tag-platform/security/guides/consent).
- [ICO: managing consent in practice](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/).
- [ICO: storage and access technologies](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-storage-and-access-technologies/).

## Repeatable checks

Run `node --import tsx --test tests/site/measurement*.test.ts`. These tests cover the allowlist, configuration/consent gates, expiry, contact intent taxonomy, sensitive URL stripping, duplicate prevention, byte/input/CSRF validation, database uniqueness and actual PostgreSQL RLS/column privileges through PGlite. Browser/network checks are recorded in the implementation report separately. A Supabase account, live Google receipt, key-event configuration, real inbox workflow and production behaviour still require owner-authorised integration testing.
