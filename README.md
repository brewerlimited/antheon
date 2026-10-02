# Anthēon Motion

The Antheon Group website, redesigned with a cinematic, scroll-led experience inspired by Dotech's motion and presentation.

The redesign was developed in an independent copy, preserving the original local project. The base redesign is published through the `main` branch of `brewerlimited/antheon` and its existing Vercel integration at https://antheon.co.uk. The fullscreen intro is included in the approved production release.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm ci
npm run dev -- --port 4317
```

Open http://localhost:4317. The installed copy in this workspace already has dependencies available.

To replay the intro during development, open http://localhost:4317/?intro=1 and refresh to play again. This override is disabled in production. For a frozen motion-review frame, add `&at=2.2` (architectural surge), `&at=3.23` (near formation), `&at=3.6` (lock), or `&at=4.94` (navigation handoff).

The 4.95-second intro runs once per browser session. Direct section links and restored scrolled positions go straight to their destination. Reduced-motion visitors go straight to the website. Skip appears after 800ms, Escape exits immediately, and failed WebGL or essential assets release the page. The existing hero starts loading underneath from the initial document. No-JavaScript visits remain usable; failed hydration has a bounded timeout.

For production:

```bash
npm run build
npm start -- --port 4317
```

## What's included

- Architectural WebGL opening with 13,800 desktop / 6,200 mobile identity particles, deep perspective grids, electric-blue and violet reflections, node constellations, topographic ribbons, foreground fragments and camera travel. Coloured particles resolve into the white navigation logo, with a 0.25-second longer full-logo hold before a precisely styled copy moves into the real header position while the hero resolves through the environment.
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

- `components/intro/IntroExperience.tsx` — intro lifecycle, readiness, session behavior, skip, accessibility and transition.
- `components/intro/IntroBootstrap.tsx` — pre-paint first-visit gate and fail-open timeout.
- `components/intro/intro-scene.ts` — batched Three.js architecture, independent world/identity cameras, custom shaders and deterministic motion timeline.
- `components/intro/navigation-brand.ts` — sampling and exact decorative clone of the live navigation wordmark, including typography, tracking and GROUP subline.
- `components/intro/intro.css` — midnight-blue environment, responsive annotations, architectural transition and hero-entry treatment.
- `components/MotionHome.tsx` — home content, scroll updates and interactions.
- `components/motion-home.css` — layout, motion and responsive styling.
- `app/globals.css` — existing inner-page styles with a coordinated blue palette.
- `data/site.ts` and `data/concepts.ts` — preserved venture and portfolio content.
- `public/images/motion/hero-fibres.webp` — selected optical-fibre hero artwork, with the earlier arch preserved as `hero.webp`.
- `components/VentureGallery.tsx` and `components/venture-gallery.css` — venture gallery and cursor interactions.
- `public/images/motion/ventures/` — five generated venture scenes, optimised as WebP.
- `docs/venture-image-prompts.json` — exact prompts used with the built-in image generator.

The service scenes feature Pride Flooring, Surefix Interiors and Anchor Flooring. Selected work features Intimate Detail, Eventco and Hamilton Flooring; these sections do not repeat a website.

The six portfolio examples are independent design explorations, not claims of commissioned client work. Venture links, pricing and business details were preserved from the original project.

## Intro upgrade validation

After the colour and logo-hold refinement, normal-speed desktop (1280 × 720) and mobile (390 × 844) previews completed in 4.95–4.96 seconds. In the local 120 Hz browser, measured animation callbacks averaged 120 fps with a p95 frame interval of 9.0ms or less. These are local browser measurements, not a guarantee for every device. The logo handoff measured zero pixel offset in position and dimensions on desktop and mobile, with no mobile overflow or browser console errors. TypeScript, targeted ESLint and production build checks passed. The preceding validation also checked breakpoint resize, session bypass, keyboard skip, reduced-motion startup gating and failed-hydration timeout; renderer cleanup was rechecked after this refinement. The intro is approved for production publication through the existing GitHub-to-Vercel integration.

## Analytics integration

Vercel Web Analytics is installed through `@vercel/analytics/next` in the root layout, covering page views and navigation across the Next.js pages. The privacy notice includes the analytics disclosure. This release includes the approved analytics integration, SVG icon fix and three-line scroll headline. After deployment, verify that Web Analytics is enabled for the Anthēon project and confirm page views arrive in its Analytics dashboard.

## Fibre hero refinement

The selected Connected Flow image uses nine small SVG light sprites (six visible on mobile) in `components/FibreParticles.tsx`. The traced paths are sampled once, then native Web Animations move individual sprite layers using only transforms and opacity. Crop coordinates, glow, timing and path direction match the original effect. Motion pauses offscreen, in hidden tabs, during the intro and for reduced-motion preferences. No JavaScript animation loop or WebGL context is added.

The expanding hero and text transition use native CSS scroll timelines where supported. Pixel-based ranges preserve the original zoom, fade and movement timing, including the stable mobile viewport. Older browsers update the three affected layers directly instead of propagating an inherited animation variable through the hero. Resize measurements are batched into a frame, horizontal service scrolling is read separately, and unchanged styles are skipped. The original intro and reduced-motion behavior are retained.
