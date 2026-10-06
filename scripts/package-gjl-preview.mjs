import { createCipheriv, createHash, randomBytes } from 'node:crypto';
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { gzipSync } from 'node:zlib';

const key = process.env.GJL_PREVIEW_BUNDLE_KEY || '';
if (!/^[a-f0-9]{64}$/.test(key)) throw Error('Set the server-only GJL_PREVIEW_BUNDLE_KEY before packaging.');
const root = resolve(process.argv[2] || 'private-previews/gjl');
const files = {};
async function walk(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isSymbolicLink()) throw Error('Symlinks are not accepted in a preview bundle.');
    if (entry.isDirectory()) await walk(join(directory, entry.name), `${name}/`);
    else if (entry.isFile()) {
      let buffer = await readFile(join(directory, entry.name));
      if (name === 'index.html') {
        // Keep hash navigation in this document; only asset URLs need a base path.
        const html = buffer.toString('utf8').replace('<head>', '<head><meta name="robots" content="noindex,nofollow,noarchive">')
          .replace(/(src|href|data-image)="(?![a-z]+:|\/\/|\/|#)([^"]+)"/gi, '$1="/client-preview/gjl/$2"');
        buffer = Buffer.from(html);
      }
      files[name] = buffer.toString('base64');
    }
  }
}
await walk(root);
const header = Buffer.from('GJLPV1');
const iv = randomBytes(12);
const cipher = createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
cipher.setAAD(header);
const ciphertext = Buffer.concat([cipher.update(gzipSync(JSON.stringify(files))), cipher.final()]);
const bundle = Buffer.concat([header, iv, cipher.getAuthTag(), ciphertext]);
await writeFile('private-previews/gjl.bundle.enc', bundle);
const chunkRoot = 'private-previews/gjl-encrypted';
await mkdir(chunkRoot, { recursive: true });
const chunkSize = 524286;
const parts = Math.ceil(bundle.length / chunkSize);
for (let i = 0; i < parts; i++) await writeFile(join(chunkRoot, `${String(i).padStart(3, '0')}.part`), bundle.subarray(i * chunkSize, (i + 1) * chunkSize));
for (const name of await readdir(chunkRoot)) if (/^\d{3}\.part$/.test(name) && Number(name.slice(0, 3)) >= parts) await unlink(join(chunkRoot, name));
await writeFile(join(chunkRoot, 'manifest.json'), JSON.stringify({ version: 1, parts, bytes: bundle.length, sha256: createHash('sha256').update(bundle).digest('hex') }, null, 2) + '\n');
console.log(`Encrypted ${Object.keys(files).length} preview assets. No plaintext was copied into public/.`);
