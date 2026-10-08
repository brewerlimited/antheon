'use client';

import { useEffect, useRef } from 'react';

/** One continuous photo sequence. Native scroll drives every frame in both directions. */
export default function ScrollComposition({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    let dispose = () => {};
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (!live || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add('(min-width: 800px) and (prefers-reduced-motion: no-preference)', () => {
        const reel = root.current!.querySelector<HTMLElement>('.photographic-reel')!;
        const craft = root.current!.querySelector<HTMLElement>('.craft-zoom')!;
        reel.dataset.enhanced = 'true';
        craft.dataset.enhanced = 'true';

        const context = gsap.context(() => {
          const pictures = gsap.utils.toArray<HTMLElement>('.reel-picture', reel);
          const captions = gsap.utils.toArray<HTMLElement>('.reel-caption', reel);
          const frameImages = pictures.map(picture => picture.querySelector('img'));
          gsap.set(pictures, { yPercent: 100 });
          gsap.set(pictures[0], { yPercent: 29, scale: 0.92 });
          gsap.set(captions, { autoAlpha: 0 });
          gsap.set('.reel-footnote', { opacity: 0 });
          const updateImmersion = ({ progress }: { progress: number }) => {
            reel.dataset.immersed = String(progress > 0.075 && progress < 1);
          };

          const sequence = gsap.timeline({
            scrollTrigger: {
              trigger: reel,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
              invalidateOnRefresh: true,
              onUpdate: updateImmersion,
              onRefresh: updateImmersion,
              onLeave: () => { reel.dataset.immersed = 'false'; },
              onLeaveBack: () => { reel.dataset.immersed = 'false'; },
              onEnterBack: updateImmersion,
            },
          });

          sequence.to(pictures[0], { yPercent: 0, scale: 1, duration: 0.8, ease: 'none' }, 0)
            .to('.reel-introduction', { y: -65, autoAlpha: 0, duration: 0.45, ease: 'none' }, 0)
            .fromTo(frameImages[0], { scale: 1.12 }, { scale: 1, duration: 1.2, ease: 'none' }, 0)
            .to(captions[0], { autoAlpha: 1, duration: 0.2 }, 0.6)
            .to('.reel-footnote', { opacity: 1, duration: 0.25 }, 0.65);

          pictures.slice(1).forEach((picture, i) => {
            const at = 1.2 + i * 1.75;
            // The next full-width photograph physically rises over its predecessor.
            // Counter-travel within it keeps the architecture monumental during the handover.
            sequence.fromTo(picture, { yPercent: 100 }, { yPercent: 0, duration: 1.3, ease: 'none' }, at)
              .fromTo(frameImages[i + 1], { yPercent: -13, scale: 1.28 }, { yPercent: 0, scale: 1, duration: 1.75, ease: 'none' }, at)
              .to(frameImages[i], { yPercent: -9, duration: 1.3, ease: 'none' }, at)
              .to(captions[i], { autoAlpha: 0, y: -10, duration: 0.12, ease: 'none' }, at + 0.24)
              .fromTo(captions[i + 1], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'none' }, at + 0.39);
          });
          reel.style.setProperty('--reel-length', String(sequence.duration() + 1));

          gsap.timeline({ scrollTrigger: { trigger: craft, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } })
            .fromTo('.craft-picture', { x: 0, y: 0, xPercent: 29, scale: 0.38 }, { xPercent: 0, scale: 1, duration: 1, ease: 'none' }, 0)
            .fromTo('.craft-picture img', { scale: 1.2 }, { scale: 1, duration: 1, ease: 'none' }, 0)
            .to('.craft-introduction', { y: -70, autoAlpha: 0, duration: 0.6, ease: 'none' }, 0)
            .fromTo('.craft-picture span', { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.7);
        }, root);

        ScrollTrigger.refresh();
        return () => {
          context.revert();
          delete reel.dataset.enhanced;
          delete reel.dataset.immersed;
          delete craft.dataset.enhanced;
          reel.style.removeProperty('--reel-length');
        };
      });
      dispose = () => media.revert();
    }).catch(() => { /* The unenhanced, fully readable photo sequence remains available. */ });

    return () => { live = false; dispose(); };
  }, []);

  return <div className="paye-home" ref={root}>{children}</div>;
}
