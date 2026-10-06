"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { track } from "@/lib/measurement/client";
import { oncePerId, services, type Service } from "@/lib/measurement/policy";
import "./measurement.css";
const firstSuccess = oncePerId();
const labels: Record<Service, string> = { "web-design": "A new website", redesign: "A website redesign", seo: "SEO monitoring & optimisation", "website-care": "Hosting & website care", other: "Something else" };
export function ContactForm({ initialService = "other" }: { initialService?: Service }) {
  const [service, setService] = useState<Service>(initialService);
  const [pending, setPending] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const started = useRef(false);
  const quoteStarted = useRef(false);
  const submission = useRef<{ id: string; body: string } | null>(null);
  function start() {
    if (started.current) return;
    started.current = true;
    track("form_start", service);
    if (service !== "other" && !quoteStarted.current) { quoteStarted.current = true; track("quote_request_start", service); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy.current || accepted) return;
    const form = new FormData(event.currentTarget);
    const fields = { name: String(form.get("name") || ""), email: String(form.get("email") || ""), service, message: String(form.get("message") || ""), website: String(form.get("website") || "") };
    const body = JSON.stringify(fields);
    if (!submission.current || submission.current.body !== body) submission.current = { id: crypto.randomUUID(), body };
    const id = submission.current.id;
    busy.current = true; setPending(true); setError("");
    try {
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, idempotencyKey: id }), signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (!response.ok || result.accepted !== true) throw new Error(typeof result.error === "string" ? result.error : "We could not accept your enquiry. Please email us instead.");
      setAccepted(true);
      // Only a durably accepted record can become a lead. A retry is never a second lead.
      if (!result.duplicate && firstSuccess(id)) track("generate_lead", service);
    } catch (failure) { setError(failure instanceof Error && failure.name !== "TimeoutError" ? failure.message : "We could not confirm your enquiry. Please try again, or email us. Retrying the same message will not create a duplicate."); }
    finally { busy.current = false; setPending(false); }
  }
  if (accepted) return <div className="am-form-success" role="status"><p className="section-label">Enquiry received</p><h2>Thank you for getting in touch.</h2><p>Your message has been saved to Anthēon’s private enquiry inbox for review. You can also reach us at <a href="mailto:hello@antheon.co.uk">hello@antheon.co.uk</a>.</p></div>;
  return <form className="am-contact-form" onSubmit={submit} onFocus={start}>
    <div className="am-form-pair"><label>Your name<input name="name" autoComplete="name" required maxLength={120} /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label></div>
    <label>What can we help with?<select name="service" value={service} onChange={event => { const next = event.target.value as Service; setService(next); if (next !== "other" && !quoteStarted.current) { quoteStarted.current = true; track("quote_request_start", next); } }}>{services.map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label>
    <label>A little about your project<textarea name="message" required minLength={15} maxLength={6000} rows={6} placeholder="What are you working on, and what would you like to improve?" /></label>
    <div className="am-honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" autoComplete="off" tabIndex={-1} /></label></div>
    <p className="am-form-note">We use your details to respond to this enquiry. Please avoid sensitive information. <Link href="/privacy">Read our privacy notice</Link>. Optional analytics is a separate choice.</p>
    {error && <p className="am-form-error" role="alert">{error}</p>}
    <div className="am-form-end"><button className="am-submit" type="submit" disabled={pending}>{pending ? "Sending your enquiry…" : "Send enquiry"}<span aria-hidden="true">↗</span></button><a href="mailto:hello@antheon.co.uk">Prefer email? hello@antheon.co.uk</a></div>
  </form>;
}
