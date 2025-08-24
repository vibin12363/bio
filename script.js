/* ====== Helpers ====== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ====== Mobile Nav Toggle ====== */
const navToggle = $('#navToggle');
const primaryNav = $('#primaryNav');
navToggle?.addEventListener('click', () => {
  const open = primaryNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
$$('.nav a').forEach(a => a.addEventListener('click', () => {
  primaryNav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}));

/* ====== Tabs (About) ====== */
const tabBtns = $$('.tab-btn');
const panels = $$('.tab-panel');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById(btn.dataset.tab);
    panel?.classList.add('active');
  });
});

/* ====== Counters on View ====== */
const counters = $$('.counter .value');
if (counters.length) {
  const animateCount = (el) => {
    const target = +el.dataset.count || 0;
    const dur = 1200; // ms
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor(p * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCount(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => io.observe(c));
}

/* ====== Testimonials Slider (auto every 3s + dots) ====== */
const slider = $('#testimonialSlider');
if (slider) {
  const slides = $$('.slide', slider);
  const dotsWrap = $('#sliderDots');
  let index = 0;
  let timer;

  // build dots
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.addEventListener('click', () => go(i, true));
    dotsWrap.appendChild(b);
  });

  const dots = $$('button', dotsWrap);

  const show = (i) => {
    slides.forEach(s => s.classList.remove('is-active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[i].classList.add('is-active');
    dots[i].classList.add('active');
  };

  const next = () => go((index + 1) % slides.length);
  const go = (i, pause = false) => {
    index = i;
    show(index);
    if (pause) restart();
  };

  const start = () => { timer = setInterval(next, 3000); };
  const stop  = () => { clearInterval(timer); };
  const restart = () => { stop(); start(); };

  // init
  show(index);
  start();

  // pause on hover (optional nice touch)
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
}

/* ====== Formspree (AJAX) ====== */
const form = $('#contactForm');
if (form) {
  const statusEl = $('#formStatus');
  const setError = (name, msg) => {
    const small = $(`small.error[data-for="${name}"]`, form);
    if (small) small.textContent = msg || '';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // simple validation
    let ok = true;
    const fields = ['name','email','subject','message'];
    fields.forEach(f => setError(f, ''));
    const emailVal = $('#email').value.trim();
    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setError('email', 'Please enter a valid email.');
      ok = false;
    }
    fields.forEach(f => {
      const v = $(`#${f}`).value.trim();
      if (!v) { setError(f, 'This field is required.'); ok = false; }
    });
    if (!ok) return;

    statusEl.textContent = 'Sending…';

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.reset();
        statusEl.textContent = 'Thanks! Your message has been sent.';
      } else {
        const json = await res.json().catch(() => ({}));
        const msg = (json && json.error) || 'There was a problem sending your message.';
        statusEl.textContent = msg;
      }
    } catch {
      statusEl.textContent = 'Network error. Please try again.';
    }
  });
}

/* ====== Footer year ====== */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
