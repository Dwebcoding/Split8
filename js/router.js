/* ===========================
   SPA ROUTER & PAGE TRANSITIONS
   Navigazione fluida senza reload
   =========================== */

class SPARouter {
  constructor() {
    // Detetta se siamo su GitHub Pages e ottieni il base path
    const path = window.location.pathname;
    this.basePath = path.includes('/SPLit') ? '/SPLit' : '';
    
    this.currentPage = path;
    this.isTransitioning = false;
    this.cache = new Map();
    
    this.init();
  }
  
  init() {
    // Intercetta tutti i click sui link interni
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
      e.preventDefault();
      const url = this.resolveUrl(href);
      if (url !== this.currentPage) this.navigateTo(url);
    });

    // Supporta back/forward
    window.addEventListener('popstate', () => {
      const url = window.location.pathname;
      this.navigateTo(url);
    });
  }

  async navigateTo(url) {
    if (this.isTransitioning) return;
    const fullUrl = this.resolveUrl(url);
    if (fullUrl === this.currentPage) return;
    this.isTransitioning = true;

    // Anima particelle
    if (window.particleSkyline) {
      window.particleSkyline.triggerTransition();
    }

    // Precarica nuova pagina (usa cache quando disponibile)
    let html;
    if (this.cache.has(fullUrl)) {
      html = this.cache.get(fullUrl);
    } else {
      const response = await fetch(fullUrl);
      if (!response.ok) {
        this.isTransitioning = false;
        return window.location.assign(fullUrl);
      }
      html = await response.text();
      this.cache.set(fullUrl, html);
    }

    // Parse del nuovo documento
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const incomingPage = doc.querySelector('.page');
    if (!incomingPage) {
      this.isTransitioning = false;
      return window.location.assign(fullUrl);
    }

    // Crea overlay di staging e inserisci nuova pagina
    const staging = document.createElement('div');
    staging.className = 'page-staging';
    const stagedPage = incomingPage.cloneNode(true);
    const stagedNavbar = stagedPage.querySelector('.navbar');
    const stagedFooter = stagedPage.querySelector('.footer');
    const stagedBanners = stagedPage.querySelectorAll('.banner');
    if (stagedNavbar) stagedNavbar.classList.add('transiting-in');
    stagedPage.classList.add('transiting-in');
    if (stagedFooter) stagedFooter.classList.add('transiting-in');
    stagedBanners.forEach(b => b.classList.add('transiting-in'));
    staging.appendChild(stagedPage);
    document.body.appendChild(staging);

    // Applica classi di uscita alla pagina corrente
    const currentNavbar = document.querySelector('.navbar');
    const currentPage = document.querySelector('.page');
    const currentFooter = document.querySelector('.footer');
    const currentBanners = document.querySelectorAll('.banner');
    if (currentNavbar) currentNavbar.classList.add('transiting-out');
    if (currentPage) currentPage.classList.add('transiting-out');
    if (currentFooter) currentFooter.classList.add('transiting-out');
    currentBanners.forEach(b => b.classList.add('transiting-out'));

    // Esegui animazioni in parallelo
    await this.sleep(560);

    // Applica realmente il nuovo contenuto
    await this.loadPage(fullUrl, true);
    this.currentPage = fullUrl;

    // Ripulisci overlay e classi
    staging.remove();
    const newNavbar = document.querySelector('.navbar');
    const newPage = document.querySelector('.page');
    const newFooter = document.querySelector('.footer');
    const newBanners = document.querySelectorAll('.banner');
    if (newNavbar) newNavbar.classList.remove('transiting-out', 'transiting-in');
    if (newPage) newPage.classList.remove('transiting-out', 'transiting-in');
    if (newFooter) newFooter.classList.remove('transiting-out', 'transiting-in');
    newBanners.forEach(b => b.classList.remove('transiting-out', 'transiting-in'));

    this.isTransitioning = false;
  }
  
  async loadPage(url, pushState = true) {
    try {
      let html;
      
      // Usa cache se disponibile
      if (this.cache.has(url)) {
        html = this.cache.get(url);
      } else {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Page not found');
        html = await response.text();
        this.cache.set(url, html);
      }
      
      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Aggiorna contenuto
      const newPage = doc.querySelector('.page');
      const currentPage = document.querySelector('.page');
      
      if (newPage && currentPage) {
        // Mantieni navbar e sostituisci solo il contenuto main
        const newMain = newPage.querySelector('main') || newPage.querySelector('section');
        const currentMain = currentPage.querySelector('main') || currentPage.querySelector('section');
        
        if (newMain && currentMain) {
          currentMain.innerHTML = newMain.innerHTML;
        } else {
          // Sostituisci tutta la pagina eccetto navbar
          const navbar = currentPage.querySelector('.navbar');
          currentPage.innerHTML = newPage.innerHTML;
          if (navbar && currentPage.querySelector('.navbar')) {
            currentPage.querySelector('.navbar').replaceWith(navbar);
          }
        }
      }
      
      // Aggiorna title
      const newTitle = doc.querySelector('title');
      if (newTitle) {
        document.title = newTitle.textContent;
      }
      
      // Aggiorna history
      if (pushState) {
        history.pushState({ page: url }, '', url);
      }
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Re-inizializza event listeners per nuovo contenuto
      this.reinitializeScripts();
      
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback a navigazione normale
      window.location.href = url;
    }
  }
  
  resolveUrl(url) {
    let resolved = url;
    
    // Se è un URL relativo da pages/, gestiscilo
    if (resolved.startsWith('pages/')) {
      resolved = '/' + resolved;
    } else if (resolved.startsWith('../')) {
      resolved = resolved.replace('../', '/');
    } else if (!resolved.startsWith('/')) {
      resolved = '/' + resolved;
    }
    
    // Aggiungi basePath se non è già presente
    if (!resolved.startsWith(this.basePath)) {
      resolved = this.basePath + resolved;
    }
    
    return resolved;
  }
  
  reinitializeScripts() {
    // Re-inizializza componenti che potrebbero essere stati aggiunti
    if (window.AuthModal) {
      new window.AuthModal();
    }
    if (window.ScrollAnimator) {
      new window.ScrollAnimator();
    }
    if (window.initListings) {
      window.initListings();
    }
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Inizializza router quando DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.spaRouter = new SPARouter();
  });
} else {
  window.spaRouter = new SPARouter();
}
