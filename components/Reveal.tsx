"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: "none" | "short" | "medium";
};

export function Reveal({ children, className = "", delay = "none" }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const delayClass =
    delay === "short" ? "reveal-delay-short" : delay === "medium" ? "reveal-delay-medium" : "";

  useEffect(() => {
    const element = elementRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || reducedMotion.matches || !("IntersectionObserver" in window)) return;

    // Visible server-rendered content stays visible during hydration.
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.classList.add("reveal-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );

    const showWithoutMotion = (event: MediaQueryListEvent) => {
      if (event.matches) {
        element.classList.remove("reveal-ready", "reveal-visible");
        observer.disconnect();
      }
    };

    element.classList.add("reveal-ready");
    observer.observe(element);
    reducedMotion.addEventListener("change", showWithoutMotion);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", showWithoutMotion);
      element.classList.remove("reveal-ready", "reveal-visible");
    };
  }, []);

  return <div ref={elementRef} className={`reveal ${delayClass} ${className}`}>{children}</div>;
}
