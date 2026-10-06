import { createDecipheriv } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { validAssetPath } from './access';

const BUNDLE_HEADER = Buffer.from('GJLPV1');
let assetsPromise: Promise<Map<string, Buffer>> | undefined;

// Only the encrypted bundle is committed. Its key exists in server configuration.
export function loadPreviewAssets(): Promise<Map<string, Buffer>> {
  if (assetsPromise) return assetsPromise;
  assetsPromise = (async () => {
    const key = process.env.GJL_PREVIEW_BUNDLE_KEY || '';
    if (!/^[a-f0-9]{64}$/.test(key)) throw new Error('Preview bundle key unavailable');
    const bundle = await readFile(path.join(process.cwd(), 'private-previews/gjl.bundle.enc'));
    if (bundle.length < 35 || !bundle.subarray(0, 6).equals(BUNDLE_HEADER)) throw new Error('Invalid preview bundle');
    const decipher = createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), bundle.subarray(6, 18));
    decipher.setAAD(BUNDLE_HEADER);
    decipher.setAuthTag(bundle.subarray(18, 34));
    const compressed = Buffer.concat([decipher.update(bundle.subarray(34)), decipher.final()]);
    const packed = JSON.parse(gunzipSync(compressed, { maxOutputLength: 48 * 1024 * 1024 }).toString('utf8')) as Record<string, string>;
    const assets = new Map<string, Buffer>();
    for (const [name, value] of Object.entries(packed)) {
      if (!validAssetPath(name.split('/')) || typeof value !== 'string') throw new Error('Invalid preview entry');
      assets.set(name, Buffer.from(value, 'base64'));
    }
    return assets;
  })().catch(error => { assetsPromise = undefined; throw error; });
  return assetsPromise;
}
