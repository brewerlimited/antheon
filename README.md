# Anthēon Motion

The Antheon Group website, redesigned with a cinematic, scroll-led experience inspired by Dotech's motion and presentation.

The redesign was developed in an independent copy, preserving the original local project. Production is published through the `main` branch of `brewerlimited/antheon` and its existing Vercel integration at https://antheon.co.uk.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm ci
npm run dev -- --port 4317
```

Open http://localhost:4317. The installed copy in this workspace already has dependencies available.

For production:

```bash
npm run build
npm start -- --port 4317
```

## What's included

- Original generated architectural artwork, locally stored and optimised as WebP.
- Pinned hero with scroll-driven image zoom and typography transition.
- Scroll-revealed group statement.
- Three horizontally moving desktop service scenes and a touch-friendly mobile carousel.
- Stacking selected-work cards that open the existing detailed concepts.
- Five-venture image gallery with original AI-generated scenes, pointer-following cursor, image parallax and venture detail dialogs; keyboard-accessible navigation and working email links.
- All six original design concepts, interactive embedded website previews, pricing and privacy page.
- Responsive layouts, reduced-motion alternatives and shared cool-blue styling.

The main website permits search-engine indexing. Portfolio concept pages and embedded previews retain their noindex settings. Contact links open the visitor's email app; there is no new form backend.

## Main files

- `components/MotionHome.tsx` — home content, scroll updates and interactions.
- `components/motion-home.css` — layout, motion and responsive styling.
- `app/globals.css` — existing inner-page styles with a coordinated blue palette.
- `data/site.ts` and `data/concepts.ts` — preserved venture and portfolio content.
- `public/images/motion/hero.webp` — original generated hero artwork.
- `components/VentureGallery.tsx` and `components/venture-gallery.css` — venture gallery and cursor interactions.
- `public/images/motion/ventures/` — five generated venture scenes, optimised as WebP.
- `docs/venture-image-prompts.json` — exact prompts used with the built-in image generator.

The service scenes feature Pride Flooring, Surefix Interiors and Anchor Flooring. Selected work features Intimate Detail, Eventco and Hamilton Flooring; these sections do not repeat a website.

The six portfolio examples are independent design explorations, not claims of commissioned client work. Venture links, pricing and business details were preserved from the original project.
