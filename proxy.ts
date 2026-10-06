import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
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
