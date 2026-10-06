# Anthēon Motion

The Anthēon Group website, with a cinematic opening and an interactive architectural city representing its ventures, software and digital work.

The redesign was developed in an independent copy, preserving the original local project. The base redesign is published through the `main` branch of `brewerlimited/antheon` and its existing Vercel integration at https://antheon.co.uk. The fullscreen intro is included in the approved production release.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm ci
npm run dev -- --port 4317
```

Open http://localhost:4317. The installed copy in this workspace already has dependencies available.

To replay the intro during development, open http://localhost:4317/?intro=1 and refresh to play again. This override is disabled in production. For a frozen motion-review frame, add `&at=2.2` (architectural surge), `&at=3.23` (near formation), `&at=3.6` (lock), or `&at=4.94` (navigation handoff).

The 4.95-second intro runs once per browser session. Direct section links and restored scrolled positions go straight to their destination. Reduced-motion visitors go straight to the website. Skip appears after 800ms, Escape exits immediately, and failed WebGL or essential assets release the page. A lightweight aerial render of the city loads underneath from the initial document. The live city renderer starts after the intro releases the page, avoiding two simultaneous animated WebGL scenes. No-JavaScript visits remain usable; failed hydration has a bounded timeout.

For production:

```bash
npm run build
npm start -- --port 4317
```

## What's included

- Architectural WebGL opening with 13,800 desktop / 6,200 mobile identity particles, deep perspective grids, electric-blue and violet reflections, node constellations, topographic ribbons, foreground fragments and camera travel. Coloured particles resolve into the white navigation logo, with a 0.25-second longer full-logo hold before a precisely styled copy moves into the real header position while the hero resolves through the environment.
- Original generated architectural artwork, locally stored and optimised as WebP.
- A pinned Three.js city: dark aerial arrival, scroll-driven camera descent, staged lights/routes/windows, subtle traffic, and four discoverable districts.
- Hover-driven district stories with subtle crossfades, compact keyboard/touch navigation, pause/resume and a direct link past the experience.
- The original full group introduction and its scroll-revealed statement follow the city, ahead of the existing services, selected work and ventures.
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
- `components/city/CityHero.tsx` — intro-aware loading, native scroll progress, accessible district discovery, responsive fallbacks and lifecycle management.
- `components/city/city-scene.ts` — deterministic procedural architecture, instanced geometry, façade lighting, camera choreography, raycasting and traffic.
- `components/city/districts.ts` — the four district descriptions and destinations.
- `components/city/city.css` — hero composition, scroll handoff and mobile presentation.
- `public/images/city/` — aerial, isometric and mobile stills rendered from the actual Three.js city. Earlier motion artwork remains available but is not loaded by the homepage hero.
- `components/VentureGallery.tsx` and `components/venture-gallery.css` — venture gallery and cursor interactions.
- `public/images/motion/ventures/` — five generated venture scenes, optimised as WebP.
- `docs/venture-image-prompts.json` — exact prompts used with the built-in image generator.

The service scenes feature Pride Flooring, Surefix Interiors and Anchor Flooring. Selected work features Intimate Detail, Eventco and Hamilton Flooring; these sections do not repeat a website.

The six portfolio examples are independent design explorations, not claims of commissioned client work. Venture links, pricing and business details were preserved from the original project.

## Intro upgrade validation

After the colour and logo-hold refinement, normal-speed desktop (1280 × 720) and mobile (390 × 844) previews completed in 4.95–4.96 seconds. In the local 120 Hz browser, measured animation callbacks averaged 120 fps with a p95 frame interval of 9.0ms or less. These are local browser measurements, not a guarantee for every device. The logo handoff measured zero pixel offset in position and dimensions on desktop and mobile, with no mobile overflow or browser console errors. TypeScript, targeted ESLint and production build checks passed. The preceding validation also checked breakpoint resize, session bypass, keyboard skip, reduced-motion startup gating and failed-hydration timeout; renderer cleanup was rechecked after this refinement. The intro is approved for production publication through the existing GitHub-to-Vercel integration.

## Analytics integration

Vercel Web Analytics is installed through `@vercel/analytics/next` in the root layout, covering page views and navigation across the Next.js pages. The privacy notice includes the analytics disclosure. This release includes the approved analytics integration, SVG icon fix and three-line scroll headline. After deployment, verify that Web Analytics is enabled for the Anthēon project and confirm page views arrive in its Analytics dashboard.

## City hero

The opening animation is preserved. Its final brand handoff reveals a dark aerial city. Native document scrolling then activates windows, embedded routes and traffic while moving the orthographic camera into a settled isometric composition. There is no scroll interception. Further scrolling fades the scene into the group introduction and existing website.

The city uses instanced geometry, shared materials, procedural façade shaders, a single cached shadow map and limited raycasting. It needs no external models or texture requests. Rendering stops when offscreen, in a hidden tab, during the intro, or when paused. Low sustained frame rates reduce resolution. Resize, breakpoint changes and unmount release scene resources. Context loss or import failure falls back to the rendered stills and working district controls.

Widths up to 800px, viewports up to 560px high, reduced-motion preferences, data-saving connections and devices reporting at most 2GB of memory receive the lighter still-image experience. It contains the same district information and destinations without a long pinned scroll area. With JavaScript disabled, the district links and existing services remain available.

District selection persists when the pointer moves from a building to its information link. The information panel crossfades between districts without shifting its layout. Discreet previous/next arrows provide the same interaction with keyboard or touch. Contact, portfolio, venture and pricing routes are unchanged.

For local visual maintenance only, the development canvas exposes `document.querySelector('.city-canvas').cityScene`, with `capture()` and `getStats()`. This is absent from production. Render the scene at progress 0 and 0.67 to refresh the aerial/isometric posters after geometry changes; the mobile still crops the actual activated render to the entire city. The production experience does not rely on this diagnostic handle.
