/* ===========================
   NAVBAR INTERACTION
   =========================== */

class NavbarController {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.setupScrollListener();
    this.setupLinkAnimations();
  }
  
  setupScrollListener() {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }
  
  setupLinkAnimations() {
    document.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('mouseenter', (e) => {
        e.target.style.transform = 'translateY(-2px)';
      });
      
      link.addEventListener('mouseleave', (e) => {
        e.target.style.transform = 'translateY(0)';
      });
    });
  }
}

/* ===========================
   INTERSECTION OBSERVER
   Stagger animations on scroll
   =========================== */

class ScrollAnimator {
  constructor() {
    this.setupObserver();
  }
  
  setupObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.animation = `slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
            entry.target.style.opacity = '1';
          }, index * 50);
          
          observer.unobserve(entry.target);
        }
      });
    }, options);
    
    document.querySelectorAll('.card, .feature, .how-step, .testimonial').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      observer.observe(el);
    });
  }
}

/* ===========================
   MODAL MANAGEMENT
   =========================== */

class AuthModal {
  constructor() {
    this.modal = document.getElementById('authModal');
    this.openButton = document.getElementById('openAuth');
    this.closeButton = document.getElementById('closeAuth');
    this.form = document.getElementById('authForm');
    this.tabs = document.querySelectorAll('.auth-tab');
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.openButton?.addEventListener('click', () => this.open());
    this.closeButton?.addEventListener('click', () => this.close());
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });
    
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.authMode));
    });
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }
  
  open() {
    this.modal?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  
  close() {
    this.modal?.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  
  switchTab(mode) {
    this.tabs.forEach(tab => {
      tab.classList.remove('is-active');
      if (tab.dataset.authMode === mode) {
        tab.classList.add('is-active');
      }
    });
  }
}

/* ===========================
   LANGUAGE SWITCHER
   =========================== */

class LanguageSwitcher {
  constructor() {
    this.buttons = document.querySelectorAll('.lang-toggle');
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.dataset.lang;
        this.setLanguage(lang);
        
        // Update active state
        this.buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
  
  setLanguage(lang) {
    localStorage.setItem('split8:lang', lang);
    if (window.i18n) {
      window.i18n.setLanguage(lang);
    }
  }
}

/* ===========================
   SMOOTH SCROLL BEHAVIOR
   =========================== */

class SmoothScroller {
  constructor() {
    this.setupSmoothScroll();
  }
  
  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
    });
  }
}

/* ===========================
   INITIALIZATION
   =========================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules (SkylineWixAI loads from skyline.js)
  new NavbarController();
  new ScrollAnimator();
  new AuthModal();
  new LanguageSwitcher();
  new SmoothScroller();
  
  // Performance optimization: passive event listeners
  window.addEventListener('scroll', () => {}, { passive: true });
});

// Prevent FOUC (Flash of Unstyled Content)
document.documentElement.style.opacity = '1';
