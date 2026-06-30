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

  // Connect Lenis to GSAP's ScrollTrigger
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // ============================================
  // LOADING SCREEN
  // ============================================
  const loader = document.getElementById('loader');

  function hideLoader() {
    loader.classList.add('hidden');
    document.body.style.cursor = 'none';
    // Show cursor after loader
    setTimeout(() => {
      document.querySelector('.cursor').style.opacity = '1';
    }, 300);
  }

  // Wait for everything to load
  window.addEventListener('load', () => {
    setTimeout(hideLoader, 2000);
  });

  // Fallback: hide after 4s max
  setTimeout(() => {
    if (!loader.classList.contains('hidden')) hideLoader();
  }, 4000);

  // ============================================
  // INTERACTIVE CURSOR
  // ============================================
  const cursor = document.getElementById('cursor');
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

  // Hover effect on interactive elements
  document.querySelectorAll('a, button, .hotspot-dot, .color-btn, .gallery-thumb').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  // Hide cursor on touch devices
  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
  }

  // ============================================
  // SCROLL PROGRESS BAR
  // ============================================
  const progressFill = document.getElementById('scrollProgressFill');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressFill.style.width = progress + '%';
  });

  // ============================================
  // NAVIGATION
  // ============================================
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  // Navbar background on scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Mobile menu
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

  // Smooth navigation
  document.querySelectorAll('[data-smooth]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('href');
      if (target && target.startsWith('#')) {
        const el = document.querySelector(target);
        if (el) {
          lenis.scrollTo(el, { duration: 1.5 });
        }
      }
    });
  });

  // ============================================
  // BACK TO TOP
  // ============================================
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 500);
  });
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

  // Add floating animation
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
  // THREE.JS BRICK — Hero Scene
  // ============================================
  THREE_BRICK.init('heroCanvas');

  // ============================================
  // STORY — Interactive Carousel
  // ============================================
  const storyItems = document.querySelectorAll('.story-item');
  const storyDots = document.getElementById('storyDots');
  const storyPrev = document.querySelector('.story-prev');
  const storyNext = document.querySelector('.story-next');
  let currentStory = 0;

  // Create dots
  storyItems.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'story-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Story ${i + 1}`);
    dot.addEventListener('click', () => goToStory(i));
    storyDots.appendChild(dot);
  });

  function goToStory(index) {
    storyItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
    storyDots.querySelectorAll('.story-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentStory = index;
  }

  storyPrev.addEventListener('click', () => {
    goToStory(Math.max(0, currentStory - 1));
  });
  storyNext.addEventListener('click', () => {
    goToStory(Math.min(storyItems.length - 1, currentStory + 1));
  });

  // ============================================
  // STORY SECTION — Clay Particles
  // ============================================
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

  // ============================================
  // STORY SECTION — Fire Particles
  // ============================================
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

  // ============================================
  // STORY SECTION — Craft Grid
  // ============================================
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

  // --- HERO Section ---
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('.hero-badge', { y: 30, opacity: 0, duration: 1.2, delay: 0.5 })
    .from('.title-line', { y: 100, opacity: 0, duration: 1, stagger: 0.2 }, '-=0.6')
    .from('.hero-subtitle', { y: 40, opacity: 0, duration: 1 }, '-=0.4')
    .from('.hero-actions .btn', { y: 30, opacity: 0, stagger: 0.2, duration: 0.8 }, '-=0.4')
    .from('.hero-scroll-indicator', { opacity: 0, duration: 1 }, '-=0.2');

  // --- STORY Section ---
  gsap.utils.toArray('.story-item').forEach((item, i) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top center',
      onEnter: () => goToStory(i),
    });
  });

  // --- FEATURES Section ---
  gsap.utils.toArray('.feature-card').forEach((card, i) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(card, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: parseFloat(card.dataset.delay) || 0,
          ease: 'power3.out',
        });
      },
    });
    gsap.set(card, { y: 40, opacity: 0 });
  });

  // --- SHOWCASE Section ---
  ScrollTrigger.create({
    trigger: '.showcase',
    start: 'top 70%',
    onEnter: () => {
      gsap.from('.showcase-viewer', {
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
      gsap.from('.spec-item', {
        x: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.3,
      });
    },
  });

  // --- GAME Section ---
  ScrollTrigger.create({
    trigger: '.game',
    start: 'top 70%',
    onEnter: () => {
      gsap.from('.game-hud', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
      gsap.from('.game-board', {
        scale: 0.95,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
      });
      gsap.from('.game-controls', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.4,
        ease: 'power3.out',
      });
    },
  });

  // --- TESTIMONIALS Section ---
  ScrollTrigger.create({
    trigger: '.testimonials',
    start: 'top 70%',
    onEnter: () => {
      gsap.from('.testimonials-track', {
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    },
  });

  // --- PRODUCT Section ---
  ScrollTrigger.create({
    trigger: '.product',
    start: 'top 60%',
    onEnter: () => {
      gsap.from('.product-gallery', {
        x: -30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
      gsap.from('.product-details > *', {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.2,
      });
    },
  });

  // --- FOOTER Section ---
  ScrollTrigger.create({
    trigger: '.footer',
    start: 'top 80%',
    onEnter: () => {
      gsap.from('.footer-brand', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
      gsap.from('.footer-col', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.2,
      });
    },
  });

  // --- SECTION LABELS & TITLES ---
  document.querySelectorAll('.section[data-section]').forEach((section) => {
    const label = section.querySelector('.section-label');
    const title = section.querySelector('.section-title');

    ScrollTrigger.create({
      trigger: section,
      start: 'top 75%',
      onEnter: () => {
        if (label) {
          gsap.from(label, {
            x: -30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
          });
        }
        if (title) {
          gsap.from(title.querySelectorAll('.title-reveal'), {
            y: 60,
            opacity: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power3.out',
            delay: 0.2,
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
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;

      if (isFloat) {
        el.textContent = current.toFixed(2) + '%';
      } else {
        el.textContent = Math.floor(current);
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  // Observe stat numbers
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        if (!isNaN(target)) {
          animateCounter(el, target);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));

  // ============================================
  // MOUSE-FOLLOW LIGHTING for Hero
  // ============================================
  const heroLighting = document.getElementById('heroLighting');
  if (heroLighting) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      heroLighting.style.background = `
        radial-gradient(600px circle at ${x}% ${y}%, rgba(198, 40, 40, 0.08), transparent 60%)
      `;
    });
  }

  // ============================================
  // SHOWCASE — Interactive 3D (simplified overlay)
  // ============================================
  const showcaseCanvas = document.getElementById('showcaseCanvas');
  if (showcaseCanvas) {
    // Simplified 3D-like interaction with CSS transforms
    let isRotating = false;
    let rotationX = 0, rotationY = 0;

    showcaseCanvas.addEventListener('mousemove', (e) => {
      if (!isRotating) return;
      const rect = showcaseCanvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      rotationY = (x - 0.5) * 30;
      rotationX = (0.5 - y) * 20;
      showcaseCanvas.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
    });

    document.getElementById('rotateToggle').addEventListener('click', function() {
      isRotating = !isRotating;
      this.classList.toggle('active');
      if (!isRotating) {
        showcaseCanvas.style.transform = '';
      }
    });

    document.getElementById('resetView').addEventListener('click', () => {
      showcaseCanvas.style.transform = '';
      isRotating = false;
      document.getElementById('rotateToggle').classList.remove('active');
    });

    // Zoom
    let zoom = 1;
    document.getElementById('zoomIn').addEventListener('click', () => {
      zoom = Math.min(2, zoom + 0.1);
      document.getElementById('zoomLevel').textContent = zoom.toFixed(1);
      showcaseCanvas.style.transform += ` scale(${zoom})`;
    });
    document.getElementById('zoomOut').addEventListener('click', () => {
      zoom = Math.max(0.5, zoom - 0.1);
      document.getElementById('zoomLevel').textContent = zoom.toFixed(1);
      showcaseCanvas.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg) scale(${zoom})`;
    });
  }

  // ============================================
  // FAKE LIVE PURCHASES (social proof)
  // ============================================
  const fakeNames = [
    'Alex M.', 'Sarah K.', 'David C.', 'Emma W.',
    'James L.', 'Sophia R.', 'Oliver T.', 'Isabella N.',
    'Lucas P.', 'Mia H.', 'Ethan G.', 'Aria F.'
  ];
  const fakeLocations = [
    'New York', 'London', 'Tokyo', 'Paris', 'Berlin',
    'Dubai', 'Milan', 'Sydney', 'Seoul', 'Singapore'
  ];

  function createFakePurchase() {
    const toast = document.createElement('div');
    const name = fakeNames[Math.floor(Math.random() * fakeNames.length)];
    const location = fakeLocations[Math.floor(Math.random() * fakeLocations.length)];

    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 30px;
      background: rgba(20, 20, 20, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 100;
      font-size: 13px;
      opacity: 1;
      transition: all 0.5s ease;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      max-width: 280px;
      pointer-events: none;
    `;
    toast.innerHTML = `
      <div style="width: 8px; height: 8px; border-radius: 50%; background: #4CAF50; flex-shrink: 0; animation: pulse-dot 2s infinite;"></div>
      <div>
        <strong style="color: white; font-weight: 500;">${name}</strong>
        <span style="color: rgba(255,255,255,0.5);"> from ${location}</span>
        <span style="color: rgba(255,255,255,0.7); display: block; font-size: 12px;">secured their brick</span>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-20px)';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  // Show fake purchases periodically
  setInterval(createFakePurchase, 8000);
  setTimeout(createFakePurchase, 3000);

  // ============================================
  // INITIALIZE CART
  // ============================================
  CART.init();

  // ============================================
  // INITIALIZE GAME
  // ============================================
  BRICK_GAME.init();

  // ============================================
  // STOCK COUNTER (decreases over time)
  // ============================================
  let stockCount = 7;
  setInterval(() => {
    if (stockCount > 1 && Math.random() > 0.7) {
      stockCount--;
      document.getElementById('stockCount').textContent = stockCount;
      document.querySelector('.stock-bar-fill').style.width = (93 - (7 - stockCount)) + '%';
    }
  }, 15000);

  // ============================================
  // CHECKOUT — Country selects
  // ============================================
  // Payment formatting
  document.getElementById('checkoutCard').addEventListener('input', function() {
    let val = this.value.replace(/\D/g, '');
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.value = val;
  });

  document.getElementById('checkoutExpiry').addEventListener('input', function() {
    let val = this.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    this.value = val;
  });

  document.getElementById('checkoutCVC').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').substring(0, 3);
  });

  // ============================================
  // CONFIRMATION — Close on overlay click
  // ============================================
  confirmationOverlay = document.getElementById('confirmationOverlay');
  if (confirmationOverlay) {
    confirmationOverlay.addEventListener('click', () => {
      document.getElementById('confirmationModal').classList.remove('show');
      confirmationOverlay.classList.remove('show');
      document.body.style.overflow = '';
    });
  }

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close mobile menu
      mobileMenu.classList.remove('show');
      menuToggle.querySelector('i').className = 'fa-solid fa-bars';

      // Close cart
      if (cartPanel.classList.contains('show')) {
        document.getElementById('cartClose').click();
      }

      // Close checkout
      if (checkoutPanel.classList.contains('show')) {
        document.getElementById('checkoutClose').click();
      }

      // Close confirmation
      const confirmModal = document.getElementById('confirmationModal');
      const confirmOverlay = document.getElementById('confirmationOverlay');
      if (confirmModal?.classList.contains('show')) {
        confirmModal.classList.remove('show');
        confirmOverlay.classList.remove('show');
        document.body.style.overflow = '';
      }
    }
  });

  // ============================================
  // PERFORMANCE — Lazy load images (placeholder)
  // ============================================
  // Images are mostly CSS-based, but we add data-src support
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
  // WINDOW RESIZE — Update Lenis
  // ============================================
  window.addEventListener('resize', () => {
    lenis.resize();
  });

  // Log completion
  console.log('%c BRICK ', 'background: #C62828; color: white; font-size: 20px; font-weight: bold; padding: 10px; border-radius: 4px;');
  console.log('%c The brick that chooses you. ', 'color: #D4A843; font-size: 14px;');

}); // End DOMContentLoaded
