"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { consentFrom, linkEvent, publicPath } from "@/lib/measurement/policy";
import { readConsent, reconcileMeasurement, saveConsent, stopMeasurement, subscribeConsent, track } from "@/lib/measurement/client";
import "./measurement.css";

export function PublicMeasurement({ enabled, measurementId, enhancedMeasurementDisabled }: { enabled: boolean; measurementId: string; enhancedMeasurementDisabled: boolean }) {
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null);
  const [preferences, setPreferences] = useState(false);
  const choice = consentFrom(consent);
  const visible = publicPath(pathname || "") !== null;
  const configured = enabled && enhancedMeasurementDisabled && /^G-[A-Z0-9]{5,20}$/.test(measurementId);
  useEffect(() => {
    reconcileMeasurement({ enabled, measurementId, enhancedMeasurementDisabled });
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link) return;
      const url = new URL(link.href, location.origin);
      // Disable before Next handles a move into a private area.
      if (url.origin === location.origin && !publicPath(url.pathname)) stopMeasurement();
      const definition = linkEvent(link.href, location.origin);
      if (definition) track(definition.event as "contact_click" | "service_cta", definition.context);
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, [pathname, consent, enabled, measurementId, enhancedMeasurementDisabled]);
  useEffect(() => { const open = () => setPreferences(true); window.addEventListener("antheon-open-consent", open); return () => window.removeEventListener("antheon-open-consent", open); }, []);
  if (!visible) return null;
  const show = preferences || (configured && choice === null);
  return <div className="antheon-measurement">
    {show ? <section className="am-consent" aria-labelledby="am-consent-title" aria-describedby="am-consent-copy">
      <div><h2 id="am-consent-title">A little insight. Your choice.</h2><p id="am-consent-copy">{configured ? "With your permission, Google Analytics helps us understand which pages and services are useful. Optional analytics stays off until you accept. The site and enquiry form work either way. Revisit this choice at any time using Cookie choices." : "Optional analytics is not active in this version of the site. Your preference can still be saved."} <a href="/privacy">Privacy details</a>.</p></div>
      <div className="am-consent-actions"><button type="button" onClick={() => { saveConsent("rejected"); setPreferences(false); }}>Reject analytics</button><button type="button" onClick={() => { saveConsent("accepted"); setPreferences(false); }}>Accept analytics</button>{preferences && <button type="button" onClick={() => setPreferences(false)}>Close</button>}</div>
    </section> : <button type="button" className="am-preferences" onClick={() => setPreferences(true)}>Cookie choices</button>}
  </div>;
}
export function CookieChoicesButton() { return <button type="button" className="am-inline-choice" onClick={() => window.dispatchEvent(new Event("antheon-open-consent"))}>Review cookie choices</button>; }
