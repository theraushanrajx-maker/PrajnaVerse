// ============================================================
// PRAJNAVERSE — site behavior
// 1) Ember field canvas in hero (rising light over sunset glow)
// 2) Nav scroll state + mobile toggle
// 3) Contact form submit handling (PHP endpoint, with a
//    Formspree fallback for static hosts like GitHub Pages)
// ============================================================

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Nav ---------- */
const nav = document.getElementById('pvNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('pv-scrolled', window.scrollY > 40);
});

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('pv-open');
  navToggle.setAttribute('aria-expanded', isOpen);
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('pv-open'));
});

/* ---------- Ember field (rising light motes over the sunset glow) ---------- */
(function emberField() {
  const canvas = document.getElementById('emberField');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, embers;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    const count = Math.min(70, Math.floor((w * h) / 18000));
    embers = Array.from({ length: count }, () => spawnEmber(true));
  }

  function spawnEmber(randomY) {
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : h + 10,
      vy: 0.25 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.8 + 0.5,
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
  draw(); // draw once even if reduced motion is on
})();

/* ---------- Contact form ---------- */
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const submitBtn = document.getElementById('formSubmit');

// If you're hosting on GitHub Pages (static only, no PHP), pick ONE of
// the two options below. Leave both blank to post to the local
// api/contact.php path (only works if PHP runs on the same host as
// the HTML, e.g. a shared PHP host — not GitHub Pages).

// Option A — your own PHP host (e.g. contact.php uploaded to
// InfinityFree/000webhost) running on a different domain than
// GitHub Pages:
const PHP_HOST_ENDPOINT = ''; // e.g. 'https://yourname.infinityfreeapp.com/contact.php'

// Option B — a form service instead of PHP:
const STATIC_HOST_ENDPOINT = ''; // e.g. 'https://formspree.io/f/your_id'

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // honeypot: if filled, silently drop (bots only)
  if (form.website.value) return;

  const endpoint = PHP_HOST_ENDPOINT || STATIC_HOST_ENDPOINT || form.action;
  submitBtn.disabled = true;
  status.textContent = 'Sending…';
  status.className = 'pv-form-status';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    });

    if (res.ok) {
      status.textContent = 'Thanks — your message is on its way.';
      status.className = 'pv-form-status pv-ok';
      form.reset();
    } else {
      throw new Error('Request failed');
    }
  } catch (err) {
    status.textContent = 'Something went wrong. Please email me directly instead.';
    status.className = 'pv-form-status pv-err';
  } finally {
    submitBtn.disabled = false;
  }
});
