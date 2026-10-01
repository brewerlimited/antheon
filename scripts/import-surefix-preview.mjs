import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceArgument = process.argv[2];
if (!sourceArgument) throw new Error('Usage: node scripts/import-surefix-preview.mjs /path/to/built/surefix-interiors');
const source = path.resolve(sourceArgument);
const dist = path.join(source, 'dist');
const prefix = '/previews/surefix-interiors/';
const target = path.join(root, 'public', prefix);
const read = file => fs.readFile(path.join(dist, file), 'utf8');
let html = await read('index.html');
const scriptSource = html.match(/<script\b[^>]*src="\/([^"]+)"[^>]*><\/script>/)?.[1];
const stylesheetSource = html.match(/<link\b[^>]*rel="stylesheet"[^>]*href="\/([^"]+)"[^>]*>/)?.[1];
if (!scriptSource || !stylesheetSource) throw new Error('Expected one compiled JavaScript and stylesheet in the source homepage.');
let app = await read(scriptSource);
const styles = await read(stylesheetSource);
const route = 'window.location.pathname.replace(/\\/index\\.html$/,`/`).replace(/\\.html$/,``).replace(/\\/$/,``)||`/`';
if (app.split(route).length !== 2) throw new Error('Homepage route adapter no longer matches. Check the source entry before importing.');
app = app.replace(route, '`/`');
if (/\bimport\s*(?:\(|\.|["'])|\bexport\s*[{*]/.test(app)) throw new Error('The bundle now contains module dependencies; update the standalone adapter.');

// Keep the prerendered homepage plus every image that any service tab can reveal.
const sourcePage = await fs.readFile(path.join(source, 'app/site.tsx'), 'utf8');
const groups = sourcePage.match(/const serviceGroups = \[([\s\S]*?)\];/)?.[1];
if (!groups) throw new Error('Could not locate the service groups needed for tab imagery.');
const assets = new Set([...html.matchAll(/(?:src|href)="\/(images\/[^"]+|fonts\/[^"]+|favicon\.svg)"/g)].map(match => match[1]));
for (const match of groups.matchAll(/image:\s*(\d+)|thumbs:\s*\[([^\]]+)\]/g)) {
  const ids = match[1] ? [match[1]] : match[2].match(/\d+/g);
  for (const id of ids) assets.add(`images/project-${id.padStart(2, '0')}.webp`);
}
assets.add('fonts/dmsans-LICENSE.txt');
const rebase = text => text.replaceAll('/images/', `${prefix}images/`).replaceAll('/fonts/', `${prefix}fonts/`);
html = html.replace(/<script\b[^>]*src="\/[^"]+"[^>]*><\/script>/,
  `<script src="/previews/preview-guard.js"></script>\n    <script defer src="${prefix}app.js"></script>`);
html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="\/[^"]+"[^>]*>/,
  `<link rel="stylesheet" crossorigin="anonymous" href="${prefix}styles.css">`);
html = rebase(html).replace('href="/favicon.svg"', `href="${prefix}favicon.svg"`)
  .replace('<title>Surefix Interiors | Expertise. Built in.</title>', '<title>Surefix Interiors — interactive design preview</title>\n    <meta name="robots" content="noindex,nofollow">');
await fs.mkdir(target, { recursive: true });
for (const asset of assets) {
  await fs.mkdir(path.dirname(path.join(target, asset)), { recursive: true });
  await fs.copyFile(path.join(dist, asset), path.join(target, asset));
}
await fs.writeFile(path.join(target, 'index.html'), html);
await fs.writeFile(path.join(target, 'app.js'), `(function(){\n${rebase(app)}\n})();\n`);
await fs.writeFile(path.join(target, 'styles.css'), rebase(styles));
console.log(`Imported Surefix homepage and ${assets.size} local assets.`);
