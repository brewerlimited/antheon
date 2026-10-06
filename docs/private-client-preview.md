# Private GJL client preview

The GJL prototype is served as a complete independent document at `/client-preview/gjl` on Antheon. This preserves its viewport-based scroll animations, service wheel, photo viewer, and 3D builder. It is intentionally absent from the public portfolio, navigation and sitemap.

## Access

A private link containing a random 256-bit `key` exchanges that key for a signed HttpOnly session cookie valid for seven days. The URL is then cleaned. Anyone given the complete private link can access the preview. Bare URLs, expired/forged cookies and direct asset requests without access return a private-preview screen. No content or assets are publicly cached. Link access does not send an invitation or email.

Vercel production and preview configuration requires two **server-only** environment variables:

- `GJL_PREVIEW_KEY_HASH`: SHA-256 hex digest of the random base64url access key.
- `GJL_PREVIEW_BUNDLE_KEY`: 32 random bytes, hex encoded, used to decrypt the private asset bundle.

Neither value belongs in source control or a `NEXT_PUBLIC_` variable. Rotate the access-key hash and redeploy to revoke prior links and sessions. A removed or missing variable fails closed. Rotating the bundle key also requires repackaging the bundle.

## Public repository, private draft

Only the encrypted parts under `private-previews/gjl-encrypted/` are tracked. The prebuild script verifies and reassembles these into an AES-256-GCM authenticated encrypted bundle at ignored `private-previews/gjl.bundle.enc`. Splitting the ciphertext keeps source uploads small; it does not change encryption. The unencrypted files live in ignored `private-previews/gjl/` when updating locally. They must never be copied into `public/` or committed. Vercel includes the assembled encrypted file in the route's server function and decrypts only after visitor authentication.

To update the draft, put its complete static `dist` contents in ignored `private-previews/gjl/`, then run:

```
node --env-file=.env.local scripts/package-gjl-preview.mjs
node --experimental-strip-types --test tests/private-preview.test.mjs
npm run build -- --webpack
```

The packager adjusts only relative HTML asset references to the protected route. Hash navigation stays in the same document. All other CSS, scripts and images remain intact. The private link is not saved in this repository.

Check the generated route's `.nft.json`: it must include `private-previews/gjl.bundle.enc` and no plaintext files under `private-previews/gjl/`. Verify unauthenticated HTML, scripts and images are denied, valid access redirects to a clean URL, authenticated assets load with correct MIME types, and the service wheel/gallery/3D builder work.

The 3D builder is a concept tool; the existing demo does not submit leads to a CRM.
