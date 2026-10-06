import { analyticsAllowed, consentFrom, consentKey, publicPath, safeContexts, type ConsentChoice, type MeasurementEvent } from "./policy";

type Configuration = { enabled: boolean; measurementId: string; enhancedMeasurementDisabled: boolean };
type Gtag = (...args: unknown[]) => void;
declare global { interface Window { dataLayer?: unknown[]; gtag?: Gtag; } }
let configuration: Configuration = { enabled: false, measurementId: "", enhancedMeasurementDisabled: false };
let ready = false;
let script: HTMLScriptElement | null = null;
let loaded = false;
let lastPath: string | null = null;
let memoryChoice: string | null = null;
export function readConsent() { try { return localStorage.getItem(consentKey) || memoryChoice; } catch { return memoryChoice; } }
export function subscribeConsent(callback: () => void) {
  window.addEventListener("storage", callback); window.addEventListener("antheon-consent", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("antheon-consent", callback); };
}
function permitted() { return typeof window !== "undefined" && analyticsAllowed(configuration, location.hostname, location.pathname, consentFrom(readConsent())); }
function disable() {
  ready = false;
  if (configuration.measurementId) (window as unknown as Record<string, unknown>)[`ga-disable-${configuration.measurementId}`] = true;
  script?.remove(); script = null;
}
function clearAnalyticsCookies() {
  const domains = ["", location.hostname, "." + location.hostname, ".antheon.co.uk"];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.trim().split("=")[0];
    if (!/^_ga(?:_|$)|^_gid$|^_gat/.test(name)) continue;
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ""}`;
  }
}
export function saveConsent(choice: ConsentChoice) {
  const wasLoaded = loaded || script !== null;
  if (choice === "rejected") { disable(); clearAnalyticsCookies(); }
  memoryChoice = JSON.stringify({ version: 1, choice, at: Date.now() });
  try { localStorage.setItem(consentKey, memoryChoice); } catch { /* In-memory choice still applies for this document. */ }
  window.dispatchEvent(new Event("antheon-consent"));
  // A fresh document also removes the provider's timers/listeners after withdrawal.
  if (choice === "rejected" && wasLoaded) location.reload();
}
function pageView() {
  const path = publicPath(location.pathname);
  if (!ready || !permitted() || !path || path === lastPath) return;
  const previous = lastPath;
  lastPath = path;
  window.gtag?.("set", { page_location: `https://www.antheon.co.uk${path}`, page_referrer: previous ? `https://www.antheon.co.uk${previous}` : "", page_title: path === "/" ? "Anthēon" : path.slice(1) });
  window.gtag?.("event", "page_view", { page_location: `https://www.antheon.co.uk${path}`, page_referrer: previous ? `https://www.antheon.co.uk${previous}` : "", page_title: path === "/" ? "Anthēon" : path.slice(1) });
}
export function reconcileMeasurement(config: Configuration) {
  configuration = config;
  if (!permitted()) { disable(); lastPath = null; return; }
  (window as unknown as Record<string, unknown>)[`ga-disable-${config.measurementId}`] = false;
  if (loaded) { ready = true; pageView(); return; }
  if (script) return;
  window.dataLayer = [];
  window.gtag = (...args: unknown[]) => { window.dataLayer?.push(args); };
  window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  window.gtag("js", new Date());
  window.gtag("config", config.measurementId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 15552000, cookie_update: false, page_location: `https://www.antheon.co.uk${publicPath(location.pathname)}`, page_referrer: "", page_title: "Anthēon" });
  script = document.createElement("script"); script.id = "antheon-ga4"; script.async = true;
  script.referrerPolicy = "no-referrer";
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.measurementId)}`;
  script.onload = () => { loaded = true; ready = permitted(); if (!ready) disable(); else pageView(); };
  script.onerror = () => { script?.remove(); script = null; ready = false; };
  document.head.appendChild(script);
}
/** No queue: pre-consent, private-route and not-yet-ready actions are discarded. */
export function track(event: Exclude<MeasurementEvent, "page_view">, context: string) {
  if (!ready || !permitted() || !safeContexts.has(context)) return false;
  const path = publicPath(location.pathname);
  window.gtag?.("event", event, { context, form_id: event.includes("start") || event === "generate_lead" ? "public_enquiry" : undefined, page_location: `https://www.antheon.co.uk${path}`, page_referrer: "", page_title: path === "/" ? "Anthēon" : path?.slice(1) });
  return true;
}
export function stopMeasurement() { disable(); }
