# PAYE portfolio addition — 8 October 2026

PAYE Stonework & Restoration is the second featured website design, after Pioneer Bros and before Eventco. Hamilton remains available in Show more alongside the other retained concepts. The shared featured selection also presents PAYE second on the homepage.

- Concept page: `/concepts/paye`
- Embedded homepage: `/previews/paye/index.html`
- Original private Site source commit: `a5b6f7d9f5602e4de79b4bcf81ab28dc3bf19bcc`
- Imported React source: `preview-src/paye/`
- Photography credits: `public/previews/paye/image-credits.json`

The original homepage composition, reversible GSAP image handovers, craft enlargement, responsive layout and Bricolage Grotesque/Instrument Sans fonts are retained. The portfolio version uses the existing opaque-origin sandbox and preview guard. External links, case-study navigation and enquiries are disabled consistently with the other homepage previews. The original standalone Site remains separate.

`node scripts/build-paye-preview.mjs` rebuilds the checked-in browser bundle. If GSAP is not installed in the current development dependencies, set `PAYE_DEPENDENCIES` to the original PAYE project's node_modules directory. Antheon production builds use the checked-in bundle and need no new runtime dependencies. Source photographs and font licenses are local.

This release is based on `1ddee2c`, the current Pioneer portfolio production lineage. It excludes the unpublished Recruitment OS draft in the primary checkout.
