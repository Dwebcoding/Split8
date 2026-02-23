/**
 * Hero Animations - SPLit8
 * Animates counter stats in hero section
 */

(function() {
  function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutCubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = Math.floor(start + (target - start) * easeProgress);
      element.textContent = currentValue + '+';
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target + '+';
      }
    }
    
    requestAnimationFrame(update);
  }

  function initCounters() {
    const counters = document.querySelectorAll('.hero__stat-value[data-count]');
    
    if (counters.length === 0) return;

    // Check if element is in viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const targetValue = parseInt(element.getAttribute('data-count'));
          
          if (targetValue) {
            animateCounter(element, targetValue);
            observer.unobserve(element);
          }
        }
      });
    }, {
      threshold: 0.5
    });

    counters.forEach(counter => {
      observer.observe(counter);
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }
})();
