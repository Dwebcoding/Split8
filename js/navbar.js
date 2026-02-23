/**
 * Navbar Component - SPLit8
 * Centralizes navbar HTML across all pages
 */

(function() {
  const navbarHTML = `
    <header class="navbar">
      <div class="navbar__container">
        <a href="/index.html" class="navbar__logo">
          <svg class="navbar__logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="24" height="24" rx="6" stroke="currentColor" stroke-width="1.5"/>
            <rect x="10" y="10" width="12" height="12" rx="3" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
          </svg>
          <span class="navbar__logo-text">SPLit8</span>
        </a>
        
        <nav class="navbar__menu">
          <a href="/pages/search.html" class="navbar__link" data-i18n="nav_search">Cerca</a>
          <a href="/pages/listings.html#crea" class="navbar__link" data-i18n="nav_publish">Pubblica</a>
          <a href="/pages/companies.html" class="navbar__link" data-i18n="nav_companies">Aziende</a>
          <a href="/pages/pricing.html" class="navbar__link" data-i18n="nav_pricing">Pricing</a>
        </nav>
        
        <div class="navbar__actions">
          <div class="lang-switcher">
            <button class="lang-toggle active" data-lang="it">IT</button>
            <button class="lang-toggle" data-lang="en">EN</button>
          </div>
          <button class="navbar__cta" id="openAuth" data-i18n="nav_signup">Inizia ora</button>
        </div>
        
        <button class="navbar__mobile-toggle" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  `;

  // Function to render navbar
  function renderNavbar() {
    const navbarContainer = document.getElementById('navbar-placeholder');
    if (navbarContainer) {
      navbarContainer.innerHTML = navbarHTML;
      
      // Re-initialize language switcher after navbar is rendered
      if (window.i18n && window.i18n.setLanguage) {
        const currentLang = localStorage.getItem('language') || 'it';
        window.i18n.setLanguage(currentLang);
      }

      // Initialize auto-hide navbar on scroll
      initAutoHideNavbar();
    }
  }

  // Auto-hide navbar on scroll
  function initAutoHideNavbar() {
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavbar() {
      const navbar = document.querySelector('.navbar');
      if (!navbar) return;

      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        navbar.classList.add('navbar--hidden');
      } else {
        // Scrolling up
        navbar.classList.remove('navbar--hidden');
      }

      lastScrollY = currentScrollY;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    });
  }

  // Render navbar when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderNavbar);
  } else {
    renderNavbar();
  }

  // Export to window
  window.SPLit8Navbar = { render: renderNavbar };
})();
