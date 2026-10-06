import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

// Only encrypted bytes are reassembled; decryption happens in the authenticated route.
const root = new URL('../private-previews/gjl-encrypted/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
if (manifest.version !== 1 || !Number.isInteger(manifest.parts) || manifest.parts < 1 || manifest.parts > 128 || !/^[a-f0-9]{64}$/.test(manifest.sha256)) {
  throw new Error('Invalid encrypted preview manifest');
}
const chunks = await Promise.all(Array.from({ length: manifest.parts }, (_, i) => readFile(new URL(`${String(i).padStart(3, '0')}.part`, root))));
const bundle = Buffer.concat(chunks);
if (bundle.length !== manifest.bytes || createHash('sha256').update(bundle).digest('hex') !== manifest.sha256) throw new Error('Encrypted preview bundle is incomplete');
await writeFile(new URL('../private-previews/gjl.bundle.enc', import.meta.url), bundle);
console.log(`Assembled encrypted GJL preview from ${manifest.parts} parts.`);
