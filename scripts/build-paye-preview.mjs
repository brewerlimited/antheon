// Bundle the retained PAYE React homepage for the existing opaque-origin preview sandbox.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
const root=process.cwd();
const source=path.join(root,'preview-src/paye');
const target=path.join(root,'public/previews/paye');
const require=createRequire(path.join(root,'package.json'));
await build({
  entryPoints:[path.join(source,'entry.tsx')],outfile:path.join(target,'app.js'),bundle:true,
  format:'iife',platform:'browser',target:'es2020',jsx:'automatic',minify:true,legalComments:'eof',
  nodePaths:process.env.PAYE_DEPENDENCIES?[process.env.PAYE_DEPENDENCIES]:[],
  alias:{'@':source,'react':path.dirname(require.resolve('react/package.json')),'react-dom':path.dirname(require.resolve('react-dom/package.json')),'next/link':path.join(source,'next-link.tsx'),'next/navigation':path.join(source,'next-navigation.ts')},
  define:{'process.env.NODE_ENV':'"production"'},
});
await fs.copyFile(path.join(source,'styles.css'),path.join(target,'styles.css'));
await fs.writeFile(path.join(target,'index.html'),`<!doctype html>
<html lang="en-GB" data-scroll-behavior="smooth"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>PAYE — Interactive design concept</title><link rel="stylesheet" href="/previews/paye/styles.css" crossorigin="anonymous"><script src="/previews/preview-guard.js"></script></head><body><div id="root"></div><script src="/previews/paye/app.js"></script></body></html>`);
console.log('PAYE homepage preview bundled.');
