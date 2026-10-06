import { z } from "zod";
import { services } from "./policy";
export const maxEnquiryBytes = 16384;
const text = (maximum: number) => z.string().trim().min(1).max(maximum).refine(value => !Array.from(value).some(char => { const code = char.charCodeAt(0); return code < 32 && ![9, 10, 13].includes(code); }));
export const enquirySchema = z.object({
  name: text(120), email: z.email().max(254).transform(value => value.trim().toLowerCase()), service: z.enum(services),
  message: text(6000).refine(value => value.length >= 15), idempotencyKey: z.uuid(), website: z.string().max(200).default(""),
}).strict();
export type Enquiry = z.infer<typeof enquirySchema>;
export function sameOrigin(requestUrl: string, origin: string | null, fetchSite: string | null) {
  if (!origin || (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none")) return false;
  try { return new URL(requestUrl).origin === new URL(origin).origin; } catch { return false; }
}
export async function boundedJson(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("content_type");
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maxEnquiryBytes) throw new Error("too_large");
  const reader = request.body?.getReader(); if (!reader) throw new Error("invalid");
  const parts: Uint8Array[] = []; let total = 0;
  for (;;) { const { value, done } = await reader.read(); if (done) break; total += value.byteLength; if (total > maxEnquiryBytes) { await reader.cancel(); throw new Error("too_large"); } parts.push(value); }
  const all = new Uint8Array(total); let offset = 0; for (const part of parts) { all.set(part, offset); offset += part.length; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(all));
}
