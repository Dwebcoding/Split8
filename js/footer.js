/**
 * Footer Component - SPLit8
 * Centralizes footer HTML across all pages
 */

(function() {
  const footerHTML = `
    <footer class="footer">
      <div class="footer__container">
        <div class="footer__content">
          <div class="footer__brand">
            <div class="footer__logo">
              <svg class="footer__logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="24" height="24" rx="6" stroke="currentColor" stroke-width="1.5"/>
                <rect x="10" y="10" width="12" height="12" rx="3" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
              </svg>
              <span class="footer__logo-text">SPLit8</span>
            </div>
            <p class="footer__tagline">
              Piattaforma professionale per sopralluoghi tecnici e lavori specializzati.
            </p>
          </div>

          <div class="footer__columns">
            <div class="footer__column">
              <h4 class="footer__heading">Piattaforma</h4>
              <ul>
                <li><a href="/pages/search.html" class="footer__link">Cerca professionisti</a></li>
                <li><a href="/pages/listings.html" class="footer__link">Pubblica inserzione</a></li>
                <li><a href="/pages/companies.html" class="footer__link">Aziende</a></li>
                <li><a href="/pages/pricing.html" class="footer__link">Prezzi</a></li>
                <li><a href="/sitemap.html" class="footer__link">Mappa Sito</a></li>
              </ul>
            </div>

            <div class="footer__column">
              <h4 class="footer__heading">Risorse</h4>
              <ul>
                <li><a href="/pages/about.html" class="footer__link">Chi siamo</a></li>
                <li><a href="/pages/support.html" class="footer__link">Centro assistenza</a></li>
                <li><a href="#" class="footer__link">Guide</a></li>
                <li><a href="#" class="footer__link">API</a></li>
              </ul>
            </div>

            <div class="footer__column">
              <h4 class="footer__heading">Legale</h4>
              <ul>
                <li><a href="/pages/terms.html" class="footer__link">Termini di servizio</a></li>
                <li><a href="/pages/privacy.html" class="footer__link">Privacy policy</a></li>
                <li><a href="/pages/cookies.html" class="footer__link">Cookie policy</a></li>
              </ul>
            </div>

            <div class="footer__column">
              <h4 class="footer__heading">Contatti</h4>
              <ul>
                <li><a href="mailto:info@split8.it" class="footer__link">info@split8.it</a></li>
                <li><a href="tel:+390123456789" class="footer__link">+39 012 345 6789</a></li>
              </ul>
              <div class="footer__social">
                <a href="#" class="footer__social-link" aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4.5 3C3.67 3 3 3.67 3 4.5v11c0 .83.67 1.5 1.5 1.5h11c.83 0 1.5-.67 1.5-1.5v-11c0-.83-.67-1.5-1.5-1.5h-11zM6 7h2v6H6V7zm1-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 2h1.8v.9h.1c.3-.5.9-.9 1.6-.9 1.7 0 2 1.1 2 2.5V13h-2v-3.2c0-.7 0-1.6-.9-1.6s-1 .7-1 1.5V13h-2V7z"/>
                  </svg>
                </a>
                <a href="#" class="footer__social-link" aria-label="Twitter">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.29 16c7.55 0 11.67-6.25 11.67-11.67v-.53c.8-.58 1.5-1.3 2.04-2.13-.73.32-1.52.54-2.35.64.84-.5 1.49-1.3 1.8-2.24-.79.47-1.66.81-2.6 1a4.1 4.1 0 00-7 3.74 11.65 11.65 0 01-8.45-4.29 4.1 4.1 0 001.27 5.47c-.67-.02-1.3-.2-1.86-.5v.05a4.1 4.1 0 003.29 4.02 4.1 4.1 0 01-1.85.07 4.1 4.1 0 003.83 2.85A8.23 8.23 0 012 14.54a11.6 11.6 0 006.29 1.84"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="footer__divider"></div>

        <div class="footer__bottom">
          <p style="margin: 0;">
            © 2026 SPLit8 • Sviluppato da 
            <a href="https://dwebcoding.github.io/Portfolio/index.html" target="_blank" rel="noopener noreferrer">DWebCoding</a>
          </p>
          <p style="margin: var(--space-sm) 0 0; font-size: 0.7rem; opacity: 0.6;">
            <a href="/pages/privacy.html">Privacy</a> • 
            <a href="/pages/terms.html">Termini</a> • 
            <a href="/pages/cookies.html">Cookie</a>
          </p>
        </div>
      </div>
    </footer>
  `;

  // Function to render footer
  function renderFooter() {
    const footerContainer = document.getElementById('footer-placeholder');
    if (footerContainer) {
      footerContainer.innerHTML = footerHTML;
    }
  }

  // Render footer when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFooter);
  } else {
    renderFooter();
  }

  // Export to window
  window.SPLit8Footer = { render: renderFooter };
})();
