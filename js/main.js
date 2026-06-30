/* =============================================
   BRICK — Main Application
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // LENIS — Smooth Scrolling
  // ============================================
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.8,
    touchMultiplier: 1.5,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // ============================================
  // LOADING SCREEN
  // ============================================
  const loader = document.getElementById('loader');

  function hideLoader() {
    if (loader.classList.contains('hidden')) return;
    loader.classList.add('hidden');
    setTimeout(() => {
      const cursor = document.querySelector('.cursor');
      if (cursor) cursor.style.opacity = '1';
    }, 300);
  }

  window.addEventListener('load', () => setTimeout(hideLoader, 2000));
  setTimeout(() => { if (loader && !loader.classList.contains('hidden')) hideLoader(); }, 4000);

  // ============================================
  // INTERACTIVE CURSOR
  // ============================================
  const cursor = document.getElementById('cursor');
  if (cursor) {
    const cursorDot = cursor.querySelector('.cursor-dot');
    const cursorRing = cursor.querySelector('.cursor-ring');
    let cursorX = -100, cursorY = -100;
    let ringX = -100, ringY = -100;

    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
    });

    function animateCursor() {
      ringX += (cursorX - ringX) * 0.08;
      ringY += (cursorY - ringY) * 0.08;
      cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('a, button, .hotspot-dot, .color-btn, .gallery-thumb, .gallery-thumb, .qty-btn').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    if ('ontouchstart' in window) cursor.style.display = 'none';
  }

  // ============================================
  // SCROLL PROGRESS BAR
  // ============================================
  const progressFill = document.getElementById('scrollProgressFill');
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        progressFill.style.width = ((scrollTop / docHeight) * 100) + '%';
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  // ============================================
  // NAVIGATION
  // ============================================
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('show');
    const icon = menuToggle.querySelector('i');
    icon.className = mobileMenu.classList.contains('show') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  });

  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('show');
      menuToggle.querySelector('i').className = 'fa-solid fa-bars';
    });
  });

  document.querySelectorAll('[data-smooth]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // Close any open modals
      const gameResult = document.getElementById('gameResult');
      if (gameResult?.classList.contains('show')) {
        gameResult.classList.remove('show');
        document.body.style.overflow = '';
      }
      const target = link.getAttribute('href');
      if (target && target.startsWith('#')) {
        const el = document.querySelector(target);
        if (el) lenis.scrollTo(el, { duration: 1.5 });
      }
    });
  });

  // ============================================
  // BACK TO TOP
  // ============================================
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  backToTop.addEventListener('click', () => {
    lenis.scrollTo('#hero', { duration: 1.5 });
  });

  // ============================================
  // AMBIENT AUDIO
  // ============================================
  const audio = document.getElementById('ambientAudio');
  let isAudioPlaying = false;

  document.querySelectorAll('.audio-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isAudioPlaying) {
        audio.pause();
        btn.querySelector('i').className = 'fa-solid fa-music';
      } else {
        audio.play().catch(() => {});
        btn.querySelector('i').className = 'fa-solid fa-volume-high';
      }
      isAudioPlaying = !isAudioPlaying;
    });
  });

  // ============================================
  // HERO PARTICLES
  // ============================================
  function createParticles(containerId, count = 60) {
    const container = document.getElementById(containerId);
    if (!container) return;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.width = (Math.random() * 3 + 2) + 'px';
      particle.style.height = particle.style.width;
      particle.style.animation = `floatParticle ${Math.random() * 6 + 4}s ease-in-out infinite`;
      particle.style.animationDelay = (Math.random() * 4) + 's';
      particle.style.opacity = Math.random() * 0.5 + 0.1;
      container.appendChild(particle);
    }
  }

  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes floatParticle {
      0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
      25% { transform: translateY(-20px) translateX(10px); }
      50% { transform: translateY(-10px) translateX(-10px); opacity: 0.6; }
      75% { transform: translateY(-30px) translateX(5px); }
    }
  `;
  document.head.appendChild(styleSheet);

  createParticles('heroParticles', 80);
  createParticles('footerParticles', 40);

  // ============================================
  // THREE.JS BRICK
  // ============================================
  if (typeof THREE !== 'undefined' && typeof THREE_BRICK !== 'undefined') {
    THREE_BRICK.init('heroCanvas');
  }

  // ============================================
  // STORY — Interactive Carousel
  // ============================================
  const storyItems = document.querySelectorAll('.story-item');
  const storyDots = document.getElementById('storyDots');
  const storyPrev = document.querySelector('.story-prev');
  const storyNext = document.querySelector('.story-next');
  const storyCarousel = document.querySelector('.story-carousel');
  let currentStory = 0;

  storyItems.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'story-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Story ${i + 1}`);
    dot.addEventListener('click', () => goToStory(i));
    storyDots.appendChild(dot);
  });

  function goToStory(index) {
    if (index === currentStory && storyItems[currentStory]?.classList.contains('active')) return;
    storyItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
    storyDots.querySelectorAll('.story-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentStory = index;
  }

  storyPrev.addEventListener('click', () => goToStory(Math.max(0, currentStory - 1)));
  storyNext.addEventListener('click', () => goToStory(Math.min(storyItems.length - 1, currentStory + 1)));

  // Clay particles
  const clayContainer = document.getElementById('clayParticles');
  if (clayContainer) {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'clay-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = (Math.random() * 3) + 's';
      p.style.animation = `floatParticle ${Math.random() * 4 + 3}s ease-in-out infinite`;
      clayContainer.appendChild(p);
    }
  }

  // Fire particles
  const fireContainer = document.getElementById('fireContainer');
  if (fireContainer) {
    for (let i = 0; i < 15; i++) {
      const f = document.createElement('div');
      f.className = 'fire-particle';
      f.style.left = (Math.random() * 80 + 10) + '%';
      f.style.height = (Math.random() * 60 + 30) + 'px';
      f.style.animationDuration = (Math.random() * 0.5 + 1) + 's';
      f.style.animationDelay = (Math.random() * 2) + 's';
      fireContainer.appendChild(f);
    }
  }

  // Craft grid
  const craftGrid = document.querySelector('.craft-grid');
  if (craftGrid) {
    for (let i = 0; i < 16; i++) {
      const cell = document.createElement('div');
      cell.className = 'craft-cell';
      cell.style.animationDelay = (Math.random() * 2) + 's';
      craftGrid.appendChild(cell);
    }
  }

  // ============================================
  // GSAP + SCROLLTRIGGER — Cinematic Animations
  // ============================================

  // Hero entrance
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('.hero-badge', { y: 30, opacity: 0, duration: 1.2, delay: 0.5 })
    .from('.title-line', { y: 100, opacity: 0, duration: 1, stagger: 0.2 }, '-=0.6')
    .from('.hero-subtitle', { y: 40, opacity: 0, duration: 1 }, '-=0.4')
    .from('.hero-actions .btn', { y: 30, opacity: 0, stagger: 0.2, duration: 0.8 }, '-=0.4')
    .from('.hero-scroll-indicator', { opacity: 0, duration: 1 }, '-=0.2');

  // Story section — scroll-based navigation
  gsap.utils.toArray('.story-item').forEach((item, i) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top center',
      onEnter: () => goToStory(i),
    });
  });

  // Features — staggered reveal (one-time)
  gsap.utils.toArray('.feature-card').forEach((card) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(card, {
          y: 0, opacity: 1, duration: 0.8,
          delay: parseFloat(card.dataset.delay) || 0,
          ease: 'power3.out',
        });
      },
    });
    gsap.set(card, { y: 40, opacity: 0 });
  });

  // Showcase
  ScrollTrigger.create({
    trigger: '.showcase', start: 'top 70%', once: true,
    onEnter: () => {
      gsap.from('.showcase-viewer', { scale: 0.9, opacity: 0, duration: 1, ease: 'power3.out' });
      gsap.from('.spec-item', {
        x: 30, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out', delay: 0.3,
      });
    },
  });

  // Game
  ScrollTrigger.create({
    trigger: '.game', start: 'top 70%', once: true,
    onEnter: () => {
      gsap.from('.game-hud', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' });
      gsap.from('.game-board', { scale: 0.95, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
      gsap.from('.game-controls', { y: 20, opacity: 0, duration: 0.6, delay: 0.4, ease: 'power3.out' });
    },
  });

  // Testimonials
  ScrollTrigger.create({
    trigger: '.testimonials', start: 'top 70%', once: true,
    onEnter: () => {
      gsap.from('.testimonials-track', { opacity: 0, duration: 1, ease: 'power3.out' });
    },
  });

  // Product
  ScrollTrigger.create({
    trigger: '.product', start: 'top 60%', once: true,
    onEnter: () => {
      gsap.from('.product-gallery', { x: -30, opacity: 0, duration: 1, ease: 'power3.out' });
      gsap.from('.product-details > *', {
        y: 20, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out', delay: 0.2,
      });
    },
  });

  // Footer
  ScrollTrigger.create({
    trigger: '.footer', start: 'top 80%', once: true,
    onEnter: () => {
      gsap.from('.footer-brand', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' });
      gsap.from('.footer-col', { y: 20, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out', delay: 0.2 });
    },
  });

  // Section labels & titles — generic reveal
  document.querySelectorAll('.section[data-section]').forEach((section) => {
    const label = section.querySelector('.section-label');
    const title = section.querySelector('.section-title');
    ScrollTrigger.create({
      trigger: section, start: 'top 75%', once: true,
      onEnter: () => {
        if (label) gsap.from(label, { x: -30, opacity: 0, duration: 0.8, ease: 'power3.out' });
        if (title) {
          gsap.from(title.querySelectorAll('.title-reveal'), {
            y: 60, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out', delay: 0.2,
          });
        }
      },
    });
  });

  // ============================================
  // ANIMATED COUNTERS
  // ============================================
  function animateCounter(el, target, duration = 2000) {
    const isFloat = target.toString().includes('.');
    const startTime = performance.now();
    const finalStr = isFloat ? target.toFixed(2) + '%' : String(Math.floor(target));

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;

      if (isFloat) {
        el.textContent = current.toFixed(2) + '%';
      } else {
        el.textContent = Math.floor(current);
      }
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        if (!isNaN(target)) animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  // ============================================
  // MOUSE-FOLLOW LIGHTING
  // ============================================
  const heroLighting = document.getElementById('heroLighting');
  if (heroLighting) {
    let lightRafId = null;
    document.addEventListener('mousemove', (e) => {
      if (lightRafId) cancelAnimationFrame(lightRafId);
      lightRafId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        heroLighting.style.background =
          `radial-gradient(600px circle at ${x}% ${y}%, rgba(198, 40, 40, 0.08), transparent 60%)`;
        lightRafId = null;
      });
    });
  }

  // ============================================
  // SHOWCASE — Interactive 3D Overlay
  // ============================================
  const showcaseCanvas = document.getElementById('showcaseCanvas');
  if (showcaseCanvas) {
    let isRotating = false;
    let rotX = 0, rotY = 0;
    let zoom = 1;

    const showcaseViewer = showcaseCanvas.closest('.showcase-viewer');
    if (showcaseViewer) {
      showcaseViewer.addEventListener('mousemove', (e) => {
        if (!isRotating) return;
        const rect = showcaseViewer.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        rotY = (x - 0.5) * 30;
        rotX = (0.5 - y) * 20;
        applyShowcaseTransform();
      });
    }

    function applyShowcaseTransform() {
      showcaseCanvas.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${zoom})`;
    }

    document.getElementById('rotateToggle').addEventListener('click', function () {
      isRotating = !isRotating;
      this.classList.toggle('active');
      if (!isRotating) {
        rotX = 0;
        rotY = 0;
        applyShowcaseTransform();
      }
    });

    document.getElementById('resetView').addEventListener('click', () => {
      rotX = 0;
      rotY = 0;
      zoom = 1;
      isRotating = false;
      document.getElementById('rotateToggle').classList.remove('active');
      document.getElementById('zoomLevel').textContent = '1.0';
      applyShowcaseTransform();
    });

    document.getElementById('zoomIn').addEventListener('click', () => {
      zoom = Math.min(2, +(zoom + 0.1).toFixed(1));
      document.getElementById('zoomLevel').textContent = zoom.toFixed(1);
      applyShowcaseTransform();
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
      zoom = Math.max(0.5, +(zoom - 0.1).toFixed(1));
      document.getElementById('zoomLevel').textContent = zoom.toFixed(1);
      applyShowcaseTransform();
    });
  }

  // ============================================
  // FAKE LIVE PURCHASES
  // ============================================
  const fakeNames = [
    'Alex M.', 'Sarah K.', 'David C.', 'Emma W.',
    'James L.', 'Sophia R.', 'Oliver T.', 'Isabella N.',
    'Lucas P.', 'Mia H.', 'Ethan G.', 'Aria F.',
  ];
  const fakeLocations = [
    'New York', 'London', 'Tokyo', 'Paris', 'Berlin',
    'Dubai', 'Milan', 'Sydney', 'Seoul', 'Singapore',
  ];

  function createFakePurchase() {
    const toast = document.createElement('div');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    const name = fakeNames[Math.floor(Math.random() * fakeNames.length)];
    const location = fakeLocations[Math.floor(Math.random() * fakeLocations.length)];
    toast.style.cssText = `
      position: fixed; bottom: 30px; left: 30px;
      background: rgba(20, 20, 20, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; padding: 14px 20px;
      display: flex; align-items: center; gap: 12px;
      z-index: 100; font-size: 13px;
      opacity: 1; transition: all 0.5s ease;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      max-width: 280px; pointer-events: none;
    `;
    toast.innerHTML = `
      <div style="width:8px;height:8px;border-radius:50%;background:#4CAF50;flex-shrink:0;animation:pulse-dot 2s infinite;"></div>
      <div>
        <strong style="color:white;font-weight:500;">${name}</strong>
        <span style="color:rgba(255,255,255,0.5);"> from ${location}</span>
        <span style="color:rgba(255,255,255,0.7);display:block;font-size:12px;">secured their brick</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-20px)';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  let fakePurchaseInterval = setInterval(createFakePurchase, 8000);
  setTimeout(createFakePurchase, 3000);

  // Pause fake purchases when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(fakePurchaseInterval);
    } else {
      fakePurchaseInterval = setInterval(createFakePurchase, 8000);
    }
  });

  // ============================================
  // INITIALIZE CART & GAME
  // ============================================
  if (typeof CART !== 'undefined') CART.init();
  if (typeof BRICK_GAME !== 'undefined') BRICK_GAME.init();

  // ============================================
  // STOCK COUNTER
  // ============================================
  let stockCount = 7;
  let stockInterval = setInterval(() => {
    if (stockCount > 1 && Math.random() > 0.7) {
      stockCount--;
      document.getElementById('stockCount').textContent = stockCount;
      document.querySelector('.stock-bar-fill').style.width = (93 - (7 - stockCount)) + '%';
    }
  }, 15000);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(stockInterval);
  });

  // ============================================
  // PAYMENT FORMATTING
  // ============================================
  const cardInput = document.getElementById('checkoutCard');
  const expiryInput = document.getElementById('checkoutExpiry');
  const cvcInput = document.getElementById('checkoutCVC');

  if (cardInput) {
    cardInput.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
    });
  }
  if (expiryInput) {
    expiryInput.addEventListener('input', function () {
      let val = this.value.replace(/\D/g, '');
      if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
      this.value = val.substring(0, 5);
    });
  }
  if (cvcInput) {
    cvcInput.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').substring(0, 4);
    });
  }

  // ============================================
  // CONFIRMATION — Close
  // ============================================
  const confirmOverlay = document.getElementById('confirmationOverlay');
  const confirmModal = document.getElementById('confirmationModal');
  if (confirmOverlay) {
    confirmOverlay.addEventListener('click', () => {
      confirmModal.classList.remove('show');
      confirmOverlay.classList.remove('show');
      document.body.style.overflow = '';
    });
  }

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      mobileMenu.classList.remove('show');
      menuToggle.querySelector('i').className = 'fa-solid fa-bars';

      const cartClose = document.getElementById('cartClose');
      if (cartClose && document.getElementById('cartPanel').classList.contains('show')) {
        cartClose.click();
      }

      const checkoutClose = document.getElementById('checkoutClose');
      if (checkoutClose && document.getElementById('checkoutPanel').classList.contains('show')) {
        checkoutClose.click();
      }

      if (confirmModal?.classList.contains('show')) {
        confirmModal.classList.remove('show');
        confirmOverlay.classList.remove('show');
        document.body.style.overflow = '';
      }
    }
  });

  // ============================================
  // FOCUS TRAP for modals
  // ============================================
  function trapFocus(containerEl) {
    const focusableEls = containerEl.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableEls[0];
    const lastFocusable = focusableEls[focusableEls.length - 1];

    function handler(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
    containerEl.addEventListener('keydown', handler);
    if (firstFocusable) firstFocusable.focus();
    return () => containerEl.removeEventListener('keydown', handler);
  }

  // Apply focus trap to modals
  const modals = [document.getElementById('cartPanel'), document.getElementById('checkoutPanel'), confirmModal];
  const modalObservers = [];
  modals.forEach(modal => {
    if (!modal) return;
    const observer = new MutationObserver(() => {
      if (modal.classList.contains('show')) {
        modalObservers.push(trapFocus(modal));
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  });

  // ============================================
  // ACCESSIBILITY — Focus management
  // ============================================
  document.addEventListener('focusin', (e) => {
    if (e.target.matches('a, button, input, select, textarea, [tabindex]')) {
      e.target.style.outline = '2px solid var(--accent-red)';
      e.target.style.outlineOffset = '2px';
    }
  });
  document.addEventListener('focusout', (e) => {
    if (e.target.matches('a, button, input, select, textarea, [tabindex]')) {
      e.target.style.outline = '';
    }
  });

  // ============================================
  // LAZY LOAD IMAGES
  // ============================================
  document.querySelectorAll('img[data-src]').forEach(img => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  });

  // ============================================
  // RESIZE
  // ============================================
  window.addEventListener('resize', () => lenis.resize());

  console.log(
    '%c BRICK ',
    'background: #C62828; color: white; font-size: 20px; font-weight: bold; padding: 10px; border-radius: 4px;'
  );
  console.log('%c The brick that chooses you. ', 'color: #D4A843; font-size: 14px;');

});
