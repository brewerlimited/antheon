# Hamilton interactive homepage preview

This is a self-contained copy of the Hamilton concept homepage, adapted for a sandboxed portfolio preview. The original project remains unchanged. Seven local photographs are in `public/previews/hamilton-flooring/images/`; the compiled preview is in that same directory.

The copied page retains the expanding sticky hero, word reveal, material switcher, moving client names, horizontal project sequence, chapter navigation, hover effects and motion control. The small accessible `Tabs.tsx` replaces the original Base UI wrapper, with arrow, Home and End keys and inactive panels excluded from keyboard focus.

To rebuild after installing the main website dependencies:

```sh
cd preview-src/hamilton-flooring
npm install
npm run build
```

Alternatively, run `node scripts/build-hamilton-preview.mjs` from the website root with `ESBUILD_MODULE` set to an available esbuild module file. The build uses the parent website’s React dependency and requires no original project files.

The iframe host supplies `public/previews/preview-guard.js` to preserve local section navigation and interactions while blocking external navigation, form submissions and outgoing requests. Serve all preview resources with CORS headers and embed with `sandbox="allow-scripts"`.

The viewport uses the original responsive layout and system font. A small spacing correction keeps the fixed motion control clear of the hero’s scroll prompt.
