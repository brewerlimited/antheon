(() => {
  'use strict';
  // Decorative text reacts separately from scroll-reveal transforms.
  const editorialText = [
    '.hero-content h1', '.hero-content .eyebrow', '.hero-copy', '.hero-bottom > span',
    '.section-label > span', '.intro-grid h2', '.intro-copy > p',
    '.proof-row strong', '.proof-row > div > span', '.projects-heading h2',
    '.projects-heading .eyebrow', '.gallery-intro > p', '.gallery-foot > span',
    '.process-content > h2', '.process-content > .eyebrow', '.process-lead',
    '.process-step h3', '.process-step p', '.photo-note > span',
    '.finder-intro h2', '.finder-intro > p', '.finder-note', '.finder-visual > span',
    '.quiz-step legend', '.quiz-helper', '.quiz-result h3', '.quiz-result > p',
    '.quiz-summary dd', '.reviews-heading h2', '.reviews-heading .eyebrow',
    '.reviews-heading > p', '.review-card blockquote', '.review-person h3',
    '.contact-main h2', '.contact-top > p', '.contact-top > span', '.contact-bottom > p',
    '.footer-top > p', '.footer-bottom > span'
  ].join(',');
  document.querySelectorAll(editorialText).forEach(element => {
    if (!element.closest('a, button, label, input, select, textarea, [role="button"]')) {
      element.classList.add('text-reactive');
    }
  });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reducedMotion ? 'auto' : 'smooth';
  const header = document.getElementById('header');
  const floorFinder = document.getElementById('floor-finder');
  let scrollQueued = false;
  const updateHeader = () => {
    const bounds = floorFinder.getBoundingClientRect();
    const activationLine = Math.min(window.innerHeight * .25, 160);
    header.classList.toggle('scrolled', window.scrollY > 70);
    header.classList.toggle('quiz-active', bounds.top <= activationLine && bounds.bottom > activationLine);
    scrollQueued = false;
  };
  const queueHeaderUpdate = () => {
    if (!scrollQueued) { requestAnimationFrame(updateHeader); scrollQueued = true; }
  };
  window.addEventListener('scroll', queueHeaderUpdate, {passive:true});
  window.addEventListener('resize', queueHeaderUpdate);
  if ('ResizeObserver' in window) new ResizeObserver(queueHeaderUpdate).observe(floorFinder);
  updateHeader();
  if ('IntersectionObserver' in window && !reducedMotion) {
    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold:0.08,rootMargin:'0px 0px -25px 0px'});
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const setMenu = open => {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileNav.hidden = !open;
    document.body.classList.toggle('menu-open',open);
    document.querySelector('main').inert = open;
    document.querySelector('footer').inert = open;
  };
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { setMenu(false); menuButton.focus(); } });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => {if(event.matches) setMenu(false);});
  const quoteDialog = document.getElementById('quote-dialog');
  const projectDialog = document.getElementById('project-dialog');
  const dialogs = [quoteDialog,projectDialog];
  function showDialog(dialog) { setMenu(false); dialogs.forEach(item => {if(item.open) item.close();}); dialog.showModal(); document.body.classList.add('dialog-open'); }
  dialogs.forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {if(!dialogs.some(item => item.open)) document.body.classList.remove('dialog-open');});
    dialog.addEventListener('click', event => { if(event.target === dialog) {const r = dialog.getBoundingClientRect(); if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close();} });
  });
  document.querySelectorAll('a[href^="https://wise-wendy.leadshook.io/"]:not([data-direct])').forEach(link => link.addEventListener('click', event => {
    if(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const frame = document.getElementById('quote-frame');
    const requested = new URL(link.href);
    requested.searchParams.set('embed','true');
    requested.searchParams.set('index','0');
    if(frame.dataset.activeUrl !== requested.href) {frame.src = requested.href; frame.dataset.activeUrl = requested.href;}
    document.querySelector('.quote-fallback a').href = link.href;
    showDialog(quoteDialog);
  }));
  document.querySelectorAll('a[href="#floor-finder"]').forEach(link => link.addEventListener('click', () => {
    dialogs.forEach(dialog => {if(dialog.open) dialog.close();});
    setMenu(false);
  }));
  const cards = [...document.querySelectorAll('.project-card')];
  const track = document.getElementById('project-track');
  const previous = document.getElementById('gallery-prev');
  const next = document.getElementById('gallery-next');
  function scrollGallery(direction) {const amount = cards[0].getBoundingClientRect().width + 30; track.scrollBy({left:direction*amount,behavior:scrollBehavior});}
  previous.addEventListener('click', () => scrollGallery(-1));
  next.addEventListener('click', () => scrollGallery(1));
  function updateGallery() {
    previous.disabled = track.scrollLeft < 5;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
    const x = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft);
    let nearest = 0, distance = Infinity;
    cards.forEach((card,index) => {const d = Math.abs(card.getBoundingClientRect().left - x); if(d<distance) {distance=d;nearest=index;}});
    document.getElementById('gallery-count').textContent = `${String(nearest+1).padStart(2,'0')} — 06`;
  }
  track.addEventListener('scroll',updateGallery,{passive:true});
  window.addEventListener('resize',updateGallery);
  track.addEventListener('keydown',event => {if(event.target===track && ['ArrowLeft','ArrowRight'].includes(event.key)) {event.preventDefault();scrollGallery(event.key==='ArrowRight'?1:-1);}});
  updateGallery();
  let activeProject = 0;
  function renderProject(index) {
    activeProject = (index+cards.length)%cards.length;
    const card = cards[activeProject];
    const source = card.querySelector('img');
    const image = document.getElementById('project-dialog-image');
    image.src=source.src;image.alt=source.alt;
    document.getElementById('project-dialog-title').textContent=card.querySelector('h3').textContent;
    document.getElementById('project-dialog-category').textContent=card.querySelector('.project-caption>div>span').textContent;
    document.getElementById('project-dialog-caption').textContent=card.querySelector('.project-caption>span').textContent;
    document.getElementById('project-position').textContent=`${String(activeProject+1).padStart(2,'0')} / 06`;
  }
  cards.forEach((card,index) => card.addEventListener('click', () => {renderProject(index);showDialog(projectDialog);}));
  document.getElementById('project-prev').addEventListener('click',() => renderProject(activeProject-1));
  document.getElementById('project-next').addEventListener('click',() => renderProject(activeProject+1));
  projectDialog.addEventListener('keydown',event => {if(event.key==='ArrowLeft') {event.preventDefault();renderProject(activeProject-1);}if(event.key==='ArrowRight') {event.preventDefault();renderProject(activeProject+1);}});
  document.getElementById('year').textContent = new Date().getFullYear();
})();
