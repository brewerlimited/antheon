import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

// Run with esbuild available locally, or pass ESBUILD_MODULE to its main.js file.
// All preview source and imagery live in this repository; the original site is not required.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(resolve(root, 'preview-src/hamilton-flooring/package.json'));
const { build } = require(process.env.ESBUILD_MODULE || 'esbuild');
const destination = resolve(root, 'public/previews/hamilton-flooring');
await mkdir(destination, { recursive: true });
await build({
  entryPoints: [resolve(root, 'preview-src/hamilton-flooring/main.tsx')],
  bundle: true,
  format: 'iife',
  jsx: 'automatic',
  minify: true,
  target: ['es2020'],
  define: { 'process.env.NODE_ENV': '"production"' },
  outfile: resolve(destination, 'app.js'),
  legalComments: 'eof',
});
await writeFile(resolve(destination, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#eeeae3"><title>Hamilton Commercial Flooring — interactive concept</title><link rel="icon" href="data:,"><link rel="preload" as="image" href="/previews/hamilton-flooring/images/hero.jpg"><link rel="stylesheet" href="/previews/hamilton-flooring/app.css"><script src="/previews/preview-guard.js"></script><script defer src="/previews/hamilton-flooring/app.js"></script></head><body><div id="root"></div></body></html>\n`);
console.log('Built Hamilton homepage preview.');
