(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.classList.add('js');

  // Colour responds to the text itself; links keep their existing interaction styles.
  document.querySelectorAll('main h1, main h2, main h3, main p, main blockquote, main .eyebrow, .hero-line > span, footer h3, footer p').forEach(el => {
    if (el.closest('a, button, form, label') || el.querySelector('a, button, .hero-line')) return;
    el.classList.add('hover-ink');
    if (el.closest('.hero, .commercial-feature, footer')) el.classList.add('hover-ink-light');
    if (el.closest('.cta')) el.classList.add('hover-ink-accent');
  });

  const reel = document.querySelector('.hero-reel');
  if (reel) {
    const hero = reel.closest('.hero');
    const slides = [...reel.querySelectorAll('.hero-image')];
    const controls = hero.querySelector('.hero-reel-controls');
    const choices = [...controls.querySelectorAll('[data-slide]')];
    const pauseButton = controls.querySelector('.reel-pause');
    let active = 0;
    let pausedByUser = false;
    let inView = true;
    let advanceTimer;
    let fadeTimer;
    let transitioning = false;
    let pendingSlide = null;
    const interval = 8500;
    const fadeTime = 2400;

    function schedule() {
      clearTimeout(advanceTimer);
      const paused = pausedByUser || reduced.matches || document.hidden || !inView;
      reel.classList.toggle('is-paused', paused);
      pauseButton.hidden = reduced.matches;
      pauseButton.setAttribute('aria-label', pausedByUser ? 'Play image reel' : 'Pause image reel');
      pauseButton.title = pausedByUser ? 'Play image reel' : 'Pause image reel';
      pauseButton.querySelector('span').textContent = pausedByUser ? '▶' : 'Ⅱ';
      if (!paused) advanceTimer = setTimeout(() => {
        // A photograph is only introduced after it has loaded successfully.
        const next = slides.findIndex((_, offset) => {
          const index = (active + offset + 1) % slides.length;
          return index !== active && slides[index].complete && slides[index].naturalWidth > 0;
        });
        if (next >= 0) select((active + next + 1) % slides.length);
        else schedule();
      }, interval);
    }

    function select(index) {
      // Finish the current blend before honouring the latest rapid selection.
      if (transitioning && !reduced.matches) { pendingSlide = index; return; }
      pendingSlide = null;
      if (index === active || !slides[index].complete || !slides[index].naturalWidth) { schedule(); return; }
      clearTimeout(fadeTimer);
      transitioning = true;
      slides[active].classList.replace('is-active', 'is-leaving');
      slides[index].classList.remove('is-leaving');
      slides[index].classList.add('is-active');
      active = index;
      choices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
      hero.querySelector('.hero-caption strong').textContent = slides[index].dataset.caption;
      // Keep the outgoing photograph opaque beneath the fade so there is no dark flash.
      fadeTimer = setTimeout(() => {
        slides.forEach((slide, i) => {
          if (i !== active) slide.classList.remove('is-leaving');
        });
        transitioning = false;
        const requested = pendingSlide;
        pendingSlide = null;
        if (requested !== null) select(requested);
      }, reduced.matches ? 0 : fadeTime + 50);
      schedule();
    }

    choices.forEach((button, index) => {
      const updateAvailability = () => { button.disabled = !slides[index].naturalWidth; };
      if (slides[index].complete) updateAvailability();
      else {
        button.disabled = true;
        slides[index].addEventListener('load', updateAvailability, { once: true });
        slides[index].addEventListener('error', updateAvailability, { once: true });
      }
      button.addEventListener('click', () => select(index));
    });
    pauseButton.addEventListener('click', () => { pausedByUser = !pausedByUser; schedule(); });
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', schedule);
    if ('IntersectionObserver' in window) {
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        schedule();
      }, { threshold: 0 });
      visibilityObserver.observe(hero);
    }
    controls.hidden = false;
    schedule();
  }

  // Opposing entrances follow the composition instead of moving every block up.
  const assignMotion = (selector, motion) => document.querySelectorAll(selector).forEach(el => {
    el.classList.add('reveal');
    el.dataset.motion = motion;
  });
  assignMotion('.section-heading > :first-child, .about-image, .commercial-copy, .review-side, .service-story > :first-child, .service-hero-copy > .reveal, .page-heading > div, .contact-copy > .reveal, .cta > :first-child', 'left');
  assignMotion('.section-heading > :last-child:not(:first-child), .about-copy, .review-quote, .service-story > :last-child, .detail-copy, .contact-form-wrap, .page-heading > p, .cta > :last-child', 'right');
  assignMotion('.commercial-image, .detail-image, .service-hero-image', 'curtain');
  document.querySelectorAll('.service-card, .project-card, .review-card').forEach((el, index) => {
    el.dataset.motion = 'fan';
    el.style.setProperty('--enter-direction', index % 2 ? '1' : '-1');
    el.style.setProperty('--i', String(index % 3));
  });

  const reveals = document.querySelectorAll('.reveal');
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -3% 0px' }) : null;
  reveals.forEach(el => observer ? observer.observe(el) : el.classList.add('visible'));
  document.addEventListener('focusin', event => {
    const block = event.target.closest('.reveal');
    if (block) {
      block.classList.add('visible');
      observer?.unobserve(block);
    }
  });

  let scheduled = false;
  function paintScroll() {
    document.querySelector('.site-header')?.classList.toggle('scrolled', window.scrollY > 30);
    if (!reduced.matches) document.querySelectorAll('.parallax').forEach(img => {
      const box = img.parentElement.getBoundingClientRect();
      if (box.bottom > 0 && box.top < innerHeight) {
        const position = (box.top + box.height / 2 - innerHeight / 2) / innerHeight;
        img.style.transform = `scale(1.13) translateY(${position * -36}px)`;
      }
    });
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(paintScroll); }
  }, { passive: true });
  paintScroll();

  const menu = document.getElementById('mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  toggle?.addEventListener('click', () => {
    menu.showModal();
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  });
  menu?.querySelector('.close-menu').addEventListener('click', () => menu.close());
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.close()));
  menu?.addEventListener('close', () => {
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
  });

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => {
        b.classList.toggle('active', b === button);
        b.setAttribute('aria-pressed', String(b === button));
      });
      let count = 0;
      document.querySelectorAll('.gallery-grid .project-card').forEach(card => {
        const show = button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter;
        card.hidden = !show;
        if (show) { count++; card.classList.add('visible'); }
      });
      document.getElementById('gallery-count').textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
    });
  });

  const lightbox = document.getElementById('lightbox');
  let gallery = null;
  let current = 0;
  let visibleIndexes = [];
  async function showProject(index) {
    if (!gallery) {
      const response = await fetch('/previews/pride-flooring/assets/gallery.json');
      if (!response.ok) throw new Error('Gallery could not be loaded.');
      gallery = await response.json();
    }
    current = index;
    const project = gallery[index];
    const image = document.getElementById('lightbox-image');
    image.src = `/previews/pride-flooring/assets/${project.image}`;
    image.alt = project.alt;
    document.getElementById('lightbox-title').textContent = project.name;
    document.getElementById('lightbox-label').textContent = project.label;
    document.getElementById('lightbox-source').href = project.post;
    if (!lightbox.open) { lightbox.showModal(); document.body.style.overflow = 'hidden'; }
  }
  document.querySelectorAll('[data-gallery]').forEach(button => button.addEventListener('click', () => {
    visibleIndexes = [...document.querySelectorAll('[data-gallery]')]
      .filter(b => !b.closest('.project-card').hidden).map(b => Number(b.dataset.gallery));
    showProject(Number(button.dataset.gallery)).catch(() => {
      console.warn('Preview gallery could not be opened.');
    });
  }));
  function stepProject(step) {
    const next = (visibleIndexes.indexOf(current) + step + visibleIndexes.length) % visibleIndexes.length;
    showProject(visibleIndexes[next]);
  }
  lightbox?.querySelector('.close-lightbox').addEventListener('click', () => lightbox.close());
  lightbox?.querySelector('.gallery-prev').addEventListener('click', () => stepProject(-1));
  lightbox?.querySelector('.gallery-next').addEventListener('click', () => stepProject(1));
  lightbox?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); stepProject(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); stepProject(1); }
  });
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox?.addEventListener('close', () => { document.body.style.overflow = ''; });

  const reviews = [
    ['Friendly and professional service', 'lottie4866'],
    ['Great pride and care', 'highway66'],
    ['A very professional job', 'CCope']
  ];
  let review = 0;
  const reviewText = document.getElementById('review-text');
  if (reviewText) {
    reviewText.setAttribute('aria-live', 'polite');
    function changeReview(direction) {
      review = (review + direction + reviews.length) % reviews.length;
      reviewText.textContent = reviews[review][0];
      document.getElementById('review-author').textContent = reviews[review][1];
      if (!reduced.matches) reviewText.animate([
        { opacity: 0, transform: `translateX(${direction * 45}px) rotate(${direction * 1.5}deg)` },
        { opacity: 1, transform: 'translateX(0) rotate(0)' }
      ], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    document.getElementById('review-prev').addEventListener('click', () => changeReview(-1));
    document.getElementById('review-next').addEventListener('click', () => changeReview(1));
  }

  const enquiry = document.getElementById('enquiry-form');
  if (enquiry) {
    const selected = new URLSearchParams(location.search).get('service');
    const select = document.getElementById('service-select');
    if ([...select.options].some(o => o.value === selected)) select.value = selected;
    enquiry.addEventListener('submit', event => {
      event.preventDefault();
      if (!enquiry.reportValidity()) return;
      const data = new FormData(enquiry);
      const service = select.options[select.selectedIndex].text;
      const body = `Hello Pride Flooring,\n\nI’d like to discuss a flooring project.\n\nName: ${data.get('name')}\nPhone: ${data.get('phone')}\nEmail: ${data.get('email')}\nInterested in: ${service}\n\n${data.get('message')}\n\nKind regards,\n${data.get('name')}`;
      const mailto = `mailto:tony@prideflooring.co.uk?subject=${encodeURIComponent('Flooring enquiry — ' + service)}&body=${encodeURIComponent(body)}`;
      const retry = document.getElementById('email-retry');
      retry.href = mailto;
      document.getElementById('form-result').hidden = false;
      // Outbound email navigation is disabled in this portfolio preview.
    });
  }
})();
