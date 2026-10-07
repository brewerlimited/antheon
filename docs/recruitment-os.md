# Recruitment OS — interactive product exploration

Two isolated routes were added to the existing Next.js App Router project:

- `/recruitment-os`: Anthēon presentation, interactive workforce fragment, demo launch and existing `/contact` CTA.
- `/recruitment-os/demo`: full-screen construction recruitment workspace, explicitly labelled DEMO and `noindex, nofollow`.

The existing homepage, city, client previews, SEO platform and public service pages are unchanged. Nothing in this feature connects to Supabase or a communication provider. This feature has not been deployed to production.

## Explore the commercial workflow

1. Launch the demo and click the **318 Available now** metric.
2. Open Filters. Choose Groundworker, Northampton, 30 miles and CSCS — Labourer card. The combined query returns **38 actual records**. Adding CPCS Forward Tipping Dumper also retains these 38.
3. Open Jamie Clarke, inspect placements/tickets, and close the drawer. The original query remains.
4. Select first 20 → Message 20 → attach JOB-184 in Northampton.
5. Pick a channel, edit the template and inspect the personalised preview. Simulate send, then simulate delivery and replies.
6. Add interested workers to the shortlist. Open the job to see the updated shortlist and transparent match scores.
7. Clear candidate filters, switch to Availability board, and drag a worker to Working. Confirm the placement. Drag back to Available, record the actual finish date, and inspect the linked history. Undo reverses the entire local mutation.
8. Messages → Check availability demonstrates an unknown-status campaign. The initial 417 unknown workers become 392; available workers increase by 11.
9. Settings → Reset demo restores the deterministic snapshot, after confirmation.

Other working features include Cmd/Ctrl+K search, candidate creation/editing, calls and clipboard, combined filters, saved views, column controls, sorting, CSV export, recruiter assignment, unlimited custom qualifications, sample document attachments, job creation, match controls, site/client drawers and notes, placement date views, compliance reminders, inbox replies, editable templates, operational notifications and the optional tour. Mobile has a focused candidate list, full-screen profile sheets and a status menu instead of requiring dragging.

## Data and boundaries

`lib/recruitment/types.ts` defines the domain objects and mutation commands. IDs link candidates, qualifications, clients, sites, jobs, placements, broadcasts, recipients, messages, notes and activity.

`seed.ts` builds the same fictional snapshot every time. The clock is deliberately fixed at **7 October 2026**, as labelled in the interface. It contains 2,486 lightweight candidate records, 24 jobs, 20 clients, 32 sites, 120 placements, hundreds of messages/activity entries and thousands of qualification records. This is larger than the brief's approximate 250–400 candidates so the requested exact headline numbers and filtering demonstration are backed by real records, not inflated display counters.

Initial headline counts are 1,137 working, 318 available, 276 open to work, 417 unknown and 338 not looking. Finishing within 14 days (94) is a subset of working, not an extra status. Only 100 working records are agency-managed current placements; other working statuses are explicitly self-reported. Four upcoming bookings account for JOB-184's 4/6 filled positions. Future bookings do not falsely mark a worker as already on site. Dates do not advance with the wall clock.

`selectors.ts` owns combined filtering, date windows, approximate straight-line town/postcode-centroid distances, metrics, audience exclusions, matching and template interpolation. Matching is deterministic, not AI: availability 25, distance 25, trade 25, verified required tickets 15, comparable completed placement 10. Future booking overlaps prevent suitable-match status. Scores explain every component. The optional plain-English parser recognises a documented, limited vocabulary.

`engine.ts` is a pure command processor. A command returns a new snapshot and feedback. Starting work creates a placement; finishing it records an actual finish date. Related logs, candidate statuses and metrics change together. Broadcast commands exclude opted-out/invalid contacts; the composer can additionally exclude working people. Delivery/replies are repeatable and idempotent. Pending deliveries cannot have replies. Availability replies never silently end a managed placement. Shortlists deduplicate IDs. Job-linked placements validate client/site relations and filled capacity.

`store.tsx` adapts this command layer to React, versioned localStorage (`antheon:recruitment-os:v1`) and a five-change undo history. Local mutations are immediately reflected across modules. Parse/version failures fall back to the seed; storage quota failures show a warning; the route error boundary offers retry or explicit reset. **localStorage is not secure storage, an audit system or a shared database.** Separate tabs are independent sessions; reload to read another tab's persisted snapshot. No real personal information should be entered.

UI modules under `components/recruitment/` use context actions and a stack of native dialogs to preserve the underlying workspace. Domain behaviour is outside the components. `recruitment.css` and the presentation CSS use isolated `ro-`/`rp-` selectors, with no broad changes to existing site styles. No dependencies were added.

## Deliberately simulated

- SMS, WhatsApp and email queue/delivery/replies: local state only, no external requests.
- Phone calls: log a demo activity, never initiate a call.
- Qualification documents: attach/remove a sample filename; no upload, issuer lookup or verification.
- Website registrations and job enquiries: relational seeded examples, not live form integrations.
- Recruitment user, organisation and role: fictional context, no authentication or permissions.
- Distances: listed town/outward-postcode centroids, not geocoding or driving directions.
- Clock: labelled frozen snapshot, not a scheduler or live availability feed.

Demo mobile numbers use Ofcom's reserved `07700 900000–900999` range. Emails use `example.com`. Some candidates intentionally have no recorded mobile, expired tickets or unverified documents so exclusion/compliance flows can be demonstrated. The central ticket catalogue is broad, illustrative and extensible, not an exhaustive or authoritative eligibility service.

Catalogue/contact references checked during implementation:

- https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbers-for-drama
- https://cpcs.nocn.org.uk/help-and-support/cpcs-support-documents/revision-support-documents/a09-forward-tipping-dumper/
- https://cpcs.nocn.org.uk/site-map/
- https://www.ipaf.org/en-us/resource-library/ipaf-categories

## Verification

Required checks:

```sh
npm run test:recruitment
npm run lint
npx tsc --noEmit
npm run build -- --webpack
```

Eight domain tests cover the seed/relations, actual 38-worker query, combined tickets, placements and completion, future booking conflicts, broadcast exclusions and replies, shortlists, availability updates, custom qualifications, editing and saved views. The webpack build is the existing Vercel build configuration and retains the encrypted GJL assembly step.

The two browser harnesses exercise the complete requested journey plus the remaining modules, responsive layouts and keyboard/clipboard/export interactions. They require an available Playwright installation and Chrome; no browser dependency is added to the application. Run against a local Next server, optionally overriding `DEMO_BASE_URL` and `PLAYWRIGHT_MODULE` (an absolute Playwright entry path if it is supplied by external tooling):

```sh
node scripts/verify-recruitment-flow.mjs
node scripts/verify-recruitment-extended.mjs
```

They write results, failure diagnostics and screenshots beneath ignored `work/recruitment-qa/`. Each browser run uses a fresh context and fictional data. The full-flow harness asserts no third-party network requests. Desktop 1512×982, tablet 834×1112 and mobile 390×844 are covered, including preserved filters, profile tabs, actual pointer drag, status-menu changes, reload persistence and confirmed reset.

## Eventual production version

Keep the domain command/query boundary. Replace the local adapter with authenticated API/server actions, validated transactions and a relational Postgres/Supabase model. Add organisation scoping, role permissions and tested row-level security; secure private document storage and malware scanning; server-side audit events, idempotency and concurrency handling; consent/communication preferences and provider webhooks; retention/deletion/export workflows, backups and restore checks. Date/time handling must become explicit per organisation, with scheduled expiry/availability jobs. Real messaging and file verification require actual integrations and delivery/error handling; the demo must not be mistaken for those capabilities.
