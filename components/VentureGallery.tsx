"use client";

import { VectorIcon } from "@/components/VectorIcon";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { siteLinks, ventures } from "@/data/site";
import "./venture-gallery.css";

const artwork = [
  { src: "commercial-copilot", alt: "Construction plans, an architectural model and digital devices in a blue-lit studio" },
  { src: "clearquote", alt: "Floating digital devices with quotation feedback cards in an ice-blue studio" },
  { src: "antheon-outdoor", alt: "A landscaped garden at dusk with a warmly lit pergola and design tablet" },
  { src: "getyourprint", alt: "Art prints, framed geometric artworks and a laptop in a coral-coloured studio" },
  { src: "dualis", alt: "Paired chrome sculptures and a digital brand study in a violet studio" },
];

export function VentureGallery() {
  const gallery = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const grid = gallery.current;
    const follower = cursor.current;
    if (!grid || !follower) return;
    const motionAllowed = window.matchMedia("(min-width: 801px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let currentTile: HTMLElement | null = null;
    let bounds: DOMRect | null = null;
    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let tiltX = 0;
    let tiltY = 0;

    const animate = () => {
      frame = 0;
      x += (targetX - x) * .17;
      y += (targetY - y) * .17;
      tiltX += (targetTiltX - tiltX) * .1;
      tiltY += (targetTiltY - tiltY) * .1;
      follower.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      currentTile?.style.setProperty("--pointer-x", `${tiltX}`);
      currentTile?.style.setProperty("--pointer-y", `${tiltY}`);
      if (currentTile && (Math.abs(targetX - x) > .1 || Math.abs(targetY - y) > .1 || Math.abs(targetTiltX - tiltX) > .001 || Math.abs(targetTiltY - tiltY) > .001)) {
        frame = requestAnimationFrame(animate);
      }
    };
    const reset = () => {
      follower.classList.remove("is-active");
      currentTile?.classList.remove("has-pointer");
      currentTile?.style.removeProperty("--pointer-x");
      currentTile?.style.removeProperty("--pointer-y");
      currentTile = null;
      bounds = null;
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const move = (event: PointerEvent) => {
      if (!motionAllowed.matches || event.pointerType === "touch") { reset(); return; }
      const next = (event.target as HTMLElement).closest<HTMLElement>(".venture-tile");
      if (!next || !grid.contains(next)) { reset(); return; }
      targetX = event.clientX;
      targetY = event.clientY;
      if (next !== currentTile) {
        reset();
        currentTile = next;
        bounds = next.getBoundingClientRect();
        x = targetX;
        y = targetY;
        tiltX = tiltY = 0;
        currentTile.classList.add("has-pointer");
        follower.dataset.label = next.dataset.cursorLabel || "EXPLORE VENTURE";
        follower.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        follower.classList.add("is-active");
      }
      if (bounds) {
        targetTiltX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
        targetTiltY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      }
      if (!frame) frame = requestAnimationFrame(animate);
    };
    grid.addEventListener("pointermove", move);
    grid.addEventListener("pointerleave", reset);
    grid.addEventListener("focusin", reset);
    window.addEventListener("scroll", reset, { passive: true });
    window.addEventListener("resize", reset);
    window.addEventListener("blur", reset);
    motionAllowed.addEventListener("change", reset);
    return () => {
      reset();
      grid.removeEventListener("pointermove", move);
      grid.removeEventListener("pointerleave", reset);
      grid.removeEventListener("focusin", reset);
      window.removeEventListener("scroll", reset);
      window.removeEventListener("resize", reset);
      window.removeEventListener("blur", reset);
      motionAllowed.removeEventListener("change", reset);
    };
  }, []);

  useEffect(() => {
    if (selected === null) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [selected]);

  function closeDetails() { dialog.current?.close(); setSelected(null); }
  const selectedVenture = selected === null ? null : ventures[selected];

  return <section className="venture-showcase" id="ventures" data-chapter="05 — OUR VENTURES" aria-labelledby="ventures-title">
    <div className="venture-showcase-heading motion-reveal">
      <p className="motion-eyebrow">04 / OUR VENTURES</p>
      <h2 id="ventures-title">One group.<br /><em>Many possibilities.</em></h2>
      <p>Different markets. The same instinct<br />to find a better way forward.</p>
    </div>
    <div ref={gallery} className="venture-mosaic">
      {ventures.map((venture, index) => {
        const content = <>
          <div className="venture-tile-art"><Image src={`/images/motion/ventures/${artwork[index].src}.webp`} alt={artwork[index].alt} draggable={false} fill sizes={index === 0 ? "100vw" : "(max-width: 800px) 100vw, 50vw"} /></div>
          <div className="venture-tile-shade" />
          <div className="venture-tile-top"><span>0{index + 1} / ANTHĒON GROUP</span><span>{venture.href ? "EXPLORE VENTURE" : "MEET THE VENTURE"}<b aria-hidden="true"><VectorIcon name="plus" /></b></span></div>
          <div className="venture-tile-title"><h3>{venture.name}</h3><span>{venture.category}</span></div>
          <div className="venture-tile-description"><p>{venture.description}</p></div>
        </>;
        return venture.href ? <a key={venture.name} className={`venture-tile venture-tile-${index}`} draggable={false} href={venture.href} target="_blank" rel="noreferrer" data-cursor-label="EXPLORE VENTURE" aria-label={`Explore ${venture.name} (opens in a new tab)`}>{content}</a> : <button key={venture.name} type="button" className={`venture-tile venture-tile-${index}`} data-cursor-label="DISCOVER MORE" aria-haspopup="dialog" aria-label={`Learn about ${venture.name}`} onClick={() => setSelected(index)}>{content}</button>;
      })}
    </div>
    <p className="venture-art-note">Original visual concepts for the Anthēon ventures.</p>
    <div ref={cursor} className="venture-cursor" aria-hidden="true"><div /></div>
    <dialog ref={dialog} className="venture-dialog" onCancel={() => setSelected(null)} onClose={() => setSelected(null)} aria-labelledby="venture-dialog-title">
      {selectedVenture && selected !== null ? <>
        <button type="button" className="venture-dialog-close" onClick={closeDetails} aria-label="Close venture details">Close <span aria-hidden="true"><VectorIcon name="close" /></span></button>
        <div className="venture-dialog-image"><Image src={`/images/motion/ventures/${artwork[selected].src}.webp`} alt={artwork[selected].alt} width={1536} height={1024} sizes="(max-width: 800px) 100vw, 820px" /></div>
        <div className="venture-dialog-copy"><p className="motion-eyebrow">{selectedVenture.category}</p><h2 id="venture-dialog-title">{selectedVenture.name}</h2><p>{selectedVenture.description}</p><a className="motion-pill" href={`mailto:${siteLinks.email}?subject=${encodeURIComponent(`${selectedVenture.name} enquiry`)}`}>Discuss this venture <i aria-hidden="true" /></a></div>
      </> : null}
    </dialog>
  </section>;
}
