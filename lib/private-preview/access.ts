import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const PREVIEW_PATH = '/client-preview/gjl';
export const COOKIE_NAME = 'antheon_gjl_preview';
export const SESSION_SECONDS = 7 * 24 * 60 * 60;

function equal(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function validAccessKey(key: string, keyHash: string): boolean {
  if (!/^[A-Za-z0-9_-]{43}$/.test(key) || !/^[a-f0-9]{64}$/.test(keyHash)) return false;
  return equal(createHash('sha256').update(key).digest('hex'), keyHash);
}

function signature(expires: string, keyHash: string): string {
  return createHmac('sha256', keyHash).update(`gjl-preview:v1:${expires}`).digest('base64url');
}

export function createSession(keyHash: string, now = Date.now()): string {
  const expires = String(Math.floor(now / 1000) + SESSION_SECONDS);
  return `${expires}.${signature(expires, keyHash)}`;
}

export function validSession(cookie: string | undefined, keyHash: string, now = Date.now()): boolean {
  if (!cookie || !/^[a-f0-9]{64}$/.test(keyHash)) return false;
  const parts = cookie.split('.');
  if (parts.length !== 2 || !/^\d{10}$/.test(parts[0]) || !/^[A-Za-z0-9_-]{43}$/.test(parts[1])) return false;
  const expires = Number(parts[0]);
  const current = Math.floor(now / 1000);
  if (expires <= current || expires > current + SESSION_SECONDS) return false;
  return equal(parts[1], signature(parts[0], keyHash));
}

export function validAssetPath(parts: string[]): boolean {
  return parts.every(part => /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(part) && part !== '.' && part !== '..');
}
