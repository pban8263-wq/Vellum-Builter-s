document.addEventListener('DOMContentLoaded', () => {

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navLinks.style.display = open ? 'flex' : '';
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        if (window.innerWidth <= 900) navLinks.style.display = '';
      });
    });
  }

  // Message Us modal
  const messageUsBtn = document.getElementById('messageUsBtn');
  const messageModal = document.getElementById('messageModal');
  const messageModalOverlay = document.getElementById('messageModalOverlay');
  const messageModalClose = document.getElementById('messageModalClose');
  const messageModalPanel = messageModal ? messageModal.querySelector('.message-modal-panel') : null;
  const messageForm = document.getElementById('messageForm');
  const messageSubmitBtn = document.getElementById('messageSubmitBtn');

  const openMessageModal = () => {
    if (!messageModal) return;
    messageModal.classList.add('open');
    messageModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstInput = messageForm && messageForm.querySelector('input');
    if (firstInput) firstInput.focus();
  };
  const closeMessageModal = () => {
    if (!messageModal) return;
    messageModal.classList.remove('open');
    messageModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (messageUsBtn) messageUsBtn.addEventListener('click', openMessageModal);
  if (messageModalOverlay) messageModalOverlay.addEventListener('click', closeMessageModal);
  if (messageModalClose) messageModalClose.addEventListener('click', closeMessageModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && messageModal && messageModal.classList.contains('open')) closeMessageModal();
  });

  // Hero search tabs (cosmetic toggle)
  const heroTabs = document.querySelectorAll('.hero-search-tabs button');
  heroTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      heroTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Hero search "Get a Quote" opens the Message Us modal
  const heroSearchQuoteBtn = document.getElementById('heroSearchQuoteBtn');
  if (heroSearchQuoteBtn) heroSearchQuoteBtn.addEventListener('click', openMessageModal);

  // ===== Message form: live validation =====
  if (messageForm) {
    const nameInput = messageForm.name;
    const emailInput = messageForm.email;
    const messageInput = messageForm.message;
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validators = {
      name: () => {
        const v = nameInput.value.trim();
        if (!v) return 'Please enter your name.';
        if (v.length < 2) return 'Name looks a little short.';
        return '';
      },
      email: () => {
        const v = emailInput.value.trim();
        if (!v) return 'Please enter your email.';
        if (!emailPattern.test(v)) return 'That email doesn\u2019t look right.';
        return '';
      },
      message: () => {
        const v = messageInput.value.trim();
        if (!v) return 'Tell us a little about the project.';
        if (v.length < 10) return 'A few more words would help us understand the project.';
        return '';
      }
    };

    const fieldMap = {
      name: { input: nameInput, error: nameError },
      email: { input: emailInput, error: emailError },
      message: { input: messageInput, error: messageError }
    };

    const validateField = (key, { silent = false } = {}) => {
      const msg = validators[key]();
      const { input, error } = fieldMap[key];
      if (msg) {
        if (!silent) {
          input.classList.add('invalid');
          if (error) error.textContent = msg;
        }
        return false;
      }
      input.classList.remove('invalid');
      if (error) error.textContent = '';
      return true;
    };

    // Real-time: re-validate as the user types, once they've touched a field
    Object.keys(fieldMap).forEach(key => {
      const { input } = fieldMap[key];
      input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) validateField(key);
      });
      input.addEventListener('blur', () => validateField(key));
    });

    messageForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const results = Object.keys(fieldMap).map(key => validateField(key));
      const allValid = results.every(Boolean);

      if (!allValid) {
        if (messageModalPanel) {
          messageModalPanel.classList.remove('shake');
          void messageModalPanel.offsetWidth; // restart animation
          messageModalPanel.classList.add('shake');
        }
        const firstInvalidKey = Object.keys(fieldMap).find(key => fieldMap[key].input.classList.contains('invalid'));
        if (firstInvalidKey) fieldMap[firstInvalidKey].input.focus();
        return;
      }

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const message = messageInput.value.trim();
      const subject = encodeURIComponent(`Project Enquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=pban8263@gmail.com&su=${subject}&body=${body}`;

      if (messageSubmitBtn) {
        messageSubmitBtn.disabled = true;
        messageSubmitBtn.textContent = 'Opening your email app\u2026';
        messageSubmitBtn.classList.add('is-success');
      }

      window.open(gmailUrl, '_blank');

      setTimeout(() => {
        closeMessageModal();
        messageForm.reset();
        Object.keys(fieldMap).forEach(key => validateField(key, { silent: true }));
        if (messageSubmitBtn) {
          messageSubmitBtn.disabled = false;
          messageSubmitBtn.textContent = 'Send Message';
          messageSubmitBtn.classList.remove('is-success');
        }
      }, 650);
    });
  }

  // ===== Animated filter helper (used by gallery + plans) =====
  const setItemVisible = (el, show) => {
    if (el._filterTimeout) {
      clearTimeout(el._filterTimeout);
      el._filterTimeout = null;
    }
    if (show) {
      el.hidden = false;
      el.style.transition = el.style.transition || 'opacity .4s ease, transform .4s ease';
      requestAnimationFrame(() => {
        el.style.opacity = 1;
        el.style.transform = 'translateY(0) scale(1)';
      });
    } else {
      el.style.transition = 'opacity .35s ease, transform .35s ease';
      el.style.opacity = 0;
      el.style.transform = 'translateY(10px) scale(.94)';
      el._filterTimeout = setTimeout(() => { el.hidden = true; }, 350);
    }
  };

  // Gallery category filter
  const tabs = document.querySelectorAll('.filter-tabs:not(.plan-view-tabs) .tab');
  const cards = document.querySelectorAll('.gallery .card');
  const galleryNoResults = document.getElementById('galleryNoResults');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const filter = tab.dataset.filter;
      let anyVisible = false;
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.cat === filter;
        if (show) anyVisible = true;
        setItemVisible(card, show);
      });
      if (galleryNoResults) galleryNoResults.hidden = anyVisible;
    });
  });

  // Plans: 2D / 3D view toggle
  const planViewTabs = document.querySelectorAll('#planViewTabs .tab');
  const planCards = document.querySelectorAll('.plan-card');
  const plansNoResults = document.getElementById('plansNoResults');
  planViewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      planViewTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const view = tab.dataset.view;
      let anyVisible = false;
      planCards.forEach(card => {
        const show = card.dataset.view === view;
        if (show) anyVisible = true;
        setItemVisible(card, show);
      });
      if (plansNoResults) plansNoResults.hidden = anyVisible;
    });
  });

  // Blueprint draw-in animation for plan & plan-type SVGs, triggered on scroll into view
  const planMedias = document.querySelectorAll('.plan-media, .plan-type-media');
  const planReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (planMedias.length) {
    if (planReduceMotion) {
      planMedias.forEach(el => el.classList.add('in-view'));
    } else {
      const planObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const paths = entry.target.querySelectorAll('.bp-path');
            paths.forEach((p, i) => { p.style.transitionDelay = (i * 0.05) + 's'; });
            const fills = entry.target.querySelectorAll('.bp-fill');
            fills.forEach((f, i) => { f.style.transitionDelay = (0.4 + i * 0.08) + 's'; });
            entry.target.classList.add('in-view');
            planObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      planMedias.forEach(el => planObserver.observe(el));
    }
  }

  // Re-trigger hero blueprint draw-in if reduced motion isn't set
  const svg = document.getElementById('blueprintSvg');
  if (svg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    svg.querySelectorAll('.bp-path').forEach((path, i) => {
      path.style.animationDelay = (i * 0.02) + 's';
    });
  }

  // Simple scroll-reveal for cards and process items
  const revealTargets = document.querySelectorAll('.card, .process-list li');
  revealTargets.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => observer.observe(el));

  // ===== Animated stat counters =====
  const statEls = document.querySelectorAll('.hero-stat strong[data-count]');
  if (statEls.length) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      if (reduceMotion) {
        el.textContent = target + suffix;
        return;
      }
      const duration = 1200;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    statEls.forEach(el => statObserver.observe(el));
  }

  // ===== Scrollspy: highlight the current section in the nav =====
  const navAnchors = document.querySelectorAll('[data-nav-link]');
  const spySections = Array.from(navAnchors)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (navAnchors.length && spySections.length) {
    const setActiveLink = (id) => {
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    };
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveLink(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    spySections.forEach(sec => spyObserver.observe(sec));
  }

  // ===== Back to top =====
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    const toggleBackToTop = () => {
      backToTop.classList.toggle('show', window.scrollY > 500);
    };
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Sticky nav background intensifies on scroll
  const nav = document.getElementById('siteNav');
  const updateNavState = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', updateNavState);
  updateNavState();
});
