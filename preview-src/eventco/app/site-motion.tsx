'use client';

import { useEffect } from 'react';

const revealTargets = [
  '.intro > *', '.section-heading > *', '.occasion-card',
  '.feature-photo', '.feature-copy > *', '.service-card',
  '.process > div:first-child > *', '.step',
  '.testimonial > :not(.quote-mark)', '.other-services > .eyebrow',
  '.other-links > a', '.cta-inner > *', '.wedding-intro > *',
  '.info-grid > *', '.image-pair > *', '.corporate-names > *',
  '.furniture-grid > *', '.faq-grid > div:first-child',
  '.detail-copy > .specifications', '.contact-photo', '.footer-grid > *',
  '.collection-section > .section-heading > *', '.orangery-heading > *', '.orangery-footer > *',
].join(',');

/** Enhance offscreen content only; the server-rendered page is visible without JS. */
export function SiteMotion() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!('IntersectionObserver' in window)) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>(revealTargets));
    let observer: IntersectionObserver | undefined;

    const reveal = (element: HTMLElement, immediately = false) => {
      element.dataset.reveal = immediately ? 'visible' : 'entering';
      observer?.unobserve(element);
    };

    const setup = () => {
      observer?.disconnect();
      if (preference.matches) {
        targets.forEach(element => reveal(element, true));
        return;
      }

      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
          else if (entry.boundingClientRect.bottom < 0) reveal(entry.target as HTMLElement, true);
        }
      }, { rootMargin: '0px 0px -32px 0px', threshold: 0 });

      for (const element of targets) {
        if (element.dataset.reveal || element.getBoundingClientRect().top < window.innerHeight) continue;
        const siblings = Array.from(element.parentElement?.children ?? []).filter(child => child.matches(revealTargets));
        element.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(element), 3) * 85}ms`);
        element.dataset.reveal = 'pending';
        observer.observe(element);
      }
    };

    // Keyboard navigation and restored pages must never wait for an entrance.
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>('[data-reveal]');
      if (target) reveal(target, true);
    };
    const onRestore = () => {
      for (const element of targets) {
        const bounds = element.getBoundingClientRect();
        if (bounds.top < window.innerHeight && bounds.bottom > 0 && element.dataset.reveal === 'pending') {
          reveal(element, true);
        }
      }
    };

    setup();
    preference.addEventListener('change', setup);
    document.addEventListener('focusin', onFocus);
    window.addEventListener('pageshow', onRestore);
    window.addEventListener('hashchange', onRestore);
    return () => {
      observer?.disconnect();
      preference.removeEventListener('change', setup);
      document.removeEventListener('focusin', onFocus);
      window.removeEventListener('pageshow', onRestore);
      window.removeEventListener('hashchange', onRestore);
      targets.forEach(element => {
        delete element.dataset.reveal;
        element.style.removeProperty('--reveal-delay');
      });
    };
  }, []);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.site-header');
    const hero = document.querySelector<HTMLElement>('.cinema-hero');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    const paint = () => {
      frame = 0;
      if (header) {
        header.dataset.scrolled = String(window.scrollY > 45);
        const distance = document.documentElement.scrollHeight - window.innerHeight;
        header.style.setProperty('--read-progress', String(distance > 0 ? Math.min(window.scrollY / distance, 1) : 0));
      }
      if (hero) hero.style.setProperty('--hero-drift', `${preference.matches || !finePointer.matches ? 0 : Math.min(window.scrollY * .14, 85)}px`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    let activeMagnet: HTMLElement | null = null;
    const resetMagnet = () => {
      activeMagnet?.style.removeProperty('--magnet-x');
      activeMagnet?.style.removeProperty('--magnet-y');
      activeMagnet = null;
    };
    const onMove = (event: PointerEvent) => {
      if (preference.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
      const element = event.target instanceof Element ? event.target.closest<HTMLElement>('.round-link') : null;
      if (element !== activeMagnet) resetMagnet();
      if (!element) return;
      activeMagnet = element;
      const bounds = element.getBoundingClientRect();
      element.style.setProperty('--magnet-x', `${(event.clientX - bounds.left - bounds.width / 2) * .12}px`);
      element.style.setProperty('--magnet-y', `${(event.clientY - bounds.top - bounds.height / 2) * .12}px`);
    };
    paint();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    preference.addEventListener('change', schedule);
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', resetMagnet);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', schedule);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', resetMagnet);
      resetMagnet();
    };
  }, []);

  return null;
}
