import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Validate these bounded private/demo paths before streaming can commit HTTP 200.
  const path = request.nextUrl.pathname;
  const siteBase = path.startsWith('/seo/demo/admin/site') ? '/seo/demo/admin/site' : path.startsWith('/seo/admin/site') ? '/seo/admin/site' : null;
  if (siteBase && (path === siteBase || path.startsWith(siteBase + '/'))) {
    const parts = path.slice(siteBase.length).split('/').filter(Boolean);
    const tabs = ['overview','content','operations','projects','health','enquiries','changes'];
    const slugs = ['web-design','website-redesign','seo-services','website-care'];
    const special = siteBase === '/seo/admin/site' && ((parts[0] === 'preview' && parts.length === 2 && slugs.includes(parts[1])) || (parts[0] === 'export' && parts.length === 1));
    const normal = parts.length === 0 || (parts.length === 1 && tabs.includes(parts[0])) || (parts.length === 2 && parts[0] === 'content' && slugs.includes(parts[1]));
    if (!normal && !special) return new NextResponse('Page not found', { status: 404, headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  let response = NextResponse.next({ request });
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
  if (url && key && !request.nextUrl.pathname.startsWith("/seo/demo")) {
    const db = createServerClient(url, key, {
      cookieOptions: { path: "/seo", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" },
      cookies: { getAll: () => request.cookies.getAll(), setAll: values => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      } },
    });
    await db.auth.getUser();
  }
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Referrer-Policy", "same-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}
export const config = { matcher: ["/seo/:path*"] };
