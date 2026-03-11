// ─── Year ─────────────────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── Theme ────────────────────────────────────────────────────
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'dark';
root.setAttribute('data-theme', savedTheme);

const themeBtn = document.getElementById('themeToggle');
const themeIcon = themeBtn ? themeBtn.querySelector('.icon') : null;

function updateThemeIcon() {
  if (!themeIcon) return;
  const isLight = root.getAttribute('data-theme') === 'light';
  themeIcon.textContent = isLight ? '🌙' : '☀️';
}
updateThemeIcon();

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', current);
    localStorage.setItem('theme', current);
    updateThemeIcon();
  });
}

// ─── Typewriter Effect ────────────────────────────────────────
const typewriterEl = document.getElementById('typewriterText');
if (typewriterEl) {
  const words = ['Desarrollador de Software.', 'Tecnólogo Full Stack.', 'Creador de Experiencias.'];
  let wordIdx = 0, charIdx = 0, deleting = false;

  function typeWriter() {
    const current = words[wordIdx];
    if (deleting) {
      typewriterEl.textContent = current.substring(0, charIdx--);
      if (charIdx < 0) {
        deleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        setTimeout(typeWriter, 400);
        return;
      }
    } else {
      typewriterEl.textContent = current.substring(0, charIdx++);
      if (charIdx > current.length) {
        deleting = true;
        setTimeout(typeWriter, 2200);
        return;
      }
    }
    setTimeout(typeWriter, deleting ? 60 : 90);
  }
  setTimeout(typeWriter, 800);
}

// ─── Reading Progress Bar & Header Scroll ─────────────────────
const readingBar = document.getElementById('readingBar');
const header = document.querySelector('.site-header');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  // Reading bar
  if (readingBar) {
    readingBar.style.width = `${Math.min((scrollTop / docHeight) * 100, 100)}%`;
  }

  // Header floating state
  if (header) {
    if (scrollTop > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
}, { passive: true });

// ─── Cursor Glow (desktop only) ───────────────────────────────
const cursorGlow = document.querySelector('.cursor-glow');
if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
  let mx = 0, my = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  function animateCursor() {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    cursorGlow.style.left = cx + 'px';
    cursorGlow.style.top = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
} else if (cursorGlow) {
  cursorGlow.style.display = 'none';
}

// ─── Scroll Reveal ────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  }
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Stagger project cards
document.querySelectorAll('.projects').forEach(grid => {
  grid.querySelectorAll('.project').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.12}s`;
    card.classList.add('reveal');
    revealObserver.observe(card);
  });
});

// ─── Active Nav Link ──────────────────────────────────────────
const navLinks = document.querySelectorAll('.nav a[data-section]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav a[data-section="${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// ─── Smooth Scroll ────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ─── Tech Summary ─────────────────────────────────────────────
const techChips = document.querySelectorAll('.tech-grid .chip');
const techSummaryBox = document.getElementById('techSummaryBox');
const techSummaryTitle = document.getElementById('techSummaryTitle');
const techSummaryDesc = document.getElementById('techSummaryDesc');

if (techChips.length > 0 && techSummaryBox) {
  techChips.forEach(chip => {
    chip.addEventListener('click', () => {
      techChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const techName = chip.textContent.trim();
      const techDesc = chip.getAttribute('data-desc') || 'No hay descripción disponible.';
      techSummaryBox.classList.remove('hidden');
      techSummaryTitle.textContent = techName;
      techSummaryDesc.textContent = techDesc;
    });
  });
}

// ─── PWA ─────────────────────────────────────────────────────
if (typeof window !== 'undefined' && window.isSecureContext && location.protocol.startsWith('http')) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => { });
  }
}
