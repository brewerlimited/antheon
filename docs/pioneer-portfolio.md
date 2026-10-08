# Pioneer Bros portfolio addition

The interactive design is hosted at `/concepts/pioneer-bros`, with local assets under `/previews/pioneer-bros/`. It is an independent concept, not commissioned work or the company's official website. Original photography/logo attribution is retained in `public/previews/pioneer-bros/assets/pioneer/provenance.json`.

Imported from the Pioneer Bros private Site source commit `04cae186c21a33da9713f08d6c9a8370e41fa639`, including alternating gallery entrances. The portfolio copy uses the existing preview guard and iframe sandbox: enquiry sends, external links and downloads are disabled. The quote builder can still be explored. The original standalone Site is unchanged.

`data/concepts.ts` is the collection registry. Add future designs there, and host their matching preview assets. `featuredConcepts` explicitly selects the three homepage/initial gallery entries; `additionalConcepts` automatically supplies the native Show more dropdown. No hard-coded gallery totals remain. Intimate Detail is retained in the expanded collection.

The Pioneer card uses its actual photograph, original logo and a lightweight HTML cover based on the design. It does not load a running iframe until the concept page opens.

After changing the imported JavaScript, run `node scripts/build-pioneer-preview.mjs` with the existing development dependencies installed and commit the resulting `preview-app.js`. The prebuilt IIFE avoids module-origin restrictions in the existing sandbox. Preserve the guard ahead of it and keep preview contact actions disabled.

This release starts from the verified 6 October production source (`3384848`, documenting application commit `9684ad9`). The separate Recruitment OS draft is not included in this portfolio deployment.
