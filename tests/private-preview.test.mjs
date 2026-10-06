import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { createSession, validAccessKey, validAssetPath, validSession, SESSION_SECONDS } from '../lib/private-preview/access.ts';

const key = randomBytes(32).toString('base64url');
const hash = createHash('sha256').update(key).digest('hex');
const now = 1791280000000;

test('only the complete random access key unlocks the preview', () => {
  assert.ok(validAccessKey(key, hash));
  for (const value of ['', key.slice(1), `${key}x`, hash, '<script>', randomBytes(32).toString('base64url')]) assert.equal(validAccessKey(value, hash), false);
  assert.equal(validAccessKey(key, ''), false);
});
test('signed sessions expire and cannot be forged or used after key rotation', () => {
  const cookie = createSession(hash, now);
  assert.ok(validSession(cookie, hash, now));
  assert.ok(validSession(cookie, hash, now + (SESSION_SECONDS - 1) * 1000));
  assert.equal(validSession(cookie, hash, now + SESSION_SECONDS * 1000), false);
  assert.equal(validSession(cookie, '0'.repeat(64), now), false);
  assert.equal(validSession(cookie.replace(/^\d+/, '1999999999'), hash, now), false);
  assert.equal(validSession(cookie + 'x', hash, now), false);
  assert.equal(validSession(undefined, hash, now), false);
  assert.equal(validSession(cookie, '', now), false);
});
test('asset segments reject traversal, separators and dot files', () => {
  assert.ok(validAssetPath([]));
  assert.ok(validAssetPath(['quote', 'vendor', 'three.module.js']));
  assert.ok(validAssetPath(['assets', 'white-gate-entrance.webp']));
  for (const value of ['..', '.', '.env', '/etc/passwd', '..\\secret', '%2e%2e', 'index.html\u0000', 'a/b', '']) assert.equal(validAssetPath([value]), false);
});
