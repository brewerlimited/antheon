"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
const Avenue = dynamic(() => import("../city-lab/CityLab").then(m => m.CityLab), { ssr: false });
import { useEffect, useRef, useState } from "react";
import { VectorIcon } from "@/components/VectorIcon";
import { districts, type DistrictId } from "./districts";
import type { createCityScene } from "./city-scene";
import "./city.css";

type CityScene = ReturnType<typeof createCityScene>;
type Mode = "poster" | "waiting" | "loading" | "live" | "static";
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (from: number, to: number, value: number) => {
  const t = clamp((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};

export function CityHero() {
  const avenueDialog = useRef<HTMLDialogElement>(null);
  const avenueButton = useRef<HTMLButtonElement>(null);
  const avenueOpenRef = useRef(false);
  const [avenueOpen, setAvenueOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<CityScene | null>(null);
  const progressRef = useRef(0);
  const pausedRef = useRef(false);
  const activeRef = useRef<DistrictId>("core");
  const [mode, setMode] = useState<Mode>("poster");
  const [selected, setSelected] = useState<DistrictId>("core");
  const [interacted, setInteracted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState(0);
  const active = selected;
  const districtIndex = districts.findIndex(item => item.id === active);
  const district = districts[districtIndex];
  const detailVisible = (interacted || phase > 0 || mode === "static") && !(phase === 3 && mode === "live");

  useEffect(() => {
    activeRef.current = active;
    sceneRef.current?.setActiveDistrict(active);
  }, [active]);

  useEffect(() => {
    const root = rootRef.current, stage = stageRef.current, canvas = canvasRef.current;
    if (!root || !stage || !canvas) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(max-width: 800px), (max-height: 560px)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    let disposed = false, loading = false, failed = false, visible = true;
    let ascii: ReturnType<typeof import("../city-lab/ascii-pass").createAsciiPass> | undefined;
    let frame = 0, generation = 0, lastPhase = -1;
    let currentMode: Mode = "poster";
    let top = 0, distance = 1;
    const changeMode = (next: Mode) => {
      if (currentMode === next || disposed) return;
      currentMode = next;
      root.dataset.mode = next;
      setMode(next);
      measure();
    };
    const measure = () => {
      top = root.getBoundingClientRect().top + window.scrollY;
      distance = Math.max(1, root.offsetHeight - stage.clientHeight);
      schedule();
    };
    const update = () => {
      frame = 0;
      if (disposed) return;
      const progress = currentMode === "live" ? clamp((scrollY - top) / distance) : 0;
      progressRef.current = progress;
      sceneRef.current?.setProgress(progress);
      stage.style.setProperty("--city-reveal", smooth(.12, .48, progress).toFixed(4));
      stage.style.setProperty("--city-exit", smooth(.88, 1, progress).toFixed(4));
      stage.style.setProperty("--city-progress", progress.toFixed(4));
      root.dataset.progress = progress.toFixed(3);
      const nextPhase = progress < .22 ? 0 : progress < .6 ? 1 : progress < .9 ? 2 : 3;
      if (nextPhase !== lastPhase) { lastPhase = nextPhase; setPhase(nextPhase); }
    };
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(update); };
    // A recreated renderer needs one frame before the persisted pause takes effect.
    const shouldRun = () => visible && !document.hidden && (currentMode === "loading" || !pausedRef.current) && !document.documentElement.dataset.antheonIntro && !avenueOpenRef.current;
    const prefersStill = () => compact.matches || reduced.matches || connection?.saveData || (memory !== undefined && memory <= 2);
    const stopScene = () => {
      generation++;
      loading = false;
      sceneRef.current?.dispose();
      sceneRef.current = null;
      ascii?.dispose(); ascii = undefined;
    };
    const boot = () => {
      if (disposed) return;
      if (prefersStill() || failed) {
        stopScene();
        changeMode("static");
        return;
      }
      if (document.documentElement.dataset.antheonIntro) {
        sceneRef.current?.setRunning(false);
        if (!sceneRef.current) changeMode("waiting");
        return;
      }
      if (sceneRef.current) { sceneRef.current.setRunning(shouldRun()); return; }
      if (loading || !visible || document.hidden) return;
      loading = true;
      const attempt = ++generation;
      changeMode("loading");
      void Promise.all([import("./city-scene"), import("../city-lab/ascii-pass")]).then(([{ createCityScene }, { createAsciiPass }]) => {
        if (disposed || generation !== attempt) return;
        const onError = () => {
          if (disposed || generation !== attempt) return;
          failed = true;
          // Disposal outside a render/context-loss callback is safe for the renderer.
          queueMicrotask(() => { if (!disposed && generation === attempt) { stopScene(); changeMode("static"); } });
        };
        ascii = createAsciiPass();
        const scene = createCityScene(canvas, {
          renderFrame: (renderer, world, camera) => {
            const amount = smooth(.02, .56, progressRef.current);
            root.dataset.representation = amount >= 1 ? "solid" : amount <= 0 ? "ascii" : "transition";
            // Return to the original render path once resolved, preserving its exact grading.
            if (amount >= 1) renderer.render(world, camera);
            else { ascii?.setMix(amount); ascii?.render(renderer, world, camera); }
          },
          onHover: id => { if (!disposed && id) { setSelected(id); setInteracted(true); } },
          onSelect: id => { if (!disposed) { setSelected(id); setInteracted(true); } },
          onReady: () => {
            if (disposed || generation !== attempt) return;
            requestAnimationFrame(() => {
              if (disposed || generation !== attempt) return;
              changeMode("live");
              sceneRef.current?.setRunning(shouldRun());
            });
          },
          onError,
        });
        if (disposed || generation !== attempt) { scene.dispose(); return; }
        sceneRef.current = scene;
        scene.setActiveDistrict(activeRef.current);
        scene.setProgress(progressRef.current);
        scene.setRunning(shouldRun());
        loading = false;
        if (process.env.NODE_ENV === "development") {
          (canvas as HTMLCanvasElement & { cityScene?: CityScene }).cityScene = scene;
        }
      }).catch(() => {
        if (disposed || generation !== attempt) return;
        failed = true; stopScene(); changeMode("static");
      });
    };
    const onResize = () => { boot(); sceneRef.current?.resize(); measure(); };
    const onVisibility = () => { boot(); sceneRef.current?.setRunning(shouldRun()); };
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      boot(); sceneRef.current?.setRunning(shouldRun());
    }, { rootMargin: "80px 0px" });
    intersection.observe(root);
    const sizing = new ResizeObserver(measure);
    sizing.observe(root); sizing.observe(stage);
    const intro = new MutationObserver(boot);
    intro.observe(document.documentElement, { attributes: true, attributeFilter: ["data-antheon-intro"] });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", onResize);
    compact.addEventListener("change", onResize);
    const initial = requestAnimationFrame(() => { measure(); boot(); });
    return () => {
      disposed = true;
      cancelAnimationFrame(initial); cancelAnimationFrame(frame);
      stopScene();
      intersection.disconnect(); sizing.disconnect(); intro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onResize);
      compact.removeEventListener("change", onResize);
      delete (canvas as HTMLCanvasElement & { cityScene?: CityScene }).cityScene;
    };
  }, []);

  useEffect(() => {
    if (!avenueOpen) return;
    const dialog = avenueDialog.current;
    if (!dialog) return;
    avenueOpenRef.current = true;
    sceneRef.current?.setRunning(false);
    const returnButton = avenueButton.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      avenueOpenRef.current = false;
      dialog.close();
      sceneRef.current?.setRunning(!pausedRef.current && !document.hidden);
      returnButton?.focus({ preventScroll: true });
    };
  }, [avenueOpen]);

  function explore(id?: DistrictId) {
    setSelected(id ?? selected); setInteracted(true);
    if (mode !== "live" || !rootRef.current || !stageRef.current || progressRef.current >= .6) return;
    const root = rootRef.current;
    const top = root.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top + (root.offsetHeight - stageRef.current.clientHeight) * .67, behavior: "smooth" });
  }

  function changeDistrict(direction: number) {
    explore(districts[(districtIndex + direction + districts.length) % districts.length].id);
  }

  function togglePause() {
    const next = !paused;
    pausedRef.current = next; setPaused(next);
    sceneRef.current?.setRunning(!next && !document.hidden);
  }

  return <>
    <section ref={rootRef} id="top" className="city-experience" data-mode={mode} data-phase={phase} data-interacted={interacted ? "true" : undefined} data-chapter="01 — THE ECOSYSTEM" aria-labelledby="city-title">
      <div ref={stageRef} className="city-stage">
        <div className="city-world" aria-hidden="true">
          <div className="city-poster city-poster-aerial"><picture><source media="(max-width: 800px), (max-height: 560px)" srcSet="/images/city/mobile.webp" /><Image src="/images/city/aerial.webp" alt="" fill priority unoptimized sizes="100vw" /></picture></div>
          <div className="city-poster city-poster-isometric"><picture><source media="(max-width: 800px), (max-height: 560px)" srcSet="/images/city/mobile.webp" /><Image src="/images/city/isometric.webp" alt="" fill unoptimized sizes="100vw" /></picture></div>
          <canvas ref={canvasRef} className="city-canvas" aria-hidden="true" />
          <div className="city-vignette" />
        </div>
        <div className="city-heading city-entry-ui">
          <p className="city-eyebrow"><span /> THE ANTHĒON ECOSYSTEM</p>
          <h1 id="city-title">A world of<br /><em>possibility.</em></h1>
          <p className="city-introduction">Ventures, software and digital experiences.<br />Independent thinking. Connected ambition.</p>
          <button type="button" className="city-explore" onClick={() => explore()} tabIndex={interacted || phase > 0 || mode === "static" ? -1 : 0}>Explore the ecosystem <VectorIcon name="arrow-down" /></button>
        </div>
        <div className="city-detail city-entry-ui" id="city-district-detail" inert={!detailVisible}>
          <div className="city-detail-panels">
            {districts.map(item => <div key={item.id} className="city-detail-panel" data-active={selected === item.id ? "true" : undefined} aria-hidden={selected !== item.id} inert={selected !== item.id}>
              <p className="city-detail-label">{item.number} / {item.detail}</p>
              <h2>{item.title}</h2>
              <p className="city-detail-copy">{item.description}</p>
              <a href={item.href} className="city-detail-link" tabIndex={detailVisible && selected === item.id ? 0 : -1}>{item.link}<VectorIcon name="arrow-up-right" /></a>
            </div>)}
          </div>
          <div className="city-district-control" role="group" aria-label="Explore the Anthēon districts">
            <span className="city-current-district" aria-live="polite" aria-atomic="true"><span>{district.number} / 04</span> {district.label}</span>
            <div className="city-district-arrows">
              <button type="button" aria-label="Previous district" aria-controls="city-district-detail" onClick={() => changeDistrict(-1)} tabIndex={detailVisible ? 0 : -1}><VectorIcon name="arrow-left" /></button>
              <button type="button" aria-label="Next district" aria-controls="city-district-detail" onClick={() => changeDistrict(1)} tabIndex={detailVisible ? 0 : -1}><VectorIcon name="arrow-right" /></button>
            </div>
          </div>
        </div>
        <div className="city-bottom city-entry-ui">
          <div className="city-status-row">
            <span className="city-scroll-note"><span className="city-status-dot" />{mode === "live" ? ["SCROLL TO BRING THE CITY TO LIFE", "A CONNECTED WORLD, COMING TO LIFE", "HOVER A DISTRICT. DISCOVER THE THINKING.", "FROM POSSIBILITY TO PRACTICE"][phase] : "FOUR DISTRICTS. ONE SHARED VISION."}</span>
            <div className="city-tools">
              <button ref={avenueButton} type="button" className="city-continue city-avenue-entry" onClick={() => setAvenueOpen(true)}>Enter the avenue <VectorIcon name="arrow-up-right" /></button>
              {mode === "live" && <button className="city-pause" type="button" onClick={togglePause} aria-pressed={paused}>{paused ? "Resume motion" : "Pause motion"}<span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span></button>}
              <a className="city-continue" href="#about">Continue to the group <VectorIcon name="arrow-down" /></a>
            </div>
          </div>
          <div className="city-progress-track" aria-hidden="true"><span /></div>
        </div>
        {mode === "loading" && <span className="city-loading" role="status">Preparing the city<span /></span>}
        <noscript><div className="city-no-script">{districts.map(item => <a key={item.id} href={item.href}><strong>{item.label}</strong><span>{item.description}</span></a>)}</div></noscript>
      </div>
    </section>
    <dialog ref={avenueDialog} className="city-avenue-dialog" aria-label="Explore Possibility Avenue" onCancel={() => setAvenueOpen(false)} onClose={() => setAvenueOpen(false)}>
      {avenueOpen && <Avenue embedded initialView="street" initialDistrict={selected === "core" ? undefined : selected} onReturn={() => setAvenueOpen(false)} />}
    </dialog>
  </>;
}
