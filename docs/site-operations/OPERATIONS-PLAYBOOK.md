# Anthēon operations playbook

Version: 6 October 2026. Scope: Anthēon's existing site, its controlled content and its private operational records. Current delivery is local. Production publication, deployment, DNS/account changes, purchases and outreach require the owner's authorisation.

## Responsibilities and status language

Assign an owner and backup person for enquiries, content approval, technical incidents, account billing, DNS/email and privacy requests. Keep access in named accounts with least privilege; never circulate a shared admin password or put secrets in a report.

Use these states honestly:

- **Awaiting configuration:** required account/settings are absent.
- **Configured, unverified:** settings exist but the complete flow has not succeeded.
- **Verified:** a relevant real check succeeded, with evidence and its date.
- **Needs attention:** an observed problem needs action.

A dated record is not a live monitor. A green deployment is not a tested form. A local fixture is not a Google connection. Record source, scope, environment and date next to evidence; link only to safe evidence locations without tokens, enquiry text or unnecessary personal information.

## Manage content safely

1. Open `/seo/admin/site` after signing in. Choose one of the four managed service documents: web design, redesign, SEO services or website care.
2. Edit plain-text copy, section content, FAQs and metadata within the fixed template. Keep concepts, internal ventures and commissioned work correctly labelled. Related/proof links and prices are controlled in code. Existing approved visual assets are selectable in private case-study drafts; arbitrary HTML, layout controls and file uploads are not an editorial feature.
3. Save a draft. A successful save means the database accepted it; a failure must leave an error. Preview privately at desktop and mobile widths, check heading order and links, and review claims/prices. The hero and public global styles are outside these editing controls.
4. Publish only the reviewed revision in the intended environment. Publication is separate from saving a draft. Reload the public page and sitemap after cache revalidation; inspect its title, description and canonical. Check an anonymous window to ensure draft-only text is absent.
5. If another editor changed the revision, reload and reconcile it instead of overwriting their work. For a mistake, restore a prior revision as a **new draft**, review and publish it. Do not delete revision history as a shortcut.
6. All four core service pages stay available: `/web-design`, `/website-redesign`, `/seo-services` and `/website-care`. Withdrawal is disabled in both the server action and database function so the fixed navigation cannot point to a removed page. Use draft, publish and restore for ordinary changes. Removing a service requires a code-reviewed navigation and redirect change.

The four public URLs are locked. A proposed rename needs a code-reviewed change, explicit old-to-new redirect map, internal-link/sitemap/canonical updates and a permanent one-hop redirect to the closest replacement. Do not replace every missing URL with a homepage redirect. Keep the existing HS Flooring → Surefix redirects.

Case-study records remain private drafts. Record the work type, problem, delivery, evidence and publication permission. Do not turn a concept into a client project, add fabricated outcomes or publish a client preview without permission. Larger imagery changes use a managed update: check rights, choose dimensions/format, write appropriate alt text, preview and review the file change.

## Review enquiries and measure correctly

Check the private inbox on an agreed schedule; there is no email notification provider connected automatically. Review the accepted database record, reply through the approved business channel, then mark the operational status appropriately. “Reviewed” or “closed” is not evidence of qualification or sale.

Test enquiries are identifiable operational records and should be removed through an authorised retention process after testing; do not export message bodies to analytics. Set a documented retention period and deletion/access process with the owner. Necessary enquiry processing continues when visitors reject analytics.

Measurement taxonomy:

| Event/record | Meaning | Must not be described as |
| --- | --- | --- |
| `page_view` | A consented view on an allowed public route | An enquiry |
| `service_cta` | A useful contact/service link selected | A completed quote |
| `contact_click`, context phone/email/WhatsApp | Contact intent, when such a real link exists | Completed call/message or received enquiry |
| `form_start` | First interaction with the form | A submission |
| `quote_request_start` | Service-specific quote interest | An accepted quote request |
| Private inbox record | Server accepted and persisted the submitted enquiry | Automatically qualified lead or sale |
| `generate_lead` | Consented analytics event following a newly accepted enquiry | Full count of all enquiries, qualification or revenue |

Do not install another gtag/GTM/Vercel behavioural tracker alongside the chosen approach. Do not enable automatic Enhanced measurement without revisiting the implementation. Compare stored enquiries and consented events with their different collection rules; do not force the totals to match. Account key-event status must be checked in GA4 rather than inferred from source code.

## Search review and reporting

Use one Anthēon website workspace and the existing Google connection/sync flow. Manual refresh comes first. Capture source property, date range, last success and partial-data messages. For comparisons, use comparable periods with enough history. GA4 organic sessions and Search Console clicks measure different things; neither is a unique count of buyers.

Monthly workflow:

1. Read source coverage and failures before interpreting changes.
2. Review clicks, impressions, CTR, queries, landing pages and Search Console average position. Keep positions labelled as source averages, not precise local ranks.
3. Compare organic visits where available, accepted enquiries and separate contact intent signals.
4. Select one or two evidence-backed problems: an important page with unclear service details, an actual broken link, or a relevant query with a poorly matched page.
5. Record the hypothesis, affected URL, expected benefit, effort and owner. Make the approved change, annotate its date, and retain before/after evidence.
6. Review subsequent comparable data without attributing every change to that edit. Export the monthly report after reviewing coverage and private information. The site change-log CSV is `/seo/admin/site/export?month=YYYY-MM`; it contains that month's actions. Google performance report exports remain in the linked Anthēon reporting project.

Do not repeatedly rewrite the site, promise ranks, auto-publish generated content or create invented rank history. A future rank-provider/import workflow must preserve keyword, location, device, date and source.

## Repeatable checks and release routine

From the project root, run the existing SEO tests and new site tests, lint, types, production build and site checker. The implementation report records results used for this release.

```sh
npm run test:seo
node --import tsx --test tests/site/*.test.ts
npm run lint
npx tsc --noEmit
npm run build -- --webpack
```

Run the internal route/link checker against the current preview:

```sh
node --import tsx scripts/check-public-site.mjs --base http://localhost:3095
```

For a compiled local server on a separate port, substitute its origin. Add `--production` only when deliberately testing production indexing rules (or an approved live release). The default preview mode expects noindex and robots `Disallow: /`; a preview result must not be confused with a production indexing fault. Verify public metadata, canonical origins, sitemap membership, JSON-LD, anchors, redirects, missing-page statuses and orphaned important pages. Never run a form success test against a real business inbox without marking/authorising the test.

For visual acceptance compare matching viewport sizes, scroll positions and settled animation timing. Include intro/arrival, activation, isometric city, district hover/touch/keyboard, onward/reverse scroll, resize and return navigation. Check reduced motion and no-WebGL fallbacks. Preserve the GJL original-link access and interactive preview. A build passing does not prove these behaviours.

Before any approved release: save a recoverable code baseline; review the file diff; back up affected database content; list environmental changes; identify the last good deployment; record approval. Verify live public routes, form behaviour, privacy/consent, sitemap and protected pages after the authorised deployment. Do not send test traffic to GA4 from local or preview hosts.

## Domain and email change control

No DNS change is needed merely to implement this local upgrade. Before a later approved change:

1. Confirm the exact domain, owner, registrar, authoritative DNS provider and target Vercel project. For Anthēon the observed authoritative provider is Vercel DNS, but account ownership still needs confirmation.
2. Export the full current zone from that provider and store it privately with date, TTLs and record IDs. Public `dig` queries are a useful cross-check, **not a complete backup**. Inventory MX, every relevant TXT/SPF/verification entry, DKIM selectors, DMARC, autodiscover, SRV and CAA.
3. Obtain exact current record requirements from the target provider for this domain. Do not use remembered generic Vercel addresses or copy values from another client's project. Preserve nameservers unless a separately approved migration makes changing them necessary.
4. Fill in one row per actual change using the template below. “Preserve” rows are explicit checks, not changes. Have a second person review when possible. Obtain approval for the exact plan and any cost.

| Name | Type | Current value + TTL | Proposed value + TTL | Reason/source | Action | Validation | Rollback |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `@` / website host | A/AAAA as applicable | From zone export | Exact target-project instruction; otherwise unchanged | Provider domain configuration | Preserve or individually replace approved website entry | DNS answer, HTTPS host, canonical response | Restore this record's saved value/TTL |
| `www` | CNAME/A as actually configured | From zone export | Exact target-project instruction | Provider domain configuration | Preserve or replace only this approved entry | DNS, valid certificate, 200 canonical page | Restore saved value/TTL |
| `@` | MX, one row per record | From export, including priority | Email provider's exact approved entries | Verified mailbox setup/migration | Preserve unless email migration approved | Provider verification plus inbound/outbound test | Restore each MX priority/value/TTL |
| `@` | TXT/SPF | Every current TXT value separately | Approved SPF policy if required | Email provider | Preserve; update one SPF policy, never add a conflicting second SPF record | SPF lookup and provider test | Restore original SPF value only |
| Provider DKIM selectors | TXT/CNAME | Each existing selector | Provider-specific entries only | Email provider | Preserve or add named new selectors | Provider DKIM validation and test headers | Restore/remove only changed selector |
| `_dmarc` | TXT | Current policy or absent | Owner-reviewed policy | Email/security owner | Preserve unless approved | Lookup and authenticated message test | Restore previous record/state |
| `autodiscover`; service names | CNAME/SRV | All relevant records | No change unless mail provider requires it | Mail client/provider setup | Preserve | Client discovery and relevant service check | Restore affected entries |
| `@` or provider host | TXT/CNAME verification | Existing verification entries | Exact owner-generated Search Console value | Search Console ownership screen | Add separate record; keep others | Authoritative/public lookup then Google Verify | Remove only the added record if abandoned; retain verified token for continued ownership |
| Domain | CAA | Existing issuers and flags | Unchanged unless certificate requirement reviewed | TLS provider | Preserve | HTTPS/certificate checks | Restore affected CAA entries |

5. Make only the approved edits and record timestamps. Validate authoritative answers, then public resolver answers after relevant TTLs. A DNS save is not proof of propagation or certificate readiness.
6. Check website apex/www, HTTPS, expected redirects, enquiry path, real mail delivery and provider verification. Retain the old service until the rollback window closes.
7. If validation fails, stop unrelated edits. Restore affected records from the exact export (including priorities/TTLs), verify DNS and mail again, and record incident/cause. Do not replace the entire zone blindly. A cached bad answer may persist until TTL expiry; communicate the limitation.

Sources: [Vercel domains and email](https://vercel.com/docs/domains/working-with-domains), [Google ownership verification](https://support.google.com/webmasters/answer/9008080?hl=en). Never store provider secrets, private home addresses or complete personal account data in the public repository.

## Monitoring and incident recovery

A successful HTTP check is only a point-in-time observation. To establish continuous monitoring, choose an approved external service, frequency and budget; cover the canonical homepage and a lightweight critical public page plus certificate expiry; assign alert recipients and test delivery. Do not probe private client previews with an unauthorised third party. Keep the monitor's status separate from the site's dated technical audit.

The private **Technical health** button checks the fixed live `https://www.antheon.co.uk` routes and saves the dated result. It does not inspect the local preview; before deployment, new local pages can correctly appear as 404 in that older live environment. Use the route checker above for local content.

For an incident:

1. Confirm the affected environment, URL and time. Read deployment/runtime logs with access controls. Do not print secrets or enquiry payloads into shared diagnostics.
2. Identify whether the issue is code, content, database, Google quota/token, DNS/email or external-provider outage.
3. For a content mistake, restore/review/publish the correct revision. For a code release fault, the authorised operator can choose a known-good production deployment in Vercel **Deployments → Instant Rollback**, verifying domain scope first.
4. Code rollback does not reverse database migrations, CMS edits, DNS records or external API changes. Use the appropriate content revision, tested database backup or record-specific DNS rollback instead. Avoid destructive database reversal; prefer a forward repair with preserved data.
5. Check public routes, city, GJL, forms, private access and affected integrations after recovery. Record cause, evidence, response and follow-up. Review Vercel's auto-assignment state after rollback before normal releases resume.

See [Vercel rollback documentation](https://vercel.com/docs/instant-rollback). Account eligibility and retained deployments must be verified before relying on this runbook; they were not available through the connected account during this task.

## Reuse for client websites

Choose one content operating model per agreement: **controlled CMS editing** for approved fields, or **managed updates** submitted to Anthēon for review and release. Keep layout, hero, typography and private information outside ordinary editorial controls. Do not add multi-tenant client administration for this single-site task.

For each client repeat the access inventory, approved service scope, evidence/permissions check, domain/email export, consent/tracking plan, private acceptance tests, release approval, monitor ownership and rollback rehearsal. Record real recurring costs and the responsible payer. Never clone another client's credentials, reviews, analytics property, location claims or private designs.
