import path from 'node:path';
import { loadPreviewAssets } from '@/lib/private-preview/assets';
import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, PREVIEW_PATH, SESSION_SECONDS, createSession, validAccessKey, validAssetPath, validSession } from '@/lib/private-preview/access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
};
const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; media-src 'self' blob:; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri 'self'; frame-ancestors 'self'",
};

function locked(status = 401) {
  return new NextResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Private preview | Anthēon</title><style>html{color-scheme:dark}body{margin:0;min-height:100svh;display:grid;place-items:center;background:#080d18;color:#edf2ff;font-family:Arial,sans-serif}main{max-width:420px;padding:40px}small{letter-spacing:.18em;color:#aab9d1}h1{font-size:clamp(38px,7vw,56px);font-weight:500;letter-spacing:-.05em;margin:28px 0 20px}p{font-size:16px;line-height:1.8;color:#aab9d1}a{display:inline-block;color:#edf2ff;margin-top:22px;text-underline-offset:7px}</style></head><body><main><small>ANTHĒON / CLIENT PREVIEW</small><h1>A first look.<br>Just for you.</h1><p>This preview is private. Please open the complete access link supplied by Anthēon.</p><a href="/">Back to Anthēon</a></main></body></html>`, { status, headers: { ...privateHeaders, 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const keyHash = process.env.GJL_PREVIEW_KEY_HASH || '';
  const key = request.nextUrl.searchParams.get('key');
  const { path: segments = [] } = await context.params;

  // Exchange the private link for a signed, path-scoped session, then remove its key.
  if (key !== null) {
    if (segments.length !== 0 || !validAccessKey(key, keyHash)) return locked();
    const response = new NextResponse(null, {
      status: 303,
      headers: { ...privateHeaders, Location: PREVIEW_PATH },
    });
    response.cookies.set(COOKIE_NAME, createSession(keyHash), {
      httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax',
      path: PREVIEW_PATH, maxAge: SESSION_SECONDS,
    });
    return response;
  }
  if (!validSession(request.cookies.get(COOKIE_NAME)?.value, keyHash)) return locked();
  if (!validAssetPath(segments)) return locked(404);

  const relative = segments.length ? segments.join('/') : 'index.html';
  const mime = contentTypes[path.extname(relative).toLowerCase()];
  if (!mime) return locked(404);
  try {
    const data = (await loadPreviewAssets()).get(relative);
    if (!data) return locked(404);
    return new NextResponse(new Uint8Array(data), { headers: { ...privateHeaders, 'Content-Type': mime } });
  } catch {
    // Do not log request URLs or environment values.
    console.error('Private preview bundle unavailable');
    return locked(503);
  }
}
