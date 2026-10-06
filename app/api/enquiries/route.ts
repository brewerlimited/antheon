import { createHmac, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { boundedJson, enquirySchema, sameOrigin } from "@/lib/measurement/enquiries";
import { databaseReady, serviceDb } from "@/lib/seo/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
function response(status: number, body: Record<string, unknown>) { return Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex", "X-Content-Type-Options": "nosniff" } }); }
export async function POST(request: Request) {
  if (!sameOrigin(request.url, request.headers.get("origin"), request.headers.get("sec-fetch-site"))) return response(403, { error: "Please send the form from this website." });
  let input;
  try { input = enquirySchema.safeParse(await boundedJson(request)); } catch { return response(400, { error: "Please check the form and try again. Keep your message under 6,000 characters." }); }
  if (!input.success || input.data.website) return response(400, { error: "Please check the form and try again." });
  const salt = process.env.SITE_ENQUIRY_HASH_KEY || "";
  if (!databaseReady() || !/^[a-f0-9]{64}$/i.test(salt)) return response(503, { error: "The enquiry form is temporarily unavailable. Please email hello@antheon.co.uk instead." });
  const digest = (value: string) => createHmac("sha256", Buffer.from(salt, "hex")).update(value).digest("hex");
  const { name, email, service, message, idempotencyKey } = input.data;
  const fingerprint = digest(JSON.stringify([name, email, service, message]));
  // Trust only the platform-owned IP header on Vercel; no user-supplied X-Forwarded-For.
  const candidate = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : "";
  const ip = candidate && isIP(candidate) ? candidate : "local-or-unknown";
  try {
    const db = serviceDb();
    for (const [bucket, maximum, seconds] of [[`enquiry:ip:${digest(ip)}`, ip === "local-or-unknown" ? 30 : 5, 900], [`enquiry:email:${digest(email)}`, 3, 3600]] as const) {
      const { data, error } = await db.rpc("seo_take_rate_limit", { bucket, maximum, seconds });
      if (error) return response(503, { error: "We could not accept your enquiry. Please email hello@antheon.co.uk instead." });
      if (data !== true) return response(429, { error: "Please wait before trying again, or email hello@antheon.co.uk." });
    }
    const { data, error } = await db.from("site_enquiries").insert({ name, email, service, message, request_hash: fingerprint, idempotency_key: idempotencyKey }).select("id").single();
    if (!error && data) return response(201, { accepted: true, duplicate: false });
    if (error?.code === "23505") {
      const existing = await db.from("site_enquiries").select("request_hash").eq("idempotency_key", idempotencyKey).maybeSingle();
      if (existing.data && existing.data.request_hash.length === fingerprint.length && timingSafeEqual(Buffer.from(existing.data.request_hash), Buffer.from(fingerprint))) return response(200, { accepted: true, duplicate: true });
      return response(409, { error: "This submission has changed. Refresh the page before sending a new enquiry." });
    }
    return response(503, { error: "We could not save your enquiry. Please email hello@antheon.co.uk instead." });
  } catch { return response(503, { error: "We could not accept your enquiry. Please email hello@antheon.co.uk instead." }); }
}
