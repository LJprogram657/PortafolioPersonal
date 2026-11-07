/**
 * ============================================================================
 * PORTAFOLIO PROFESIONAL - ALVARO LEONARDO BAQUERO MALAGON
 * Core JavaScript: Interacciones Avanzadas, Canvas, Terminal CLI, Modales
 * ============================================================================
 */

// Clear any stale caches from previous versions
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then(keys => {
    keys.forEach(key => {
      if (key !== 'v3.1.0') caches.delete(key);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Audio System (Web Audio API sintetizado) ---
  let audioEnabled = false;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq = 600, type = 'sine', duration = 0.06, gainLevel = 0.05) {
    if (!audioEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainLevel, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {}
  }

  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioIcon = document.getElementById('audioIcon');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      if (audioEnabled) {
        initAudio();
        audioIcon.textContent = '🔊';
        showToast('Efectos de sonido activados');
        playTone(750, 'triangle', 0.1, 0.08);
      } else {
        audioIcon.textContent = '🔈';
        showToast('Efectos de sonido desactivados');
      }
    });
  }

  // Helper para sonidos en botones
  function clickSfx() {
    if (audioEnabled) playTone(520, 'sine', 0.05, 0.04);
  }

  // --- 2. Toast Notification System ---
  const toastContainer = document.getElementById('toastContainer');
  function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('active'));

    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }

  // --- 3. Dynamic Reading Progress Bar & Sticky Header ---
  const progressBar = document.getElementById('scrollProgressBar');
  const siteHeader = document.getElementById('siteHeader');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / (totalHeight || 1)) * 100;
    if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;

    if (siteHeader) {
      if (window.scrollY > 40) siteHeader.classList.add('scrolled');
      else siteHeader.classList.remove('scrolled');
    }
  }, { passive: true });

  // --- 4. Interactive Constellation Canvas ---
  const canvas = document.getElementById('bgCanvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(Math.floor((width * height) / 18000), 70);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 0.8,
      });
    }

    let mouse = { x: -1000, y: -1000 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    function renderCanvas() {
      ctx.clearRect(0, 0, width, height);

      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const pColor = isLight ? 'rgba(79, 70, 229, 0.35)' : 'rgba(129, 140, 248, 0.45)';
      const lColor = isLight ? 'rgba(79, 70, 229, ' : 'rgba(6, 182, 212, ';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          p.x += (dx / dist) * 1.5;
          p.y += (dy / dist) * 1.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = pColor;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d2 < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${lColor}${(1 - d2 / 120) * 0.22})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(renderCanvas);
    }
    renderCanvas();
  }

  // --- 5. Theme Toggle (Dark / Light) ---
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const root = document.documentElement;

  const currentSavedTheme = localStorage.getItem('portfolio_theme') || 'dark';
  root.setAttribute('data-theme', currentSavedTheme);
  if (themeIcon) themeIcon.textContent = currentSavedTheme === 'light' ? '☀️' : '🌙';

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      clickSfx();
      const current = root.getAttribute('data-theme');
      const nextTheme = current === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', nextTheme);
      localStorage.setItem('portfolio_theme', nextTheme);
      if (themeIcon) themeIcon.textContent = nextTheme === 'light' ? '☀️' : '🌙';
      showToast(`Tema cambiado a ${nextTheme === 'light' ? 'Claro' : 'Oscuro'}`);
    });
  }

  // --- 6. Real-Time Colombia Clock (GMT-5) ---
  const colombiaTimeEl = document.getElementById('colombiaTime');
  const sideClockTimeEl = document.getElementById('sideClockTime');

  function updateColombiaClock() {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const parts = formatter.formatToParts(now);
      const h = parts.find(p => p.type === 'hour')?.value || '12';
      const m = parts.find(p => p.type === 'minute')?.value || '00';
      const s = parts.find(p => p.type === 'second')?.value || '00';
      const dp = parts.find(p => p.type === 'dayPeriod')?.value?.toUpperCase() || 'AM';

      if (colombiaTimeEl) colombiaTimeEl.textContent = `${h}:${m} ${dp}`;
      if (sideClockTimeEl) sideClockTimeEl.textContent = `${h}:${m}:${s} ${dp}`;
    } catch {
      if (colombiaTimeEl) colombiaTimeEl.textContent = '12:00 PM';
    }
  }
  updateColombiaClock();
  setInterval(updateColombiaClock, 1000);

  // --- 7. Hero Typewriter Effect ---
  const typingTextEl = document.getElementById('typingText');
  if (typingTextEl) {
    const roles = [
      'Ingeniero de Software & Full Stack',
      'Especialista en Python & Django',
      'Desarrollador Web Moderno (Next.js & React)',
      'Arquitecto de APIs & Microservicios',
      'Comprometido con Alto Rendimiento & UX'
    ];
    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingSpeed = 70;

    function typeLoop() {
      const currentRole = roles[roleIdx];
      if (isDeleting) {
        typingTextEl.textContent = currentRole.substring(0, charIdx - 1);
        charIdx--;
        typingSpeed = 35;
      } else {
        typingTextEl.textContent = currentRole.substring(0, charIdx + 1);
        charIdx++;
        typingSpeed = 75;
      }

      if (!isDeleting && charIdx === currentRole.length) {
        typingSpeed = 2200; // Pause at end of text
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        typingSpeed = 400; // Pause before new word
      }

      setTimeout(typeLoop, typingSpeed);
    }
    typeLoop();
  }

  // --- 8. Hero IDE Tabs & Simulated Run ---
  const ideTabs = document.querySelectorAll('.ide-tab');
  const idePanes = document.querySelectorAll('.ide-tab-pane');
  const runCodeBtn = document.getElementById('runCodeBtn');
  const ideConsole = document.getElementById('ideConsole');

  ideTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      clickSfx();
      const target = tab.dataset.tab;
      ideTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      idePanes.forEach(pane => {
        pane.style.display = pane.dataset.pane === target ? 'block' : 'none';
      });
    });
  });

  if (runCodeBtn && ideConsole) {
    runCodeBtn.addEventListener('click', () => {
      clickSfx();
      if (audioEnabled) playTone(880, 'triangle', 0.15, 0.08);
      runCodeBtn.textContent = '⏳ Compilando...';
      ideConsole.style.display = 'none';

      setTimeout(() => {
        runCodeBtn.textContent = '✓ Ejecutado';
        ideConsole.style.display = 'block';
        showToast('Código compilado y ejecutado con éxito');
        setTimeout(() => (runCodeBtn.textContent = '▶ Run'), 2500);
      }, 550);
    });
  }

  // --- 9. Spotlight Mouse Coordinate Tracker ---
  const cards = document.querySelectorAll('.card-glass');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // --- 10. Project Filtering & Live Search ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const searchInput = document.getElementById('projectSearchInput');
  const resultsCount = document.getElementById('resultsCount');
  const projectsEmpty = document.getElementById('projectsEmpty');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');

  let activeCategory = 'all';
  let searchQuery = '';

  function applyFilters() {
    let visibleCount = 0;
    projectCards.forEach(card => {
      const cardCategory = card.dataset.category || '';
      const cardTech = (card.dataset.tech || '').toLowerCase();
      const title = card.querySelector('.project-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.project-desc')?.textContent.toLowerCase() || '';

      const matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;
      const matchesSearch = !searchQuery || 
        title.includes(searchQuery) || 
        desc.includes(searchQuery) || 
        cardTech.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (resultsCount) {
      resultsCount.textContent = `${visibleCount} proyecto${visibleCount === 1 ? '' : 's'}`;
    }

    if (projectsEmpty) {
      projectsEmpty.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      clickSfx();
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter || 'all';
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      clickSfx();
      activeCategory = 'all';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
      applyFilters();
    });
  }

  // Tech tags click to search
  document.querySelectorAll('.tech-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      clickSfx();
      const tech = tag.textContent.trim().toLowerCase();
      if (searchInput) {
        searchInput.value = tech;
        searchQuery = tech;
        applyFilters();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast(`Filtrando por: ${tag.textContent}`);
      }
    });
  });

  // --- 11. Interactive Developer Terminal CLI ---
  const terminalInput = document.getElementById('terminalInput');
  const terminalOutput = document.getElementById('terminalOutput');
  const terminalToggleBtn = document.getElementById('terminalToggleBtn');
  const quickCmdBtns = document.querySelectorAll('.quick-cmd-btn');

  const cliCommands = {
    help: () => `
<span class="term-res-accent">COMANDOS DISPONIBLES:</span><br/>
• <span class="term-res-highlight">about</span>      : Información personal y perfil profesional<br/>
• <span class="term-res-highlight">skills</span>     : Resumen del stack y competencias<br/>
• <span class="term-res-highlight">projects</span>   : Listado de proyectos destacados<br/>
• <span class="term-res-highlight">experience</span> : Trayectoria en sector público e industria<br/>
• <span class="term-res-highlight">contact</span>    : Enlaces y canales directos<br/>
• <span class="term-res-highlight">cv</span>         : Abre el Currículum Vitae interactivo<br/>
• <span class="term-res-highlight">theme</span>      : Alternar modo claro / oscuro<br/>
• <span class="term-res-highlight">time</span>       : Hora actual de Colombia (GMT-5)<br/>
• <span class="term-res-highlight">clear</span>      : Limpia el historial de la consola
`,
    about: () => `
<span class="term-res-accent">Alvaro Leonardo Baquero Malagon</span> (20 años)<br/>
• Formación: Tecnólogo en Desarrollo de Software (Graduado) + Ingeniería en curso.<br/>
• Ubicación: Acacías / Meta, Colombia.<br/>
• Enfoque: Arquitectura backend sólida, Next.js, APIs de alto rendimiento y seguridad.
`,
    skills: () => `
<span class="term-res-accent">ARSENAL TÉCNICO:</span><br/>
• Frontend  : Next.js 14, React, TypeScript, Tailwind CSS, JavaScript ES6+ [████████░░ 85%]<br/>
• Backend   : Python, Django REST, FastAPI, Node.js [█████████░ 90%]<br/>
• Database  : PostgreSQL, MySQL, Redis, Firebase [████████░░ 82%]<br/>
• Plataformas: Moodle LMS (Gestión & Administración) [████████░░ 85%]<br/>
• DevOps    : Docker, Git, GitHub Actions (CI/CD), Linux, Vercel [████████░░ 80%]
`,
    projects: () => `
<span class="term-res-accent">PROYECTOS:</span><br/>
1. <span class="term-res-highlight">LCG Deportivos</span> (Next.js, React, TypeScript, Vercel) → <span style="color:#10b981;">[EN PRODUCCIÓN]</span><br/>
2. <span class="term-res-highlight">Proyectos en Desarrollo</span> (Backend APIs, Web App, Moodle LMS) → <span style="color:#f59e0b;">[EN CONSTRUCCIÓN]</span>
`,
    experience: () => `
<span class="term-res-accent">EXPERIENCIA LABORAL:</span><br/>
• <span class="term-res-highlight">Alcaldía de Acacías, Meta</span> (2025–Presente): Desarrollador de Software.<br/>
  Plataformas institucionales, bases de datos PostgreSQL y seguridad informática.<br/>
• <span class="term-res-highlight">Desarrollador Full Stack Freelance</span> (2023–2024):<br/>
  Creación de aplicaciones web modernas, PWAs y APIs a medida.
`,
    contact: () => `
<span class="term-res-accent">CANALES DIRECTOS:</span><br/>
• Email: leobaquero456@gmail.com<br/>
• WhatsApp: +57 310 754 7938<br/>
• GitHub: https://github.com/LJprogram657<br/>
• LinkedIn: https://www.linkedin.com/in/leonardo-baquero-a48486290/
`,
    cv: () => {
      openCvModal();
      return '<span class="term-res-accent">✓ Abriendo Currículum Vitae...</span>';
    },
    theme: () => {
      themeToggleBtn?.click();
      return '<span class="term-res-accent">✓ Tema alternado correctamente.</span>';
    },
    time: () => {
      const now = new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' });
      return `<span class="term-res-accent">Hora local oficial de Colombia (GMT-5): ${now}</span>`;
    },
    clear: () => {
      if (terminalOutput) terminalOutput.innerHTML = '';
      return '';
    },
    matrix: () => `
<span style="color:#10b981;">01001100 01100101 01101111 01101110 01100001 01110010 01100100 01101111</span><br/>
<span style="color:#06b6d4;">¡Has desbloqueado el easter egg! La arquitectura limpia es el verdadero superpoder.</span>
`
  };

  function executeCliCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    if (terminalOutput) {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      line.innerHTML = `<span class="term-prompt">leonardo@dev:~$ </span><span class="term-cmd">${rawCmd}</span>`;
      terminalOutput.appendChild(line);

      if (cliCommands[cmd]) {
        const response = cliCommands[cmd]();
        if (response) {
          const resLine = document.createElement('div');
          resLine.className = 'terminal-line term-res';
          resLine.innerHTML = response;
          terminalOutput.appendChild(resLine);
        }
      } else {
        const errLine = document.createElement('div');
        errLine.className = 'terminal-line term-res';
        errLine.innerHTML = `Comando no reconocido: '${rawCmd}'. Escribe <span class="term-res-highlight">'help'</span> para ver la lista de comandos.`;
        terminalOutput.appendChild(errLine);
      }
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    if (audioEnabled) playTone(700, 'square', 0.04, 0.03);
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = terminalInput.value;
        terminalInput.value = '';
        executeCliCommand(val);
      }
    });
  }

  quickCmdBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd || '';
      executeCliCommand(cmd);
    });
  });

  if (terminalToggleBtn) {
    terminalToggleBtn.addEventListener('click', () => {
      clickSfx();
      const termSec = document.getElementById('terminal');
      if (termSec) {
        termSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => terminalInput?.focus(), 400);
      }
    });
  }

  // --- 12. Project Technical Details Modal ---
  const projectModal = document.getElementById('projectModal');
  const closeProjModalBtn = document.getElementById('closeProjModalBtn');
  const modalProjectName = document.getElementById('modalProjectName');
  const modalProjectCategory = document.getElementById('modalProjectCategory');
  const modalProjectContent = document.getElementById('modalProjectContent');

  const projectDetailsData = {
    lcg: {
      title: 'LCG Deportivos — Plataforma de Torneos en Tiempo Real',
      category: 'Full Stack / Next.js',
      content: `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <p><strong>Descripción:</strong> Plataforma integral de gestión de torneos de fútbol en Colombia con actualización dinámica de tablas, fixtures, plantillas y marcadores en vivo.</p>
          <div style="background:var(--bg-main); padding:16px; border-radius:10px; border:1px solid var(--border);">
            <h4 style="margin-bottom:8px; color:var(--accent-cyan);">Aspectos de Ingeniería Destacados:</h4>
            <ul style="padding-left:20px; line-height:1.7; color:var(--text-muted);">
              <li>Renderizado híbrido (SSR + SSG) con Next.js 14 para indexación SEO impecable y carga ultrarrápida.</li>
              <li>Tipado estricto con TypeScript para evitar errores de modelo en clasificaciones complejas de torneos.</li>
              <li>Diseño modular con Tailwind CSS adaptado a dispositivos móviles para árbitros en campo.</li>
              <li>Puntaje de 98+ en métricas Core Web Vitals y optimización de imágenes responsivas.</li>
            </ul>
          </div>
          <div style="display:flex; gap:10px; margin-top:10px;">
            <a href="https://www.lcgdeportivos.org/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Abrir Web del Proyecto</a>
            <a href="https://github.com/LJprogram657" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">GitHub</a>
          </div>
        </div>
      `
    }
  };

  document.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', () => {
      clickSfx();
      const projKey = btn.dataset.project;
      const data = projectDetailsData[projKey];
      if (data && projectModal) {
        if (modalProjectName) modalProjectName.textContent = data.title;
        if (modalProjectCategory) modalProjectCategory.textContent = data.category;
        if (modalProjectContent) modalProjectContent.innerHTML = data.content;
        projectModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (closeProjModalBtn && projectModal) {
    closeProjModalBtn.addEventListener('click', () => {
      clickSfx();
      projectModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // --- 13. Interactive CV Modal & Printing ---
  const cvModal = document.getElementById('cvModal');
  const openCvBtn = document.getElementById('openCvBtn');
  const heroCvBtn = document.getElementById('heroCvBtn');
  const aboutOpenCvBtn = document.getElementById('aboutOpenCvBtn');
  const closeCvModalBtn = document.getElementById('closeCvModalBtn');
  const printCvBtn = document.getElementById('printCvBtn');

  function openCvModal() {
    clickSfx();
    if (cvModal) {
      cvModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCvModal() {
    clickSfx();
    if (cvModal) {
      cvModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (openCvBtn) openCvBtn.addEventListener('click', openCvModal);
  if (heroCvBtn) heroCvBtn.addEventListener('click', openCvModal);
  if (aboutOpenCvBtn) aboutOpenCvBtn.addEventListener('click', openCvModal);
  if (closeCvModalBtn) closeCvModalBtn.addEventListener('click', closeCvModal);

  // Close modals on clicking overlay background
  [cvModal, projectModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  });

  // Close modals on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (cvModal) cvModal.classList.remove('active');
      if (projectModal) projectModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  if (printCvBtn) {
    printCvBtn.addEventListener('click', () => {
      clickSfx();
      window.print();
    });
  }

  // --- 14. Clipboard Copy with Toast Feedback ---
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      clickSfx();
      const textToCopy = btn.dataset.copy || '';
      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalText = btn.textContent;
        btn.textContent = '✓ Copiado';
        showToast(`Copiado al portapapeles: ${textToCopy}`);
        setTimeout(() => (btn.textContent = originalText), 1800);
      } catch {
        showToast('No se pudo copiar automáticamente', 'info');
      }
    });
  });

  // --- 15. Contact Form Submissions (Email & WhatsApp) ---
  const contactForm = document.getElementById('contactForm');
  const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clickSfx();
      const name = document.getElementById('cfName')?.value.trim() || '';
      const email = document.getElementById('cfEmail')?.value.trim() || '';
      const subject = document.getElementById('cfSubject')?.value || 'Nuevo Contacto';
      const message = document.getElementById('cfMessage')?.value.trim() || '';

      const mailtoUrl = `mailto:leobaquero456@gmail.com?subject=${encodeURIComponent(`[Portafolio] ${subject} - ${name}`)}&body=${encodeURIComponent(`Hola Alvaro Leonardo,\n\nMi nombre es: ${name}\nCorreo de contacto: ${email}\nTipo de proyecto / motivo: ${subject}\n\nDetalles del mensaje:\n${message}\n\nSaludos cordiales.`)}`;
      window.location.href = mailtoUrl;
      showToast('Abriendo tu gestor de correo...');
    });
  }

  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.addEventListener('click', () => {
      clickSfx();
      const name = document.getElementById('cfName')?.value.trim() || 'un colega';
      const subject = document.getElementById('cfSubject')?.value || 'un proyecto';
      const message = document.getElementById('cfMessage')?.value.trim() || '';

      const text = `Hola Alvaro Leonardo, soy ${name}. Te contacto sobre: *${subject}*. ${message ? `\n\n${message}` : ''}`;
      const waUrl = `https://wa.me/573107547938?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
      showToast('Conectando con WhatsApp...');
    });
  }

  // --- 16. Mobile Menu Drawer ---
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      clickSfx();
      navMenu.classList.toggle('open');
      mobileMenuBtn.textContent = navMenu.classList.contains('open') ? '✕' : '☰';
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileMenuBtn.textContent = '☰';
      });
    });
  }

  // --- 17. Scrollspy Active Nav Links ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(sec => observer.observe(sec));

  // --- 18. Back to Top Button & Footer Year ---
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      clickSfx();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

  // --- 19. PWA Service Worker Registration ---
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
