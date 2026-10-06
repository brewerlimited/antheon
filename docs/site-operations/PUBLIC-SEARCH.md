# Public search implementation and evidence

Local implementation, checked 6 October 2026. No deployment, Search Console submission or indexing claim is made here.

## Content and routes

The visually led homepage, intro, city components, gallery concepts and pricing were retained. The homepage change in this workstream is metadata, Organization/WebSite JSON-LD and a discreet service navigation row in the footer.

| Route | Purpose | Indexing intent |
| --- | --- | --- |
| `/` | Venture-group positioning, products and digital work | Public |
| `/web-design` | Existing interactive gallery and prices, with substantive design-service detail added below | Public |
| `/website-redesign` | Existing-site assessment, redesign scope and careful migration | Public |
| `/seo-services` | Approved £149/month monitoring and optimisation service; realistic measurement and scope | Public |
| `/website-care` | Approved £35/month management, hosting, updates and maintenance, with scope explained | Public |
| `/contact` | Project enquiry form and existing email contact | Public |
| `/privacy` | Measurement and enquiry privacy information | Public |
| `/concepts/*` | Independent concepts, not commissioned client results | Existing noindex retained; excluded from sitemap |
| `/seo/*`, `/client-preview/*`, `/previews/*` | Private management or preview experiences | Existing access/noindex controls retained; excluded from sitemap |

Substantive pages answer who the service is for, the problem, scope, process, inspectable examples and next action. Native HTML details/summary elements provide useful FAQs without a JavaScript dependency. Concept links explicitly retain their provenance. There are no town-page combinations, fabricated offices, invented outcomes, testimonials, rankings or client relationships. The existing Buckinghamshire connection is used; the owner confirmed online-only operation, so the contact copy does not suggest a customer-facing office.

`data/public-content.ts` provides the fixed four `ServiceDocument` defaults. `lib/site-content.ts` overlays validated, published CMS revisions. The renderer in `components/public-content/ServiceContent.tsx` controls layout; editorial content is plain text. The private case-study structure includes an unpublished city-implementation story stub which needs real evidence and publication approval before public use.

## Search foundations

- `data/site.ts` uses `https://www.antheon.co.uk`. Read-only live requests confirmed the non-www origin permanently redirects to www; production was not modified.
- `lib/site-metadata.ts` centralises canonical and sharing metadata. Each service has its own title, description and URL. Public canonical URLs never derive from a preview hostname.
- `app/sitemap.ts` reads the published content source. It includes only canonical public routes. Drafts, concepts and private previews are excluded. Static defaults have no invented last-modified dates; real editorial revision timestamps may be supplied by the CMS.
- `app/robots.ts` blocks crawling on nonproduction deployments. Production permits public rendering and declares the canonical sitemap. Private noindex responses remain crawlable so crawlers can see the directive; authentication, rather than robots.txt, provides privacy. `/api/` is excluded from crawling.
- Root deployment headers separately apply noindex to nonproduction responses. A blocked preview URL is not treated as a mechanism to remove a URL already indexed.
- Existing HS Flooring redirects remain single permanent redirects to the corresponding Surefix concept/preview. No public service slug was removed or renamed.

Structured data uses consistent `#organisation`/`#website` entity IDs. The homepage has Organization and WebSite. Commercial service pages have Service and BreadcrumbList, while contact has ContactPage and BreadcrumbList. Fields match visible content. Unknown addresses, telephone numbers, registration numbers, ratings, opening hours and social profiles are omitted. The existing 48px favicon is not repurposed as a claimed 112px-plus organisation logo. Service is descriptive Schema.org markup, not a promise of a Google-specific rich result. Useful FAQ text is present without FAQPage markup or a rich-result claim. JSON encoding escapes `<` so editorial text cannot terminate its script element.

## Repeatable checks

From the repository root, with the local server running:

```sh
node --import tsx scripts/check-public-site.mjs --base http://localhost:3095
node --import tsx --test tests/site/public-seo.test.ts
```

The route check defaults to **preview** protections. Use `--production` only against a server built with production indexing rules or an approved production deployment. It fetches HTML, checks real status codes, single canonical routes, titles/descriptions/sharing metadata, primary headings, JSON-LD syntax and entity fields, internal links and anchors, inbound discovery, sitemap membership, robots policy, both legacy redirects and a genuine missing-page 404. It does not submit anything externally, follow private application links or scrape search results.

An intentional core-route withdrawal needs navigation and redirect review before it can pass these checks. This catches a missing service page rather than silently accepting it because it disappeared from the sitemap.

### Local results

- 5 public-search unit tests passed: editable default content validation, production canonicals, sitemap draft/date behaviour, evidence-constrained schema and JSON-LD script safety.
- 516/516 HTTP/HTML checks passed across 13 pages in preview mode: seven public routes and six concept pages.
- TypeScript and scoped ESLint checks passed.
- Browser checks passed at 1440×1000 and 390×844 for web design, redesign, SEO, care and contact. Each had one primary heading, no horizontal overflow, discoverable footer links and no browser runtime errors.
- Native FAQ controls opened by keyboard. Service copy and the enquiry link remained visible with JavaScript disabled.
- New-page screenshots were captured and visually reviewed; existing city/regression checks are recorded separately by the main implementation verification.

Local screenshot evidence: `/Users/jackbrewer/Documents/Codex/2026-09-30/we/outputs/site-operations/public-pages/`, including `browser-checks.json` and `{website-redesign,seo-services,website-care,contact,web-design}-{desktop,mobile}.png`.

These are local tests. External Google Rich Results Test/URL Inspection, Google recrawling, live canonical adoption and indexing are still unverified and require approved deployment and the appropriate account access.

## Documentation consulted

Official guidance checked on 6 October 2026:

- [Google Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization): use relevant, accurate organisational facts; put the identity on the homepage.
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): canonical URLs and genuine modification dates.
- [Google title-link guidance](https://developers.google.com/search/docs/appearance/title-link): descriptive, distinct page titles.
- [Google Search documentation updates](https://developers.google.com/search/updates): the former FAQPage documentation URL redirects here; no FAQ rich-result strategy is used.

Research sources, query-to-page choices and unavailable commercial metrics are documented separately in `RESEARCH.md` and `KEYWORD-PAGE-MAP.csv`.
