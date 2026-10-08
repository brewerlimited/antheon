// Rebundle the checked-in buildless Pioneer Bros source for the opaque-origin portfolio iframe.
import { build } from 'esbuild';
await build({
  entryPoints: ['public/previews/pioneer-bros/app.js'],
  outfile: 'public/previews/pioneer-bros/preview-app.js',
  bundle: true,
  format: 'iife',
  target: 'es2020',
  minify: true,
});
