/** Only known public, non-sensitive routes may enter analytics. Never send arbitrary paths. */
export const publicPaths = ["/", "/web-design", "/website-redesign", "/seo-services", "/website-care", "/contact", "/privacy"] as const;
export const services = ["web-design", "redesign", "seo", "website-care", "other"] as const;
export type Service = typeof services[number];
export type MeasurementEvent = "page_view" | "contact_click" | "service_cta" | "form_start" | "quote_request_start" | "generate_lead";
export type ConsentChoice = "accepted" | "rejected";
export const consentKey = "antheon:analytics-consent:v1";
export const consentDays = 180;
export function publicPath(path: string): string | null {
  const clean = path.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  return (publicPaths as readonly string[]).includes(clean) ? clean : null;
}
export function consentFrom(raw: string | null, now = Date.now()): ConsentChoice | null {
  try {
    const record = JSON.parse(raw || "null");
    if (!record || record.version !== 1 || !["accepted", "rejected"].includes(record.choice) || !Number.isFinite(record.at) || record.at > now || now - record.at > consentDays * 86400000) return null;
    return record.choice;
  } catch { return null; }
}
export function analyticsAllowed(configuration: { enabled: boolean; measurementId: string; enhancedMeasurementDisabled: boolean }, hostname: string, path: string, consent: ConsentChoice | null) {
  return configuration.enabled && configuration.enhancedMeasurementDisabled && /^G-[A-Z0-9]{5,20}$/.test(configuration.measurementId) && hostname === "www.antheon.co.uk" && publicPath(path) !== null && consent === "accepted";
}
export function linkEvent(href: string, origin: string): { event: MeasurementEvent; context: string } | null {
  try {
    const url = new URL(href, origin);
    if (url.protocol === "tel:") return { event: "contact_click", context: "phone" };
    if (url.protocol === "mailto:") return { event: "contact_click", context: "email" };
    if (["wa.me", "api.whatsapp.com"].includes(url.hostname)) return { event: "contact_click", context: "whatsapp" };
    if (url.origin !== origin) return null;
    if (url.pathname === "/contact" || (url.pathname === "/" && url.hash === "#contact")) return { event: "service_cta", context: "contact" };
    const service = publicPath(url.pathname);
    if (service && ["/web-design", "/website-redesign", "/seo-services", "/website-care"].includes(service)) return { event: "service_cta", context: service.slice(1) };
    return null;
  } catch { return null; }
}
export const safeContexts = new Set(["phone", "email", "whatsapp", "contact", "web-design", "website-redesign", "redesign", "seo-services", "seo", "website-care", "other"]);
/** Local only; IDs are never sent to an analytics provider. */
export function oncePerId() { const sent = new Set<string>(); return (id: string) => { if (sent.has(id)) return false; sent.add(id); return true; }; }
