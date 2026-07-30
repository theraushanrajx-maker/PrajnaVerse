// ============================================================
// PRAJNAVERSE — Interactive Engine
// 1) Dynamic Year Counter
// 2) Navigation scroll state & Mobile drawer
// 3) Canvas Ember Animation (rising motes over horizon glow)
// 4) Contact Form Submission Handler
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Navigation Logic ---------- */
  const nav = document.getElementById('pvNav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('pv-scrolled', window.scrollY > 40);
  });

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('pv-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('pv-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Ember Field Particle Canvas ---------- */
  (function initEmberField() {
    const canvas = document.getElementById('emberField');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w, h, embers;

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      const count = Math.min(60, Math.floor((w * h) / 20000));
      embers = Array.from({ length: count }, () => spawnEmber(true));
    }

    function spawnEmber(randomY) {
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : h + 10,
        vy: 0.3 + Math.random() * 0.4,
        drift: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.3,
        flicker: Math.random() * 0.02 + 0.01
      };
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const e of embers) {
        e.y -= e.vy;
        e.x += e.drift;
        e.alpha += (Math.random() - 0.5) * e.flicker;
        e.alpha = Math.max(0.15, Math.min(0.85, e.alpha));

        if (e.y < -10) Object.assign(e, spawnEmber(false));

        const gradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4);
        gradient.addColorStop(0, `rgba(240, 200, 120, ${e.alpha})`);
        gradient.addColorStop(1, 'rgba(240, 200, 120, 0)');
        
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 226, 170, ${e.alpha})`;
        ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
  })();

  /* ---------- Contact Form Handling ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const submitBtn = document.getElementById('formSubmit');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot check for spam prevention
      if (form._gotcha && form._gotcha.value) return;

      submitBtn.disabled = true;
      status.textContent = 'Sending message...';
      status.className = 'pv-form-status';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          status.textContent = 'Thank you! Your message has been sent.';
          status.className = 'pv-form-status pv-ok';
          form.reset();
        } else {
          throw new Error('Form response failed');
        }
      } catch (error) {
        status.textContent = 'Unable to send. Please email theraushanrajx@gmail.com directly.';
        status.className = 'pv-form-status pv-err';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
});
