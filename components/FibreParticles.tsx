"use client";

import { useEffect, useId, useRef } from "react";

// Paths traced in the source image's coordinates, travelling from bottom to top.
const lanes = [
  "M1490 970 C1330 790 1075 630 976 529 C905 467 871 419 972 414 C1150 450 1450 390 1550 310 C1680 210 1510 152 1385 131 C1150 100 990 62 909 -40",
  "M1650 970 C1460 787 1190 631 1013 527 C914 469 874 428 984 434 C1170 470 1470 410 1580 320 C1690 210 1460 109 1378 104 C1180 58 1130 27 1082 -40",
  "M1410 970 C1310 809 1100 650 987 543 C889 457 859 418 955 425 C1130 460 1450 410 1570 320 C1680 220 1550 135 1390 120 C1190 89 1070 60 985 -40",
];

export function FibreParticles() {
  const ref = useRef<SVGSVGElement>(null);
  const glowId = `fibre-glow-${useId().replaceAll(":", "")}`;

  useEffect(() => {
    const svg = ref.current;
    const art = svg?.parentElement;
    const image = art?.querySelector("img");
    if (!svg || !art || !image) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      const running = visible && !document.hidden && !reduced.matches && !document.documentElement.dataset.antheonIntro;
      if (running) svg.unpauseAnimations(); else svg.pauseAnimations();
      svg.dataset.running = String(running);
    };
    const measure = () => {
      const width = art.clientWidth, height = art.clientHeight;
      if (!width || !height) return;
      const scale = Math.max(width / 1672, height / 941);
      const [x, y] = getComputedStyle(image).objectPosition.split(" ").map(value => parseFloat(value) / 100);
      const viewWidth = width / scale, viewHeight = height / scale;
      svg.setAttribute("viewBox", `${(1672 - viewWidth) * (Number.isFinite(x) ? x : .5)} ${(941 - viewHeight) * (Number.isFinite(y) ? y : .5)} ${viewWidth} ${viewHeight}`);
      svg.dataset.ready = "true";
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
      svg.pauseAnimations();
      resize.disconnect(); visibility.disconnect(); intro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return <svg ref={ref} className="fibre-particles" viewBox="0 0 1672 941" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <defs><radialGradient id={glowId}><stop stopColor="#c8e7ff" stopOpacity=".55" /><stop offset="1" stopColor="#819dff" stopOpacity="0" /></radialGradient></defs>
    {lanes.flatMap((path, lane) => Array.from({ length: 3 }, (_, index) => {
      const duration = 18 + lane * 3;
      const begin = -(duration * index / 3 + lane * 2);
      return <g key={`${lane}-${index}`} className={index === 2 ? "fibre-particle-extra" : undefined} opacity="0">
        <circle r="8" fill={`url(#${glowId})`} />
        <ellipse rx="5" ry=".7" fill="#b9dcff" opacity=".4" />
        <circle r="1.3" fill="#e2f1ff" />
        <animateMotion path={path} dur={`${duration}s`} begin={`${begin}s`} rotate="auto" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;.6;.6;0" keyTimes="0;.12;.86;1" dur={`${duration}s`} begin={`${begin}s`} repeatCount="indefinite" />
      </g>;
    }))}
  </svg>;
}
