import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";
import { redirect, notFound } from "next/navigation";
import type { Role } from "./types";

export const requestTime = cache(() => Date.now());
export const databaseReady = () => !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
export const demoEnabled = () => process.env.SEO_DEMO_MODE === "true";
export function appOrigin() {
  const url = new URL(process.env.SEO_APP_URL || "http://localhost:3095");
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") throw new Error("SEO_APP_URL must use HTTPS in production");
  return url.origin;
}
export async function sessionDb() {
  if (!databaseReady()) throw new Error("SEO database has not been configured");
  const jar = await cookies();
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookieOptions: { path: "/seo", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" },
    cookies: { getAll: () => jar.getAll(), setAll: values => { try { for (const { name, value, options } of values) jar.set(name, value, options); } catch { /* Server Components refresh through the SEO-only proxy. */ } } },
  });
}
// Service credentials are only used for OAuth secret storage, rate limits, jobs and invitations.
// Tenant page reads and ordinary writes ALWAYS use the signed-in user's RLS client.
export function serviceDb() {
  if (!databaseReady()) throw new Error("SEO database has not been configured");
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
}
export const identity = cache(async () => {
  if (!databaseReady()) return null;
  const db = await sessionDb(); const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await db.from("seo_users").select("id,full_name,role").eq("id", user.id).single();
  if (!profile || !["super_admin", "admin", "client"].includes(profile.role)) return null;
  return { id: user.id, name: profile.full_name || user.email || "Your account", role: profile.role as Role, db };
});
export async function requireIdentity(admin = false) {
  const user = await identity();
  if (!user) redirect("/seo/login");
  if (admin && user.role === "client") notFound();
  return user;
}
export async function requireProject(id: string, admin = false) {
  const user = await requireIdentity(admin);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data, error } = await user.db.from("seo_projects").select("*").eq("id", id).single();
  if (error || !data) notFound(); // Identical response for nonexistent and inaccessible IDs.
  return { user, project: data };
}
export async function rateLimit(key: string, maximum = 10, seconds = 60) {
  const { data, error } = await serviceDb().rpc("seo_take_rate_limit", { bucket: key, maximum, seconds });
  if (error || data !== true) throw new Error("rate_limited");
}
