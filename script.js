const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);
const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', current);
    localStorage.setItem('theme', current);
  });
}

const observer = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add('visible');
  }
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const downloadCV = document.getElementById('downloadCV');
if (downloadCV) {
  downloadCV.addEventListener('click', e => {
    e.preventDefault();
    const url = 'cv.pdf';
    fetch(url, { method: 'HEAD' })
      .then(r => {
        if (r.ok) window.location.href = url;
        else alert('Añade tu archivo cv.pdf en la raíz del proyecto.');
      })
      .catch(() => alert('Añade tu archivo cv.pdf en la raíz del proyecto.'));
  });
}

if (typeof window !== 'undefined' && window.isSecureContext && location.protocol.startsWith('http')) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

const chips = Array.from(document.querySelectorAll('.chip[data-filter]'));
const projects = Array.from(document.querySelectorAll('.project'));
const resultsCountEl = document.getElementById('resultsCount');
const clearBtn = document.getElementById('clearFilters');
if (resultsCountEl) resultsCountEl.textContent = `${projects.length} proyecto${projects.length === 1 ? '' : 's'}`;
// Mostrar estado vacío si no hay proyectos iniciales
if (projects.length === 0) {
  const empty = document.querySelector('.projects-empty');
  if (empty) empty.style.display = 'block';
  if (resultsCountEl) resultsCountEl.textContent = '0 proyectos';
}
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    const active = chip.classList.toggle('active');
    const activeFilters = chips.filter(c => c.classList.contains('active')).map(c => c.dataset.filter?.toLowerCase());
    if (!activeFilters.length) {
      projects.forEach(p => p.style.display = '');
      const empty = document.querySelector('.projects-empty');
      const visible = projects.length;
      if (empty) empty.style.display = visible ? 'none' : 'block';
      if (resultsCountEl) resultsCountEl.textContent = `${visible} proyecto${visible === 1 ? '' : 's'}`;
      return;
    }
    projects.forEach(p => {
      const tags = Array.from(p.querySelectorAll('.tag')).map(t => t.textContent?.toLowerCase());
      const show = activeFilters.every(f => tags.includes(f));
      p.style.display = show ? '' : 'none';
    });
    const visible = projects.filter(p => p.style.display !== 'none').length;
    const empty = document.querySelector('.projects-empty');
    if (empty) empty.style.display = visible ? 'none' : 'block';
    if (resultsCountEl) resultsCountEl.textContent = `${visible} proyecto${visible === 1 ? '' : 's'}`;
  });
});

if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    projects.forEach(p => p.style.display = '');
    const empty = document.querySelector('.projects-empty');
    const visible = projects.length;
    if (empty) empty.style.display = visible ? 'none' : 'block';
    if (resultsCountEl) resultsCountEl.textContent = `${visible} proyecto${visible === 1 ? '' : 's'}`;
  });
}

document.querySelectorAll('.projects-empty .btn-clear').forEach(btn => {
  btn.addEventListener('click', () => clearBtn?.click());
});

document.querySelectorAll('.project.card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -4;
    const ry = ((x / rect.width) - 0.5) * 4;
    card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

document.querySelectorAll('.about-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -3;
    const ry = ((x / rect.width) - 0.5) * 3;
    card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

const cvAbout = document.getElementById('downloadCVAbout');
if (cvAbout) cvAbout.addEventListener('click', (e) => {
  e.preventDefault();
  const url = 'cv.pdf';
  fetch(url, { method: 'HEAD' }).then(r => {
    if (r.ok) window.location.href = url;
    else alert('Añade tu archivo cv.pdf en la raíz del proyecto.');
  }).catch(() => alert('Añade tu archivo cv.pdf en la raíz del proyecto.'));
});

const copyBtns = document.querySelectorAll('.mini-btn[data-copy]');
copyBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy || '';
    try {
      await navigator.clipboard.writeText(text);
      const prev = btn.textContent;
      btn.textContent = 'Copiado';
      setTimeout(() => btn.textContent = prev, 1200);
    } catch {}
  });
});

const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('cf-name')?.value?.trim() || '';
    const subject = document.getElementById('cf-subject')?.value?.trim() || 'Nuevo contacto';
    const message = document.getElementById('cf-message')?.value?.trim() || '';
    const mailto = 'mailto:leobaquero456@gmail.com?subject=' + encodeURIComponent('[Portafolio] ' + subject) + '&body=' + encodeURIComponent('Hola Alvaro,\n\nSoy ' + name + '.\n\n' + message + '\n\nGracias.');
    window.location.href = mailto;
  });
}

const whatsPrefill = document.getElementById('whatsPrefill');
if (whatsPrefill) {
  whatsPrefill.addEventListener('click', () => {
    const name = document.getElementById('cf-name')?.value?.trim() || '';
    const message = document.getElementById('cf-message')?.value?.trim() || '';
    const text = encodeURIComponent('Hola Alvaro, soy ' + name + '. ' + message);
    whatsPrefill.setAttribute('href', 'https://wa.me/573107547938?text=' + text);
  });
}
