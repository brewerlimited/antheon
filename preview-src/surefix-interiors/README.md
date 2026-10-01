# Surefix Interiors interactive homepage

The portfolio uses the latest “Expertise. Built in.” Surefix homepage. Its prerendered markup, compiled React bundle, stylesheet and local assets are packaged in `public/previews/surefix-interiors/`. All three service tabs, hero animation, reading progress, parallax, section reveals, hover effects and mobile navigation are preserved.

Re-import an updated, already built Surefix project with:

```sh
node scripts/import-surefix-preview.mjs /path/to/built/surefix-interiors
```

The supplied source folder must contain `dist/index.html`, its compiled resources and `app/site.tsx`. The script reads that folder without modifying it. It forces the packaged client route to the homepage, wraps the standalone bundle as a deferred classic script, rebases local images/fonts and copies only homepage assets plus imagery required by every service tab. It rejects changes to the bundle structure that need a new adapter.

The main website build consumes the packaged static files and needs no Surefix dependencies. The shared `/previews/preview-guard.js` loads first; Antheon embeds the page with `sandbox="allow-scripts"` and supplies resource CORS/CSP headers. Navigation away from the homepage and form submission remain disabled.

The gallery thumbnail is a 1440×1000 capture of the rendered homepage after the hero entrance finishes. Refresh it separately if the source hero changes.
