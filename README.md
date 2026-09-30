# Anthēon Group Website

Production website for Anthēon Group, with a six-design interactive portfolio.

Built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- next/image

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

This is a standard Next.js app and is ready to import into Vercel from GitHub.

## Vercel

The repository includes `vercel.json` to force the Next.js framework preset and clear any stale Output Directory override left from earlier non-Next builds. In Vercel Project Settings, the Output Directory should be blank/default for this app.

## Website concepts

`data/concepts.ts` defines six concepts. The first three appear on the homepage;
`/web-design` contains all six. Every `/concepts/[slug]` page embeds the original
interactive homepage with its scroll effects, hover states and local controls.
The preview toolbar supports full width, mobile width, restart and browser full
screen where available. The homepage and gallery load only small thumbnails;
only the selected detail page loads its interactive preview.

The designs are explicitly labelled independent concepts, not commissioned
client work. Detail pages and preview resources use `noindex`. No private Sites
URLs, credentials, original servers or third-party iframe hosts are required.

### Preview architecture

Each `public/previews/<slug>/index.html` has its own CSS, JavaScript and local
assets. The iframe uses `sandbox="allow-scripts"` without same-origin, forms,
popups or top navigation permissions. `preview-guard.js` keeps local section
links and harmless interactions, blocks outbound links and fetches outside
that preview's assets, and provides in-memory storage where sandboxed browser
storage is unavailable. `next.config.ts` supplies the CORS and CSP headers
needed for fonts, local gallery JSON and isolated scripts. Google Fonts are
permitted for the static concepts that originally use them. Enquiries do not
submit; the HS floor-finder advances locally through button controls.

These are the original six homepages adapted for viewing inside the portfolio:
Intimate Detail, Eventco Marquees, Pride Flooring (red version), Hamilton
Commercial Flooring, Anchor Flooring and Harvey Simon (HS) Flooring. Original
project folders and their hosting have not been changed.

### Maintaining previews

- Static Pride, Anchor and HS previews are editable HTML/CSS/JS snapshots under
  `public/previews/`; only homepage assets and interactions are included.
- React preview source and per-preview build instructions are in `preview-src/`
  for Intimate Detail, Eventco and Hamilton. These isolated sources are excluded
  from the main Next.js type/lint checks; the shipped bundles are already built.
  Normal `npm run build` does not require their separate build dependencies.
- To add a design, add its packaged homepage, one 1440×1000 WebP thumbnail under
  `public/images/concepts/` and a record in `data/concepts.ts`. Keep the shared
  guard script before its application scripts and verify the sandboxed version.
- The old full-page WebP captures remain for compatibility with saved links,
  but the current portfolio renders real interactive pages instead.

The main site uses a self-hosted Geist variable font with its licence in
`public/fonts/LICENSE.txt`, so its typography needs no external font request.
Motion is subtle and respects reduced-motion preferences. Warm colour changes
highlight headings and panels; links also use fine rules and small arrow movements.

Venture URLs live in `data/site.ts` and appear in both the venture list and brand
rail. Empty URLs leave the venture visible without a link. Commercial Co-Pilot,
ClearQuote and Anthēon Outdoor are linked; GetYourPrint and Dualis remain unlinked.
