(() => {
  'use strict';
  const form = document.getElementById('floor-quiz');
  if (!form) return;
  const steps = [...form.querySelectorAll('[data-step]')];
  const back = document.getElementById('quiz-back');
  const next = document.getElementById('quiz-next');
  const reset = document.getElementById('quiz-reset');
  const error = document.getElementById('quiz-error');
  const note = document.getElementById('quiz-selection-note');
  const booking = document.getElementById('quiz-book');
  const inspiration = document.getElementById('quiz-inspiration');
  const progress = document.querySelector('.quiz-progress');
  let current = 0;
  const flooring = () => [...form.querySelectorAll('input[name="flooring"]:checked')].map(input => input.value);
  const timing = () => form.querySelector('input[name="timeframe"]:checked')?.value || '';
  const displayFloor = value => value === 'Sub-Floor Preperations' ? 'Subfloor preparation' : value;
  function updateSelection() {
    const n = flooring().length;
    note.textContent = current === 0 ? (n ? `${n} option${n === 1 ? '' : 's'} selected` : 'Select one or more options') : 'You can change this later';
    error.textContent = '';
  }
  function renderResult() {
    document.getElementById('quiz-summary-floor').textContent = flooring().map(displayFloor).join(' · ');
    document.getElementById('quiz-summary-timing').textContent = timing();
    const browsing = timing() === 'Just exploring options for now';
    document.getElementById('quiz-result-title').innerHTML = browsing ? 'Good things start<br>with an idea.' : 'Your floor.<br>Your next chapter.';
    document.getElementById('quiz-result-copy').textContent = browsing ? 'Take your time. Explore our installations and come back when your plans start to take shape.' : 'Here’s a starting point for a conversation with our team.';
    document.getElementById('quiz-next-note').textContent = browsing ? 'When you’re ready, choose an installation timeframe to continue with a free measure and quote.' : 'Continue to our booking form to confirm your choices and add your contact details. Your enquiry is only sent when you submit that form.';
    booking.hidden = browsing;
    inspiration.hidden = !browsing;
    const url = new URL('https://wise-wendy.leadshook.io/s/rDQItm2CAYjzUBrZOWJ78SYjNZJy9Vl56VHc8yJ7');
    url.searchParams.set('flooring_type', flooring().join(', '));
    url.searchParams.set('timeframe1', timing());
    booking.href = url.href;
  }
  function goToStep(index, focus = true) {
    current = index;
    if (current === 2) renderResult();
    steps.forEach((step, i) => { step.hidden = i !== current; });
    back.hidden = current === 0;
    next.hidden = current === 2;
    reset.hidden = current !== 2;
    note.hidden = current === 2;
    document.getElementById('quiz-step-label').textContent = ['01 / YOUR FLOOR', '02 / YOUR TIMING', '03 / YOUR NEXT STEP'][current];
    document.getElementById('quiz-step-count').textContent = `STEP ${current + 1} OF 3`;
    document.getElementById('quiz-progress-bar').style.width = `${(current + 1) / 3 * 100}%`;
    progress.setAttribute('aria-valuenow', String(current + 1));
    next.innerHTML = current === 1 ? 'See my next step <span aria-hidden="true">→</span>' : 'Continue <span aria-hidden="true">→</span>';
    updateSelection();
    if (focus) {
      const heading = steps[current].querySelector('legend, h3');
      heading.focus({preventScroll:true});
      const panel = document.querySelector('.quiz-panel');
      const top = panel.getBoundingClientRect().top;
      if (top < 16 || top > innerHeight - 180) window.scrollTo({top:Math.max(0,window.scrollY+top-16),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    }
  }
  form.addEventListener('change', updateSelection);
  next.addEventListener('click', event => {
    event.preventDefault();
    if (current === 0 && !flooring().length) {
      error.textContent = 'Choose at least one flooring option to continue.';
      form.querySelector('input[name="flooring"]').focus({preventScroll:true});
      return;
    }
    if (current === 1 && !timing()) {
      error.textContent = 'Choose a timeframe to continue.';
      form.querySelector('input[name="timeframe"]').focus({preventScroll:true});
      return;
    }
    if (current < 2) goToStep(current + 1);
  });
  back.addEventListener('click', () => goToStep(Math.max(0,current-1)));
  reset.addEventListener('click', () => {form.reset(); goToStep(0);});
  goToStep(0,false);
})();
