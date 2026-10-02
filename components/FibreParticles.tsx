"use client";

import { useEffect, useId, useRef } from "react";

// Paths traced in the source image's coordinates, travelling from bottom to top.
const lanes = [
  "M1490 970 C1330 790 1075 630 976 529 C905 467 871 419 972 414 C1150 450 1450 390 1550 310 C1680 210 1510 152 1385 131 C1150 100 990 62 909 -40",
  "M1650 970 C1460 787 1190 631 1013 527 C914 469 874 428 984 434 C1170 470 1470 410 1580 320 C1690 210 1460 109 1378 104 C1180 58 1130 27 1082 -40",
  "M1410 970 C1310 809 1100 650 987 543 C889 457 859 418 955 425 C1130 460 1450 410 1570 320 C1680 220 1550 135 1390 120 C1190 89 1070 60 985 -40",
];

const sourceWidth = 1672;
const sourceHeight = 941;

// Sample once, at equal distances, to retain animateMotion's paced movement.
// Only transform and opacity animate; each small sprite can stay on its own
// compositor layer instead of invalidating a full-screen SVG every frame.
function sampleLane(pathData: string): Keyframe[] {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  const length = path.getTotalLength();
  let previousAngle = 0;

  return Array.from({ length: 601 }, (_, index) => {
    const progress = index / 600;
    const distance = progress * length;
    const point = path.getPointAtLength(distance);
    const before = path.getPointAtLength(Math.max(0, distance - .5));
    const after = path.getPointAtLength(Math.min(length, distance + .5));
    let angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
    if (index) {
      while (angle - previousAngle > 180) angle -= 360;
      while (angle - previousAngle < -180) angle += 360;
    }
    previousAngle = angle;
    const opacity = progress < .12 ? progress / .12 * .6
      : progress > .86 ? (1 - progress) / .14 * .6 : .6;

    return {
      offset: progress,
      transform: `translate3d(${(point.x - 8).toFixed(4)}px, ${(point.y - 8).toFixed(4)}px, 0) rotate(${angle.toFixed(4)}deg)`,
      opacity,
    };
  });
}

export function FibreParticles() {
  const ref = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const glowId = `fibre-glow-${useId().replaceAll(":", "")}`;

  useEffect(() => {
    const overlay = ref.current;
    const plane = planeRef.current;
    const art = overlay?.parentElement;
    const image = art?.querySelector("img");
    if (!overlay || !plane || !art || !image) return;

    const frames = lanes.map(sampleLane);
    const animations = Array.from(plane.children, (element, particle) => {
      const lane = Math.floor(particle / 3);
      const index = particle % 3;
      const duration = (18 + lane * 3) * 1000;
      const animation = element.animate(frames[lane], {
        duration,
        iterations: Infinity,
        easing: "linear",
        fill: "both",
      });
      animation.pause();
      animation.currentTime = duration * index / 3 + lane * 2000;
      return animation;
    });

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let wasRunning = false;
    const sync = () => {
      const running = visible && !document.hidden && !reduced.matches && !document.documentElement.dataset.antheonIntro;
      if (running !== wasRunning) {
        animations.forEach(animation => { if (running) animation.play(); else animation.pause(); });
        wasRunning = running;
      }
      overlay.dataset.running = String(running);
    };
    const measure = () => {
      const width = art.clientWidth, height = art.clientHeight;
      if (!width || !height) return;
      const scale = Math.max(width / sourceWidth, height / sourceHeight);
      const [x, y] = getComputedStyle(image).objectPosition.split(" ").map(value => parseFloat(value) / 100);
      const left = (width - sourceWidth * scale) * (Number.isFinite(x) ? x : .5);
      const top = (height - sourceHeight * scale) * (Number.isFinite(y) ? y : .5);
      plane.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
      overlay.dataset.ready = "true";
    };
    const resize = new ResizeObserver(measure);
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    const intro = new MutationObserver(sync);
    resize.observe(art);
    visibility.observe(art);
    intro.observe(document.documentElement, { attributes: true, attributeFilter: ["data-antheon-intro"] });
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    measure(); sync();
    return () => {
      animations.forEach(animation => animation.cancel());
      resize.disconnect(); visibility.disconnect(); intro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return <div ref={ref} className="fibre-particles" aria-hidden="true">
    <div ref={planeRef} style={{ position: "absolute", left: 0, top: 0, width: sourceWidth, height: sourceHeight, transformOrigin: "0 0" }}>
      {lanes.flatMap((_, lane) => Array.from({ length: 3 }, (_, index) => {
        const particleGlowId = `${glowId}-${lane}-${index}`;
        return <span key={`${lane}-${index}`} className={`fibre-particle${index === 2 ? " fibre-particle-extra" : ""}`} style={{ position: "absolute", left: 0, top: 0, width: 16, height: 16, opacity: 0, willChange: "transform, opacity" }}>
          <svg width="16" height="16" viewBox="-8 -8 16 16" focusable="false" style={{ display: "block" }}>
            <defs><radialGradient id={particleGlowId}><stop stopColor="#c8e7ff" stopOpacity=".55" /><stop offset="1" stopColor="#819dff" stopOpacity="0" /></radialGradient></defs>
            <circle r="8" fill={`url(#${particleGlowId})`} />
            <ellipse rx="5" ry=".7" fill="#b9dcff" opacity=".4" />
            <circle r="1.3" fill="#e2f1ff" />
          </svg>
        </span>;
      }))}
    </div>
  </div>;
}
