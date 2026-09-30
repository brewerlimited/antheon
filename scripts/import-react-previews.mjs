import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : ['intimate-detail', 'eventco'];
for (const slug of slugs) {
  if (!['intimate-detail', 'eventco'].includes(slug)) throw new Error(`Unknown React preview: ${slug}`);
  const source = path.join(root, 'preview-src', slug);
  const target = path.join(root, 'public', 'previews', slug);
  const require = createRequire(path.join(source, 'package.json'));
  const dependencyPaths = process.env.PREVIEW_NODE_MODULES ? [process.env.PREVIEW_NODE_MODULES] : [];
  let esbuild;
  try { esbuild = require('esbuild'); }
  catch { esbuild = require(require.resolve('esbuild', { paths: dependencyPaths.map(p => path.dirname(p)) })); }
  const meta = JSON.parse(await fs.readFile(path.join(source, 'preview.json'), 'utf8'));
  await fs.mkdir(target, { recursive: true });
  await fs.cp(path.join(source, 'assets'), target, { recursive: true });
  await fs.copyFile(path.join(source, 'styles.css'), path.join(target, 'styles.css'));
  await esbuild.build({
    absWorkingDir: source,
    entryPoints: [path.join(source, 'entry.tsx')],
    outfile: path.join(target, 'app.js'),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    jsx: 'automatic',
    minify: true,
    legalComments: 'eof',
    nodePaths: dependencyPaths,
    alias: {
      '@': source,
      'react': path.dirname(require.resolve('react/package.json')),
      'react-dom': path.dirname(require.resolve('react-dom/package.json')),
      'next/image': path.join(source, 'next-image.tsx'),
      'next/navigation': path.join(source, 'next-navigation.ts'),
    },
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  const html = `<!doctype html>\n<html lang="en-GB"${meta.dark ? ' class="dark"' : ''}>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="robots" content="noindex,nofollow">\n<title>${meta.title} — interactive design preview</title>\n<link rel="stylesheet" href="/previews/${slug}/styles.css" crossorigin="anonymous">\n<script src="/previews/preview-guard.js"></script>\n</head>\n<body><div id="root"></div><script src="/previews/${slug}/app.js"></script></body>\n</html>\n`;
  await fs.writeFile(path.join(target, 'index.html'), html);
  console.log(`Built ${slug}`);
}
