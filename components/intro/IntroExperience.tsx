"use client";

import { VectorIcon } from "@/components/VectorIcon";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { createIntroScene } from "./intro-scene";
import type { NavigationBrand } from "./navigation-brand";
import "./intro.css";

type Scene = Awaited<ReturnType<typeof createIntroScene>>;
const SESSION_KEY = "antheon:intro:v1";
const ENTER_AT = 4.10;
const ENTER_DURATION = .85;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => value * value * (3 - 2 * value);

export function IntroExperience({ children }: { children: ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const finishRef = useRef<(focus?: boolean) => void>(() => {});
  const eligibleRef = useRef<boolean | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished) return;
    const overlay = overlayRef.current;
    const content = contentRef.current;
    const canvas = canvasRef.current;
    const brandHost = brandRef.current;
    const html = document.documentElement;
    if (!overlay || !content || !canvas || !brandHost) return;
    if (eligibleRef.current === null) eligibleRef.current = Boolean(html.dataset.antheonIntro);
    if (!eligibleRef.current) return;
    document.dispatchEvent(new Event("antheon:intro-mounted"));

    let cancelled = false;
    let frame = 0;
    let scene: Scene | undefined;
    let brand: NavigationBrand | undefined;
    let sampleBrand: ((element: HTMLElement) => Promise<NavigationBrand>) | undefined;
    let resizeVersion = 0;
    let intervalCount = 0;
    let totalFrameMs = 0;
    let maxFrameMs = 0;
    const frameIntervals = new Float32Array(900);
    let heroReady = false;
    let exitStart = -1;
    let previousFrame = performance.now();
    let elapsed = 0;
    let hiddenAt = 0;
    let phase = "";
    const pointer = { x: 0, y: 0 };
    const targetPointer = { x: 0, y: 0 };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || scrollY > 40 || (location.hash && location.hash !== "#top")) {
      delete html.dataset.antheonIntro;
      return;
    }
    const navBrand = content.querySelector<HTMLElement>(".motion-header .motion-brand");
    if (!navBrand) { delete html.dataset.antheonIntro; return; }
    let brandTarget = navBrand.getBoundingClientRect();
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const previousFocus = document.activeElement as HTMLElement | null;
    const hero = content.querySelector<HTMLImageElement>(".hero-art img");
    const start = performance.now();
    const preview = process.env.NODE_ENV === "development" && ["1", "replay"].includes(new URLSearchParams(location.search).get("intro") || "");
    const stillValue = preview ? Number(new URLSearchParams(location.search).get("at")) : NaN;
    const still = preview && new URLSearchParams(location.search).has("at") && Number.isFinite(stillValue)
      ? Math.max(0, Math.min(ENTER_AT + ENTER_DURATION - .001, stillValue)) : null;

    content.inert = true;
    content.dataset.entering = "true";
    // Include the reserved scrollbar gutter in the fullscreen canvas.
    overlay.style.width = `${innerWidth}px`;
    html.dataset.antheonIntro = "playing";
    overlay.setAttribute("aria-hidden", "false");
    overlay.focus({ preventScroll: true });
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* Private mode still plays safely. */ }

    const releasePage = () => {
      content.inert = false;
      delete content.dataset.entering;
      content.style.removeProperty("--entry-progress");
      content.style.removeProperty("--entry-ui");
      delete html.dataset.antheonIntro;
    };
    const finish = (focus = false) => {
      if (cancelled) return;
      cancelled = true;
      cancelAnimationFrame(frame);
      if (process.env.NODE_ENV === "development") {
        content.dataset.introDuration = ((performance.now() - start) / 1000).toFixed(2);
        if (intervalCount) {
          const ordered = Array.from(frameIntervals.subarray(0, Math.min(intervalCount, frameIntervals.length))).sort((a, b) => a - b);
          content.dataset.introFps = (intervalCount * 1000 / totalFrameMs).toFixed(1);
          content.dataset.introP95 = ordered[Math.floor((ordered.length - 1) * .95)].toFixed(1);
          content.dataset.introWorstFrame = maxFrameMs.toFixed(1);
        }
        if (brand && exitStart >= 0 && !focus) {
          const a = brandHost.getBoundingClientRect(), b = navBrand.getBoundingClientRect();
          content.dataset.introLogoError = Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.width-b.width),Math.abs(a.height-b.height)).toFixed(3);
        }
      }
      scene?.dispose();
      scene = undefined;
      brandHost.replaceChildren();
      releasePage();
      setFinished(true);
      if (focus) {
        content.querySelector<HTMLElement>("#main-content")?.focus({ preventScroll: true });
      } else if (previousFocus && previousFocus !== document.body && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      } else if (document.activeElement === overlay || document.activeElement === skipRef.current) {
        (document.activeElement as HTMLElement).blur();
      }
    };
    finishRef.current = finish;

    const ready = () => { heroReady = true; };
    const onHeroError = () => finish();
    if (!hero) ready();
    else if (hero.complete) {
      if (hero.naturalWidth) hero.decode().then(ready, ready);
      else finish();
    }
    else {
      hero.addEventListener("load", ready, { once: true });
      hero.addEventListener("error", onHeroError, { once: true });
      hero.decode().then(ready, () => { if (hero.complete) { if (hero.naturalWidth) ready(); else finish(); } });
    }

    const installBrand = (next: NavigationBrand) => {
      brand = next;
      brandHost.replaceChildren(next.clone);
      brandHost.style.width = `${next.width}px`;
      brandHost.style.height = `${next.height}px`;
      brandTarget = navBrand.getBoundingClientRect();
    };
    const positionBrand = (time: number, exit: number) => {
      if (!brand) return;
      const centerWidth = innerWidth < 700 ? innerWidth * .82 : Math.min(innerWidth * .64, 900);
      const initialScale = centerWidth / brand.width;
      const progress = ease(clamp((exit - .12) / .80));
      const scale = initialScale * Math.pow(1 / initialScale, progress);
      const startX = (innerWidth - centerWidth) / 2;
      const startY = innerHeight * .46 - brand.height * initialScale / 2;
      const x = startX + (brandTarget.left - startX) * progress;
      const y = startY + (brandTarget.top - startY) * progress - Math.sin(progress * Math.PI) * innerHeight * .025;
      brandHost.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
      brandHost.style.opacity = `${ease(clamp((time - 3.425) / .065))}`;
    };
    const onPointer = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType === "touch") return;
      targetPointer.x = (event.clientX / innerWidth - .5) * 2;
      targetPointer.y = (event.clientY / innerHeight - .5) * 2;
    };
    const onResize = () => {
      overlay.style.width = `${innerWidth}px`;
      brandTarget = navBrand.getBoundingClientRect();
      try { scene?.resize(); } catch { finish(); return; }
      const version = ++resizeVersion;
      if (sampleBrand) void sampleBrand(navBrand).then(next => {
        if (cancelled || version !== resizeVersion) return;
        installBrand(next);
        scene?.updateBrand(next);
      }).catch(() => finish());
    };
    const onMotionChange = () => { if (reduced.matches) finish(); };
    const onContextLost = (event: Event) => { event.preventDefault(); finish(); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); finish(true); }
      if (event.key === "Tab") {
        event.preventDefault();
        if (performance.now() - start >= 800) skipRef.current?.focus();
      }
    };
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = performance.now();
        cancelAnimationFrame(frame);
      } else if (!cancelled && scene) {
        // Returning after the opening's useful lifetime should go straight in.
        if (performance.now() - hiddenAt > 1500) finish();
        else { previousFrame = performance.now(); frame = requestAnimationFrame(tick); }
      }
    };
    const tick = (now: number) => {
      if (cancelled || !scene) return;
      const frameMs = now - previousFrame;
      elapsed += Math.min(frameMs / 1000, .15);
      previousFrame = now;
      if (elapsed > .35 && still === null && frameMs > 0) {
        frameIntervals[intervalCount % frameIntervals.length] = frameMs;
        intervalCount++;
        totalFrameMs += frameMs;
        maxFrameMs = Math.max(maxFrameMs, frameMs);
      }
      const time = still ?? elapsed;
      if (time >= ENTER_AT && exitStart < 0 && (heroReady || time >= 5.4)) exitStart = time;
      const exit = still !== null ? clamp((still - ENTER_AT) / ENTER_DURATION) : exitStart < 0 ? 0 : clamp((time - exitStart) / ENTER_DURATION);
      const introTime = Math.min(time, ENTER_AT);
      pointer.x += (targetPointer.x - pointer.x) * .055;
      pointer.y += (targetPointer.y - pointer.y) * .055;
      try { scene.render(introTime, exit, pointer); } catch { finish(); return; }
      positionBrand(time, exit);
      const nextPhase = time < .35 ? "signal" : time < 1.1 ? "environment" : time < 1.8 ? "structure" : time < 2.4 ? "surge" : time < 3.45 ? "construct" : exit > 0 ? "enter" : "ready";
      if (nextPhase !== phase) {
        phase = nextPhase;
        overlay.dataset.phase = phase;
        if (statusRef.current) statusRef.current.textContent = ({ signal: "SIGNAL / 001", environment: "ENVIRONMENT / 01", structure: "STRUCTURE ACTIVE", surge: "VECTOR FIELD", construct: "FORM / 01", ready: "SYSTEM READY", enter: "ENTERING ENVIRONMENT" })[nextPhase];
      }
      overlay.dataset.time = time.toFixed(3);
      overlay.style.setProperty("--intro-ui", `${ease(clamp((time - .25) / .35)) * (1 - ease(clamp(exit * 2)))}`);
      overlay.style.setProperty("--intro-atmosphere", `${1 - ease(clamp((exit - .08) / .73))}`);
      overlay.style.setProperty("--intro-veil", `${ease(clamp(exit / .8))}`);
      overlay.style.setProperty("--intro-veil-opacity", `${Math.sin(clamp(exit / .8) * Math.PI) * .84}`);
      overlay.style.setProperty("--intro-scan", `${clamp(exit / .24)}`);
      overlay.style.setProperty("--intro-scan-opacity", `${exit > 0 ? 1 - ease(clamp((exit - .18) / .23)) : 0}`);
      content.style.setProperty("--entry-progress", `${ease(exit)}`);
      content.style.setProperty("--entry-ui", `${ease(clamp((exit - .25) / .65))}`);
      if (time >= .8 && skipRef.current) { skipRef.current.dataset.visible = "true"; skipRef.current.tabIndex = 0; }
      if (exit >= 1 && still === null) { finish(); return; }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    overlay.addEventListener("keydown", onKey);
    canvas.addEventListener("webglcontextlost", onContextLost);
    reduced.addEventListener("change", onMotionChange);
    const watchdog = window.setTimeout(() => { if (still === null) finish(); }, 7500);
    const skipTimer = window.setTimeout(() => {
      if (!cancelled && skipRef.current) {
        skipRef.current.dataset.visible = "true";
        skipRef.current.tabIndex = 0;
      }
    }, 800);

    void (async () => {
      try {
        const [module, branding] = await Promise.all([import("./intro-scene"), import("./navigation-brand")]);
        sampleBrand = branding.sampleNavigationBrand;
        const source = await sampleBrand(navBrand);
        if (cancelled) return;
        installBrand(source);
        const colors = getComputedStyle(content.querySelector<HTMLElement>(".motion-home")!);
        const nextScene = await module.createIntroScene(canvas, {
          brand: source,
          compact: innerWidth < 700,
          palette: { ice: colors.getPropertyValue("--ice").trim() || "#b9cbff", blue: colors.getPropertyValue("--blue").trim() || "#4466ff", background: colors.backgroundColor || "#06070b" },
        });
        if (cancelled) { nextScene.dispose(); return; }
        scene = nextScene;
        elapsed = Math.min((performance.now() - start) / 1000, .25);
        previousFrame = performance.now();
        overlay.dataset.engine = "ready";
        if (document.hidden) hiddenAt = performance.now();
        else frame = requestAnimationFrame(tick);
      } catch { finish(); }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      clearTimeout(watchdog);
      clearTimeout(skipTimer);
      scene?.dispose();
      brandHost.replaceChildren();
      releasePage();
      hero?.removeEventListener("load", ready);
      hero?.removeEventListener("error", onHeroError);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      overlay.removeEventListener("keydown", onKey);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      reduced.removeEventListener("change", onMotionChange);
    };
  }, [finished]);

  return <>
    <div ref={contentRef} className="intro-content">{children}</div>
    {!finished && <div ref={overlayRef} className="intro-overlay" role="dialog" aria-modal="true" aria-label="Anthēon opening experience" aria-hidden="true" tabIndex={-1}>
      <div className="intro-atmosphere" aria-hidden="true" />
      <div className="intro-seed" aria-hidden="true" />
      <canvas ref={canvasRef} className="intro-canvas" aria-hidden="true" />
      <div className="intro-architectural-veil" aria-hidden="true" />
      <div ref={brandRef} className="intro-brand-flight" aria-hidden="true" />
      <div className="intro-chrome" aria-hidden="true">
        <span className="intro-system">ANTHĒON <b>/</b> SYSTEM</span>
        <span className="intro-coordinates">X 051.48 <b>/</b> Y 000.48 <b>/</b> Z 001</span>
        <span className="intro-bottom-note"><i /> ENVIRONMENT 01</span>
        <span ref={statusRef} className="intro-status">SIGNAL / 001</span>
        <span className="intro-register intro-register-a">+<small>FORM / 01</small></span>
        <span className="intro-register intro-register-b">+<small>VECTOR FIELD</small></span>
      </div>
      <div className="intro-scan" aria-hidden="true" />
      <button ref={skipRef} type="button" className="intro-skip" tabIndex={-1} onClick={() => finishRef.current(true)} aria-label="Skip intro">SKIP <span aria-hidden="true"><VectorIcon name="arrow-right" /></span></button>
    </div>}
  </>;
}
