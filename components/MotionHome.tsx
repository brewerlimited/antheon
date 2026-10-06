"use client";

import { VectorIcon } from "@/components/VectorIcon";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { concepts } from "@/data/concepts";
import { siteLinks } from "@/data/site";
import { VentureGallery } from "./VentureGallery";
import { CityHero } from "./city/CityHero";
import "./motion-home.css";

const services = [
  { number: "01", title: ["Digital.", "Made distinct."], tag: "WEB DESIGN & DEVELOPMENT", description: "Considered websites that bring your business to life. Built around your brand, your customers and where you want to go next.", items: ["Website design & development", "Brand-led digital experiences", "Responsive from the first pixel"], image: "/images/concepts/pride-flooring-hero.webp", name: "Pride Flooring — design exploration", href: "/web-design", link: "Explore web design" },
  { number: "02", title: ["Ideas.", "Made useful."], tag: "PRODUCT & TECHNOLOGY", description: "From a problem worth solving to a product people want to use. We connect commercial thinking with thoughtful design and technology.", items: ["Digital product development", "Business software & platforms", "Strategy through to execution"], image: "/images/concepts/surefix-interiors-hero.webp", name: "Surefix Interiors — design exploration", href: "#ventures", link: "Meet our ventures" },
  { number: "03", title: ["Ambition.", "Made real."], tag: "VENTURES & COLLABORATION", description: "We develop our own businesses and work with selected companies where our experience can make a meaningful difference.", items: ["Venture & brand development", "Commercial positioning", "Long-term digital partnerships"], image: "/images/concepts/anchor-flooring-hero.webp", name: "Anchor Flooring — design exploration", href: "#contact", link: "Start a conversation" },
];

export function MotionHome() {
  const root = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [activeService, setActiveService] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sectionName, setSectionName] = useState("01 — INTRO");

  useEffect(() => {
    const page = root.current;
    if (!page) return;
    const enhancement = requestAnimationFrame(() => setEnhanced(true));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 800px)");
    const intro = page.querySelector<HTMLElement>(".motion-intro")!;
    const progressBar = page.querySelector<HTMLElement>(".motion-progress")!;
    const nativeScroll = CSS.supports("animation-timeline", "scroll(root block)")
      && CSS.supports("animation-range", "0px 1px")
      && !(process.env.NODE_ENV === "development" && new URLSearchParams(location.search).get("scroll-engine") === "fallback");
    const lastStyles = new WeakMap<HTMLElement, Map<string, string>>();
    const setStyle = (element: HTMLElement, property: string, value: string) => {
      let values = lastStyles.get(element);
      if (!values) { values = new Map(); lastStyles.set(element, values); }
      if (values.get(property) === value) return;
      values.set(property, value);
      element.style.setProperty(property, value);
    };
    const setMotion = (element: HTMLElement, property: string, value: number) => setStyle(element, property, value.toFixed(4));
    let lastService = -1;
    let serviceIndex = 0;
    let needsMeasure = true;
    let disposed = false;
    const service = page.querySelector<HTMLElement>(".motion-services")!;
    const track = page.querySelector<HTMLElement>(".service-track")!;
    const words = Array.from(page.querySelectorAll<HTMLElement>(".intro-word"));
    const cards = Array.from(page.querySelectorAll<HTMLElement>(".motion-work-card"));
    let frame = 0;
    let dimensions = { introTop: 0, introHeight: 0, servicesTop: 0, serviceHeight: 0, viewport: 0, trackWidth: 1, scrollRange: 1, cardTops: [] as number[] };
    const clamp = (n: number) => Math.max(0, Math.min(1, n));
    const measure = () => {
      const stack = page.querySelector<HTMLElement>(".motion-work-stack")!;
      const gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
      let naturalTop = stack.getBoundingClientRect().top + window.scrollY;
      const cardTops = cards.map(card => {
        const top = naturalTop;
        naturalTop += card.offsetHeight + gap;
        return top;
      });
      dimensions = { introTop: intro.offsetTop, introHeight: intro.offsetHeight, servicesTop: service.offsetTop, serviceHeight: service.offsetHeight, viewport: window.innerHeight, trackWidth: track.clientWidth, scrollRange: Math.max(1, document.documentElement.scrollHeight - window.innerHeight), cardTops };
      serviceIndex = Math.round(track.scrollLeft / Math.max(1, dimensions.trackWidth));
    };
    const update = () => {
      frame = 0;
      if (disposed) return;
      const y = window.scrollY;
      if (needsMeasure) { needsMeasure = false; measure(); }
      const d = dimensions;
      const introProgress = clamp((y - d.introTop + d.viewport * .66) / (d.introHeight * .8));
      words.forEach((word, index) => setMotion(word, "opacity", reduced.matches ? 1 : .18 + .82 * clamp(introProgress * (words.length + 4) - index)));
      const serviceProgress = clamp((y - d.servicesTop) / Math.max(1, d.serviceHeight - d.viewport));
      const index = mobile.matches || reduced.matches ? serviceIndex : Math.round(serviceProgress * 2);
      if (index !== lastService) { lastService = index; setActiveService(index); }
      if (!mobile.matches && !reduced.matches) setMotion(service, "--service-progress", serviceProgress);
      if (!nativeScroll || reduced.matches) setStyle(progressBar, "transform", `scaleX(${(y / d.scrollRange).toFixed(5)})`);
      cards.forEach((card, i) => {
        const p = reduced.matches || mobile.matches ? 0 : clamp((y - d.cardTops[i] + 110) / (d.viewport * .9));
        setMotion(card, "--card-progress", p);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = () => { if (!disposed) { needsMeasure = true; schedule(); } };
    const pageSize = new ResizeObserver(resize);
    pageSize.observe(page);
    const onTrackScroll = () => {
      serviceIndex = Math.round(track.scrollLeft / Math.max(1, dimensions.trackWidth));
      schedule();
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } });
    }, { threshold: .12 });
    page.querySelectorAll(".motion-reveal").forEach(el => observer.observe(el));
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setSectionName((entry.target as HTMLElement).dataset.chapter || "01 — INTRO"); });
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });
    page.querySelectorAll("[data-chapter]").forEach(el => sectionObserver.observe(el));
    if (nativeScroll) page.dataset.nativeScroll = "true";
    update();
    document.fonts.ready.then(resize);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    track.addEventListener("scroll", onTrackScroll, { passive: true });
    reduced.addEventListener("change", resize);
    mobile.addEventListener("change", resize);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame); cancelAnimationFrame(enhancement); observer.disconnect(); sectionObserver.disconnect(); pageSize.disconnect();
      delete page.dataset.nativeScroll;
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", resize);
      track.removeEventListener("scroll", onTrackScroll); reduced.removeEventListener("change", resize); mobile.removeEventListener("change", resize);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);

  function closeMenu() { menuRef.current?.close(); setMenuOpen(false); menuButton.current?.focus(); }
  function changeService(index: number) {
    const section = document.getElementById("digital");
    if (!section) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    if (window.matchMedia("(max-width: 800px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const track = section.querySelector<HTMLElement>(".service-track")!;
      track.scrollTo({ left: index * track.clientWidth, behavior });
    } else window.scrollTo({ top: section.offsetTop + index / 2 * (section.offsetHeight - window.innerHeight), behavior });
  }

  return <div ref={root} className="motion-home">
    <a href="#main-content" className="motion-skip">Skip to content</a>
    <div className="motion-progress" aria-hidden="true" />
    <header className="motion-header">
      <a href="#top" className="motion-brand" aria-label="Anthēon Group home">anthēon<small>GROUP</small></a>
      <span className="header-note">Independent thinking.<br />Extraordinary possibilities.</span>
      <div className="header-actions"><a href="#contact" className="motion-pill">Let’s talk <i aria-hidden="true" /></a><button ref={menuButton} type="button" className="motion-menu-button" aria-haspopup="dialog" aria-expanded={menuOpen} aria-controls="motion-menu" aria-label="Open navigation" onClick={() => { menuRef.current?.showModal(); setMenuOpen(true); }}><span /><span /></button></div>
    </header>
    <dialog ref={menuRef} id="motion-menu" className="motion-menu" onCancel={() => setMenuOpen(false)} onClose={() => setMenuOpen(false)} aria-label="Site navigation">
      <div className="menu-top"><span className="motion-brand">anthēon</span><button onClick={closeMenu} aria-label="Close navigation">Close <span aria-hidden="true"><VectorIcon name="close" /></span></button></div>
      <nav>{[["The group", "/#about"], ["What we do", "/#digital"], ["Selected work", "/#work"], ["Our ventures", "/#ventures"], ["Get in touch", "/#contact"]].map(([label, href], index) => <a href={href} key={href} onClick={closeMenu}><small>0{index + 1}</small>{label}</a>)}</nav>
      <a className="menu-email" href={`mailto:${siteLinks.email}`}>{siteLinks.email}</a>
    </dialog>
    <aside className="motion-rail" aria-hidden="true"><span>{sectionName}</span><div /><span>SCROLL TO EXPLORE</span></aside>
    <main id="main-content" tabIndex={-1}>
      <CityHero />
      <section className="motion-intro" id="about" data-chapter="02 — THE GROUP" aria-labelledby="intro-title">
        <div className="intro-top"><p className="motion-eyebrow">01 / THE GROUP</p><span className="intro-star" aria-hidden="true"><VectorIcon name="star" /></span></div>
        <h2 id="intro-title" aria-label="Different ideas. Shared ambition. We turn possibility into something real.">{"Different ideas. Shared ambition. We turn possibility into something real.".split(" ").map((word, i) => <span className="intro-word" key={i}>{word} </span>)}</h2>
        <div className="intro-bottom motion-reveal"><span>THINK INDEPENDENTLY.<br />BUILD WITH INTENT.</span><p>Anthēon brings together ventures across software, services, design and consumer markets. From the first idea to the details that make it work, we build with a clear purpose.</p><a href="#ventures" className="motion-text-link">Discover the group <span aria-hidden="true"><VectorIcon name="plus" /></span></a></div>
      </section>
      <section className="motion-services" id="digital" data-chapter="03 — WHAT WE DO" aria-labelledby="services-title">
        <div className="services-stage">
          <div className="services-top"><p className="motion-eyebrow" id="services-title">02 / WHAT WE DO</p><span>THOUGHTFULLY CONCEIVED. METICULOUSLY BUILT.</span></div>
          <div className="service-track">{services.map((service, index) => <article className="service-panel" key={service.number} inert={enhanced && activeService !== index}>
            <div className="service-visual"><div className="service-orbit" aria-hidden="true" /><span className="service-watermark" aria-hidden="true">{service.number}</span><a href={service.href} className="service-screen" aria-label={service.link}><div className="screen-chrome"><i /><i /><i /><span>ANTHĒON / SELECTED EXPLORATIONS</span></div><Image src={service.image} alt={service.name} width={1440} height={900} sizes="(max-width: 800px) 90vw, 50vw" /></a><span className="service-caption">{service.name}</span></div>
            <div className="service-copy"><p className="motion-eyebrow">{service.tag}</p><h2>{service.title[0]}<br /><em>{service.title[1]}</em></h2><p className="service-description">{service.description}</p><ul>{service.items.map(item => <li key={item}>{item}</li>)}</ul><a href={service.href} className="motion-pill">{service.link}<i aria-hidden="true" /></a></div>
          </article>)}</div>
          <div className="services-bottom"><span>SCROLL TO KEEP EXPLORING</span><div className="service-pagination" aria-label="Service sections">{services.map((service, i) => <button key={service.number} onClick={() => changeService(i)} aria-label={`View ${service.tag.toLowerCase()}`} aria-current={activeService === i ? "step" : undefined}>{service.number}<span /></button>)}</div><span className="service-current">0{activeService + 1} <em>/ 03</em></span></div>
        </div>
      </section>
      <section className="motion-work" id="work" data-chapter="04 — SELECTED WORK" aria-labelledby="work-title">
        <div className="work-heading-new motion-reveal"><p className="motion-eyebrow">03 / SELECTED DESIGN EXPLORATIONS</p><h2 id="work-title">Different by<br /><em>design.</em><span className="work-asterisk" aria-hidden="true"><VectorIcon name="star" /></span></h2><div><p>A few of the ways we bring<br />a business to life online.</p><a href="/web-design" className="motion-text-link">All six concepts <span aria-hidden="true"><VectorIcon name="plus" /></span></a></div></div>
        <div className="motion-work-stack">{[concepts[0], concepts[1], concepts[4]].map((concept, index) => <a href={`/concepts/${concept.slug}`} className={`motion-work-card work-card-${index}`} key={concept.slug}>
          <div className="work-card-image"><Image src={concept.image} alt={concept.imageAlt} width={1600} height={1000} sizes="(max-width: 800px) 95vw, 90vw" /></div><div className="work-card-bar"><span className="work-card-index">0{index + 1}</span><h3>{concept.name}</h3><span>{concept.category}<small>INDEPENDENT CONCEPT</small></span><span className="work-open">Explore <b aria-hidden="true"><VectorIcon name="plus" /></b></span></div>
        </a>)}</div><p className="motion-disclaimer">Independent design explorations, not commissioned client projects.</p>
      </section>
      <VentureGallery />
      <section className="motion-contact" id="contact" data-chapter="06 — WHAT'S NEXT" aria-labelledby="contact-title"><div className="contact-glow" aria-hidden="true" /><div className="contact-top motion-reveal"><p className="motion-eyebrow">05 / START SOMETHING</p><p>A venture. A website. A better way of doing things.<br />Good things start with a conversation.</p></div><h2 id="contact-title" className="motion-reveal">Have something<br /><em>worth building?</em></h2><a href={`mailto:${siteLinks.email}`} className="contact-email">{siteLinks.email}<span aria-hidden="true"><VectorIcon name="plus" /></span></a><div className="contact-bottom"><span>BUCKINGHAMSHIRE, UNITED KINGDOM</span><a href="#top">BACK TO THE TOP <VectorIcon name="arrow-up" /></a></div></section>
    </main>
    <footer className="motion-footer"><div><span>© {new Date().getFullYear()} Anthēon Group</span><span>VENTURES. DIGITAL. DISTINCTLY ANTHĒON.</span><a href="/privacy">Privacy policy</a></div><a className="footer-wordmark" href="#top" aria-label="Anthēon — back to top">anthēon</a></footer>
  </div>;
}
