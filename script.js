/* ===================================================
   MS CASH FOR GOLD – MAIN SCRIPT
   =================================================== */

'use strict';

/* ── HELPERS ─────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── STICKY HEADER ───────────────────────────────── */
(function stickyHeader() {
  const header = $('#header');
  if (!header) return;

  let lastScroll = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 60);
    lastScroll = y;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── MOBILE NAV ──────────────────────────────────── */
(function mobileNav() {
  const toggle = $('#navToggle');
  const menu   = $('#navMenu');
  if (!toggle || !menu) return;

  const open  = () => { menu.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; };
  const close = () => { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };

  toggle.addEventListener('click', () => {
    toggle.getAttribute('aria-expanded') === 'true' ? close() : open();
  });

  // Close on link click
  $$('a', menu).forEach(link => link.addEventListener('click', close));

  // Close on backdrop click
  document.addEventListener('click', e => {
    if (menu.classList.contains('is-open') && !menu.contains(e.target) && !toggle.contains(e.target)) close();
  });

  // Close on Escape
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ── SCROLL REVEAL ───────────────────────────────── */
(function scrollReveal() {
  const items = $$('.reveal');
  if (!items.length || !window.IntersectionObserver) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    }),
    { threshold: 0.12 }
  );
  items.forEach(el => io.observe(el));
})();

/* ── HERO PARTICLES ──────────────────────────────── */
(function heroParticles() {
  const container = $('#particles');
  if (!container) return;

  const count = window.matchMedia('(max-width: 768px)').matches ? 14 : 28;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 3 + 1;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * -20;
    const left = Math.random() * 100;

    Object.assign(p.style, {
      width: size + 'px',
      height: size + 'px',
      left: left + '%',
      animationDuration: duration + 's',
      animationDelay: delay + 's',
      opacity: (Math.random() * 0.5 + 0.2).toString(),
    });
    container.appendChild(p);
  }
})();

/* ── HERO BACKGROUND SLIDER (video w/ graceful fallback) ── */
(function heroSlider() {
  const slider = $('#heroSlider');
  if (!slider) return;

  const videos = $$('.hero__video', slider);
  const fallbackSlides = $$('.hero__slide--fallback', slider);
  const dotsWrap = $('#heroSliderDots');
  const slideCount = Math.max(videos.length, fallbackSlides.length);
  let current = 0;
  let timer;
  let usingVideo = [];

  // Build dots
  for (let i = 0; i < slideCount; i++) {
    const dot = document.createElement('button');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Background slide ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i, true));
    dotsWrap && dotsWrap.appendChild(dot);
  }
  const dots = dotsWrap ? $$('button', dotsWrap) : [];

  // Check which videos actually loaded successfully (so we know whether to show video or gradient fallback)
  videos.forEach((v, i) => {
    usingVideo[i] = false;
    v.addEventListener('loadeddata', () => { usingVideo[i] = true; });
    v.addEventListener('error', () => { usingVideo[i] = false; });
    // Attempt to load
    v.load();
  });

  const goTo = (n, manual = false) => {
    const next = (n + slideCount) % slideCount;

    videos[current] && videos[current].classList.remove('active');
    fallbackSlides[current] && fallbackSlides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');

    current = next;

    const hasVideo = videos[current] && usingVideo[current] && videos[current].readyState >= 2;
    if (hasVideo) {
      videos[current].classList.add('active');
      videos[current].currentTime = 0;
      videos[current].play().catch(() => {});
    } else if (fallbackSlides[current]) {
      fallbackSlides[current].classList.add('active');
    }
    dots[current] && dots[current].classList.add('active');

    if (manual) resetTimer();
  };

  const resetTimer = () => {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 6000);
  };

  resetTimer();
})();

/* ── TESTIMONIALS SLIDER ─────────────────────────── */
(function testimonialsSlider() {
  const track   = $('#sliderTrack');
  const dotsWrap = $('#sliderDots');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  if (!track || !dotsWrap) return;

  const cards = $$('.testimonial-card', track);
  let current = 0;
  let timer;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const goTo = (n) => {
    cards[current].classList.remove('active');
    $$('.slider-dot', dotsWrap)[current].classList.remove('active');
    $$('.slider-dot', dotsWrap)[current].setAttribute('aria-selected', 'false');

    current = (n + cards.length) % cards.length;

    cards[current].classList.add('active');
    const activeDot = $$('.slider-dot', dotsWrap)[current];
    activeDot.classList.add('active');
    activeDot.setAttribute('aria-selected', 'true');

    resetTimer();
  };

  const resetTimer = () => {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5500);
  };

  prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch swipe
  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });

  resetTimer();
})();

/* ── FAQ ACCORDION ───────────────────────────────── */
(function faqAccordion() {
  const buttons = $$('.faq-item__q');

  buttons.forEach(btn => {
    const answer = document.getElementById(btn.getAttribute('aria-controls'));
    if (!answer) return;

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      buttons.forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const a = document.getElementById(b.getAttribute('aria-controls'));
        if (a) { a.hidden = true; a.style.maxHeight = null; }
      });

      // Open clicked if it was closed
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
})();

/* ── CONTACT FORM ────────────────────────────────── */
(function contactForm() {
  const form   = $('#contactForm');
  if (!form) return;

  const nameEl  = $('#cf-name');
  const phoneEl = $('#cf-phone');
  const emailEl = $('#cf-email');
  const serviceEl = $('#cf-service');
  const messageEl = $('#cf-message');
  const submitBtn = $('#cfSubmit');
  const btnText = $('#cfBtnText');
  const btnLoader = $('#cfBtnLoader');

  const showError = (el, id, msg) => {
    el.classList.add('error');
    const errEl = document.getElementById(id);
    if (errEl) errEl.textContent = msg;
  };

  const clearError = (el, id) => {
    el.classList.remove('error');
    const errEl = document.getElementById(id);
    if (errEl) errEl.textContent = '';
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    let valid = true;

    clearError(nameEl, 'err-name');
    clearError(phoneEl, 'err-phone');

    if (!nameEl.value.trim() || nameEl.value.trim().length < 2) {
      showError(nameEl, 'err-name', 'Please enter your full name.');
      valid = false;
    }

    const phone = phoneEl.value.replace(/\s+/g, '');
    if (!phone || !/^[+]?[\d\-]{8,15}$/.test(phone)) {
      showError(phoneEl, 'err-phone', 'Please enter a valid phone number.');
      valid = false;
    }

    if (!valid) return;

    // Disable button and show loader
    submitBtn.disabled = true;
    btnText.hidden = true;
    btnLoader.hidden = false;

    // Construct WhatsApp message
    const name = nameEl.value.trim();
    const phoneNum = phoneEl.value.trim();
    const email = emailEl.value.trim();
    const service = serviceEl.options[serviceEl.selectedIndex].text;
    const message = messageEl.value.trim();

    let waMessage = `Hello! I'd like to make an enquiry.\n\n*Name:* ${name}\n*Phone:* ${phone}`;
    if (email) waMessage += `\n*Email:* ${email}`;
    if (serviceEl.value) waMessage += `\n*Interested In:* ${service}`;
    if (message) waMessage += `\n\n*Message:*\n${message}`;

    const whatsappUrl = `https://wa.me/917845857880?text=${encodeURIComponent(waMessage.replace('*Phone*', `*Phone:* ${phoneNum}`))}`;

    // Redirect to WhatsApp after a short delay
    setTimeout(() => {
      window.location.href = whatsappUrl;
    }
    , 500);
  });
})();

/* ── SCROLL TO TOP ───────────────────────────────── */
(function scrollToTop() {
  const btn = $('#scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.hidden = window.scrollY < 500;
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ── COPYRIGHT YEAR ──────────────────────────────── */
(function year() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ── IMAGE LAZY LOADING ──────────────────────────── */
(function lazyImages() {
  if (!('loading' in HTMLImageElement.prototype)) {
    const imgs = $$('img[loading="lazy"]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          io.unobserve(img);
        }
      });
    });
    imgs.forEach(img => io.observe(img));
  }
})();

/* ── ACTIVE NAV LINK HIGHLIGHT ───────────────────── */
(function activeNav() {
  const sections = $$('section[id]');
  const links = $$('.nav__link[href^="#"]');
  if (!sections.length || !links.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = links.find(l => l.getAttribute('href') === '#' + entry.target.id);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35, rootMargin: '-80px 0px -30% 0px' });

  sections.forEach(s => io.observe(s));
})();

/* ── SMOOTH ANCHOR OFFSET ────────────────────────── */
(function smoothAnchor() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : document.documentElement;
      if (!target) return;
      e.preventDefault();
      const headerH = document.getElementById('header')?.offsetHeight || 80;
      const y = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();
