// i18n (Internationalization) placeholder
// Sistema di traduzione per supporto multilingua

const translations = {
  it: {
    nav_search: "Cerca",
    nav_publish: "Pubblica",
    nav_companies: "Aziende",
    nav_pricing: "Pricing",
    nav_signup: "Inizia ora",
    // Add more translations as needed
  },
  en: {
    nav_search: "Search",
    nav_publish: "Publish",
    nav_companies: "Companies",
    nav_pricing: "Pricing",
    nav_signup: "Get Started",
    // Add more translations as needed
  }
};

let currentLang = 'it';

function setLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });
  localStorage.setItem('preferred_language', lang);
}

// Auto-detect language on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('preferred_language') || 'it';
  setLanguage(savedLang);
  
  // Language switcher buttons
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
      
      // Update active state
      document.querySelectorAll('.lang-toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.i18n = { setLanguage, translations };
}
