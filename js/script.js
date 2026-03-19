/* =============================================
   PORTFOLIO JS — Ahmed Tamer
   ============================================= */
(function () {
  'use strict';

  /* ---- DOM helpers ---- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* =============================================
     NAVBAR — scroll state & active link
     ============================================= */
  const navbar   = $('#navbar');
  const navLinks = $$('.nav-links a');

  function updateNavbar() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Highlight active section link
    const sections = $$('section[id]');
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.id;
      }
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* =============================================
     HAMBURGER / MOBILE MENU
     ============================================= */
  const hamburger = $('#hamburger');
  const navMenu   = $('#nav-links');

  hamburger.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  navMenu.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* =============================================
     TYPING ANIMATION
     ============================================= */
  const roles = [
    'Web Developer',
    'UI/UX Designer',
    'Frontend Engineer',
    'Creative Coder',
  ];

  const typedEl = $('#typed-text');
  let roleIdx   = 0;
  let charIdx   = 0;
  let deleting  = false;
  let pauseMs   = 1800;

  function type() {
    const current = roles[roleIdx];

    if (!deleting) {
      charIdx++;
      typedEl.textContent = current.slice(0, charIdx);

      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, pauseMs);
        return;
      }
    } else {
      charIdx--;
      typedEl.textContent = current.slice(0, charIdx);

      if (charIdx === 0) {
        deleting = false;
        roleIdx  = (roleIdx + 1) % roles.length;
      }
    }

    const speed = deleting ? 60 : 100;
    setTimeout(type, speed);
  }

  type();

  /* =============================================
     SCROLL-REVEAL
     ============================================= */
  const revealEls = $$('.reveal');

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  /* =============================================
     SKILL BARS — animate when visible
     ============================================= */
  const barFills = $$('.bar-fill');

  const barObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          fill.style.width = fill.dataset.width + '%';
          barObserver.unobserve(fill);
        }
      });
    },
    { threshold: 0.3 }
  );

  barFills.forEach(fill => barObserver.observe(fill));

  /* =============================================
     PROJECT FILTER
     ============================================= */
  const filterBtns    = $$('.filter-btn');
  const projectCards  = $$('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projectCards.forEach(card => {
        const match =
          filter === 'all' ||
          card.dataset.category === filter;

        card.style.display = match ? '' : 'none';
      });
    });
  });

  /* =============================================
     CONTACT FORM — client-side feedback
     ============================================= */
  const form     = $('#contact-form');
  const formNote = $('#form-note');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const name    = $('#name').value.trim();
      const email   = $('#email').value.trim();
      const message = $('#message').value.trim();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      formNote.className = 'form-note';
      formNote.textContent = '';

      if (!name || !email || !message) {
        formNote.textContent = 'Please fill in all required fields.';
        formNote.classList.add('error');
        return;
      }

      if (!emailRe.test(email)) {
        formNote.textContent = 'Please enter a valid email address.';
        formNote.classList.add('error');
        return;
      }

      // Simulate async send (replace with real backend/EmailJS/Formspree)
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Sending…';

      setTimeout(() => {
        form.reset();
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Send Message';
        formNote.textContent = `✓ Message sent! I'll get back to you soon.`;
        formNote.classList.add('success');
      }, 1200);
    });
  }

  /* =============================================
     SCROLL-TO-TOP BUTTON
     ============================================= */
  const scrollTopBtn = $('#scroll-top');

  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* =============================================
     FOOTER YEAR
     ============================================= */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
