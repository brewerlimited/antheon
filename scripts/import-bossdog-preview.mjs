// Import the animated Boss Dog homepage into the existing guarded portfolio iframe.
import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
const source = path.resolve(process.argv[2] || '../bossdog-hero/dist');
const prefix = '/previews/boss-dog/';
const target = path.resolve('public/previews/boss-dog');
const html = await fs.readFile(path.join(source, 'index.html'), 'utf8');
const css = await fs.readFile(path.join(source, 'site.css'), 'utf8');
const config = await fs.readFile(path.join(source, 'hero-config.js'), 'utf8');
const rebase = text => text.replaceAll('/assets/', `${prefix}assets/`);
const assets = new Set([...(`${html}\n${css}\n${config}`).matchAll(/\/assets\/([A-Za-z0-9_./-]+)/g)].map(m => m[1]));
await fs.mkdir(target, { recursive: true });
for (const asset of assets) {
  await fs.mkdir(path.dirname(path.join(target, 'assets', asset)), { recursive: true });
  await fs.copyFile(path.join(source, 'assets', asset), path.join(target, 'assets', asset));
}
const output = await build({
  entryPoints: [path.join(source, 'site.js')], bundle: true, write: false,
  format: 'iife', target: 'es2020', minify: true,
});
await fs.writeFile(path.join(target, 'app.js'), rebase(output.outputFiles[0].text));
await fs.writeFile(path.join(target, 'site.css'), rebase(css));
const page = rebase(html)
 .replace(/<script\b[^>]*src="\/site\.js[^\"]*"[^>]*><\/script>/, `<script src="/previews/preview-guard.js"></script><script defer src="${prefix}app.js"></script>`)
 .replace('href="/site.css"', `href="${prefix}site.css"`)
 .replace('PRIVATE DESIGN PREVIEW', 'INDEPENDENT DESIGN CONCEPT');
await fs.writeFile(path.join(target, 'index.html'), page);
console.log(`Imported Boss Dog homepage and ${assets.size} local assets.`);
