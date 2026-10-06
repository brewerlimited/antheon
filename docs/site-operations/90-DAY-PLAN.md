# Anthēon 90-day improvement plan

Prepared 6 October 2026. Day 1 means the beginning of the **approved activation period**, not an assumption that this local work is already live. Priorities reflect business value and available evidence; volumes/ranks are unavailable. The aim is a reliable enquiry journey and a small number of measurable improvements, not a promised traffic or ranking result.

Effort: S = up to half a working day of focused work; M = roughly one to two days; L = several days or dependent on external review. These are planning estimates, not service commitments. Owner approvals, provider processing and data accumulation can take longer.

| Window | Priority / work | Business value and evidence | Effort | Dependency / owner | Acceptance evidence |
| --- | --- | --- | --- | --- | --- |
| Days 1–7 | P0 — verify enquiry handling and mailbox | Public hello@ address exists; authoritative checks found no apex MX/TXT. Lost contact routes would undermine all search work. | S–M | Owner/email provider; DNS change approval if required | Independent inbound/outbound message test; named inbox reviewer; exact records documented |
| Days 1–7 | P0 — connect Supabase and private admin | Content and accepted enquiries need durable storage; demo fixtures are not a live service. | M | Owner Supabase/auth/SMTP access; plan review | Migrations applied; named admin; save/reload/revision and role-isolation tests; backup/restore check |
| Days 1–7 | P0 — confirm Vercel project, plan and recovery | Connector could not inspect the linked project. Current costs, production branch and rollback eligibility are unverified. | S | Correct account owner | Project/repo/domain/build/env scope verified; cost and spend controls recorded; known-good deployment identified |
| Days 1–14 | P1 — review service scope and local result | Existing approved prices support clear commercial pages; concepts are design evidence, not commissioned cases. | M | Owner commercial review | Four service pages reviewed; true inclusions, FAQ answers and no unsupported turnaround/VAT/SLA claims |
| Days 1–14 | P1 — complete consent/GA4 setup | Reliable measurement requires one installation and accepted-lead semantics. | M | Owner GA4 access/privacy review | Enhanced measurement disabled; explicit opt-in; safe events; account key event checked; no preview traffic |
| Days 1–14 | P1 — verify Search Console and manual sync | Search data and indexing status are currently unavailable. | M | Owner Google access; approved DNS record addition | Verified property; real OAuth/select/sync/refresh test; dated source-labelled data |
| Days 8–21 | P1 — approve and verify release | Local success is not live verification. Preserve city and GJL while making useful pages discoverable. | M | Explicit production approval; all launch blockers resolved | Live public/metadata/form/consent/private/hero/GJL checks; no regression; rollback ready |
| Days 8–21 | P1 — submit live sitemap, inspect important pages | Local sitemap availability alone does not get pages indexed. | S | Approved live release and Search Console owner | Submission timestamp/status; selected manual live tests; indexed/not-indexed states recorded separately |
| Days 8–21 | P1 — activate external monitoring | Point checks provide no continuous alerting. | S | Owner monitor/provider approval and alert destination | URL/SSL monitor configured; test alert delivered; escalation owner confirmed |
| Days 15–30 | P1 — establish an honest baseline | Newly connected sources may lack enough data for comparisons. | S | Successful sync; defined period and service source | Baseline records coverage, clicks/impressions/CTR/pages, organic sessions and enquiry/intent distinctions |
| Days 15–30 | P2 — review original content and internal routes | Useful service copy and direct links should answer buying questions without bloating the homepage. | M | Real enquiry questions plus first search data | One documented friction point fixed; link/canonical checks pass; edit annotated |
| Days 15–30 | P2 — assess two accurate business profiles | Buckinghamshire Business First and LinkedIn are plausible relevant presence; no submissions yet. | S | Owner approval; eligibility/privacy details | Existing-profile check; approved accurate submission if suitable; live URL recorded only when visible |
| Days 31–45 | P1 — first monthly review/report | Enough data may begin to show relevant queries, pages and enquiry patterns. | S | Comparable coverage; no invented prior history | Source-labelled report; two next priorities with evidence; incomplete data explained |
| Days 31–60 | P2 — improve one high-intent page | Select from actual query/page and enquiry evidence, not keyword repetition. | M | Owner copy approval; sufficient observations | Hypothesis + before/after content + dated annotation; later comparison planned |
| Days 31–60 | P2 — prepare one genuine case study or city article | Real implementation is stronger evidence than fictional outcomes. | M–L | Publication permission and verifiable project facts or actual city measurements | Private draft with work type/evidence/permission; publish only after review; no empty blog feed |
| Days 31–60 | P2 — assess field performance and technical faults | Preserve visual quality; local lab measurements do not prove real-user CWV. | M | Real field data where available; reproducible lab method | LCP/INP/CLS source and coverage labelled; fix a verified fault; visual regression checks retained |
| Days 46–75 | P2 — selective relationship/editorial outreach | Relevant genuine relationships or useful original work may earn attention. | S–M | Finished evidence-backed work; explicit permission to contact/publish | Small approved target list; outcome logged; no paid ranking links, bulk submission or fabricated reviews |
| Days 61–90 | P1 — second/third monthly reviews | Determine which changes deserve continuation using comparable data. | S each | Source continuity; annotation history | Clear distinction between clicks, visits, accepted enquiries and business outcomes; next change justified |
| Days 61–90 | P2 — decide whether deeper tracking is worth its cost | Exact local ranks/backlinks are not available from Search Console averages. | S | Actual business need, approved provider quote/budget | Documented decision to defer or implement a licensed provider/import with date/device/location/source |
| Days 61–90 | P2 — rehearse recovery and review access/retention | Prevent operational drift as content and personal data accumulate. | M | Owner and technical maintainer; isolated test environment | Backup restoration tested; stale access removed; retention process executed; monitor/alerts rechecked |

## Monthly decision rule

Review data → choose a specific problem → prioritise by relevance, likely value, effort and confidence → obtain approval → make a focused change → annotate → inspect the subsequent comparable period.

If history is too sparse, fix observable usability/technical defects and collect more data. If a page gains clicks but enquiry quality is unknown, inspect the enquiry journey before declaring success. Seasonal effects, measurement consent, source delays and multiple changes can confound comparisons.

## Deliberately excluded

- Google Business Profile: owner confirmed no in-person customer contact, so creation is not applicable under [Google's eligibility rules](https://support.google.com/business/answer/13763036?hl=en).
- Interchangeable town pages, invented offices or construction-service pages advertising Anthēon as a trades business.
- A large blog schedule, automatic AI publication, fabricated case studies, purchased ranking links, incentivised reviews or guaranteed ranks.
- A new multi-client SaaS, CRM, DNS panel or unapproved paid rank provider.

Revisit the [keyword map](KEYWORD-PAGE-MAP.csv) after real Search Console and enquiry evidence appears. Keep one main page per purchase intent; add a sector or article page only when it can answer a distinct need with enough original evidence. Research, costs and source limitations are documented in [RESEARCH.md](RESEARCH.md).
