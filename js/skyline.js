/* ===========================
   SKYLINE ANIMATION
   Particle constellation - Wix AI style
   =========================== */

class ParticleSkyline {
  constructor() {
    this.canvas = document.getElementById('skyline-canvas');
    if (!this.canvas) {
      console.error('Canvas not found!');
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.pointer = { x: 0, y: 0 };
    this.scrollOffset = 0;
    this.scrollTarget = 0;
    this.time = 0;
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.isExpanding = false;
    this.expandProgress = 0;
    
    this.resize();
    this.mouse.x = this.width / 2;
    this.mouse.y = this.height / 2;
    this.pointer.x = this.width / 2;
    this.pointer.y = this.height / 2;
    this.createParticles();
    this.setupEvents();
    this.animate();
    
    // Rendi disponibile globalmente per router
    window.particleSkyline = this;
    
    console.log('✅ ParticleSkyline initialized with', this.particles.length, 'particles');
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
  
  createParticles() {
    const count = Math.floor((this.width * this.height) / 8000);
    
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        baseX: Math.random() * this.width,
        baseY: Math.random() * this.height,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        hue: Math.random() * 60 + 180, // 180-240 (blue range)
        speed: Math.random() * 0.003 + 0.001,
        angle: Math.random() * Math.PI * 2,
        orbitRadius: Math.random() * 30 + 20,
      });
    }
  }
  
  setupEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.particles = [];
      this.createParticles();
    });
    
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('scroll', () => {
      this.scrollTarget = window.scrollY;
    });
  }
  
  drawParticle(particle) {
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = `hsla(${particle.hue}, 80%, 70%, ${particle.opacity})`;
    this.ctx.fill();
  }
  
  drawLine(p1, p2, distance, maxDistance) {
    const opacity = (1 - distance / maxDistance) * 0.2;
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.strokeStyle = `rgba(86, 180, 255, ${opacity})`;
    this.ctx.lineWidth = 0.5;
    this.ctx.stroke();
  }
  
  updateParticle(particle) {
    // Durante transizione, converti particelle verso il centro in modo fluido
    if (this.isTransitioning && !particle.isNew) {
      // Fase 1 (0-0.5): Convergenza verso centro
      // Fase 2 (0.5-1): Fade out totale
      const convergenceFactor = Math.min(this.transitionProgress * 2, 1);
      const fadeProgress = Math.max((this.transitionProgress - 0.3) / 0.7, 0);
      
      // Attira particelle verso il centro
      particle.baseX += (this.width / 2 - particle.baseX) * convergenceFactor * 0.05;
      particle.baseY += (this.height / 2 - particle.baseY) * convergenceFactor * 0.05;
      
      // Fade out morbido
      particle.opacity *= (1 - fadeProgress * 0.03);
    }
    
    // Orbital movement - smooth floating (saltato durante espansione)
    if (!this.isExpanding || !particle.isNew) {
      particle.angle += particle.speed;
      
      particle.x = particle.baseX + Math.cos(particle.angle) * particle.orbitRadius;
      particle.y = particle.baseY + Math.sin(particle.angle) * particle.orbitRadius;
    }
    
    // Durante espansione, le particelle si riaprono dal centro verso le loro basi
    if (this.isExpanding && particle.isNew) {
      const easeOutProgress = 1 - Math.pow(1 - this.expandProgress, 3);
      particle.x = (this.width / 2) + (particle.baseX - this.width / 2) * easeOutProgress;
      particle.y = (this.height / 2) + (particle.baseY - this.height / 2) * easeOutProgress;
    }

    // Influence from mouse position (stronger parallax)
    const mouseOffsetX = (this.pointer.x - this.width / 2) * 0.008;
    const mouseOffsetY = (this.pointer.y - this.height / 2) * 0.007;
    particle.x += mouseOffsetX;
    particle.y += mouseOffsetY;

    // Influence from scroll (vertical drift)
    const scrollInfluence = this.scrollOffset * 0.01;
    particle.y += scrollInfluence;
    
    // Additional wave effect for organic feel
    const wave = Math.sin(this.time * 0.001 + particle.baseX * 0.001) * 15;
    particle.y += wave;
    
    // Pulse opacity
    particle.opacity = 0.3 + Math.sin(this.time * 0.002 + particle.baseX) * 0.2;
  }
  
  animate() {
    this.time++;

    // smussa puntatore e scroll per evitare jitter (smoothing ridotto = più reattivo)
    this.pointer.x += (this.mouse.x - this.pointer.x) * 0.12;
    this.pointer.y += (this.mouse.y - this.pointer.y) * 0.12;
    this.scrollOffset += (this.scrollTarget - this.scrollOffset) * 0.12;
    
    // Clear with fade effect
    this.ctx.fillStyle = 'rgba(15, 15, 15, 0.05)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Update and draw particles
    this.particles.forEach(particle => {
      this.updateParticle(particle);
      this.drawParticle(particle);
    });
    
    // Draw connections
    const maxDistance = 150;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          this.drawLine(this.particles[i], this.particles[j], distance, maxDistance);
        }
      }
    }
    
    requestAnimationFrame(() => this.animate());
  }
  
  triggerTransition() {
    this.isTransitioning = true;
    this.transitionProgress = 0;
    
    const oldParticles = [...this.particles];
    let newParticles = [];
    const transitionDuration = 0.04;

    const animate = () => {
      this.transitionProgress += transitionDuration;
    
      // A metà transizione, crea nuove particelle dal centro
      if (this.transitionProgress >= 0.5 && newParticles.length === 0) {
        const count = oldParticles.length;
        for (let i = 0; i < count; i++) {
          newParticles.push({
            x: this.width / 2,
            y: this.height / 2,
            baseX: Math.random() * this.width,
            baseY: Math.random() * this.height,
            radius: Math.random() * 2 + 1,
            opacity: 0,
            hue: Math.random() * 60 + 180,
            speed: Math.random() * 0.003 + 0.001,
            angle: Math.random() * Math.PI * 2,
            orbitRadius: Math.random() * 30 + 20,
            isNew: true
          });
        }
        this.particles = [...oldParticles, ...newParticles];
      }
      
      // Fade in nuove particelle (0.5-1)
      if (this.transitionProgress > 0.5) {
        const fadeInProgress = (this.transitionProgress - 0.5) * 2;
        newParticles.forEach(p => {
          p.opacity = (0.3 + Math.sin(this.time * 0.002 + p.baseX) * 0.2) * fadeInProgress;
        });
      }
    
      if (this.transitionProgress >= 1) {
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.particles = newParticles.length > 0 ? newParticles : this.particles;
        this.particles.forEach(p => {
          p.opacity = 0.3 + Math.sin(this.time * 0.002 + p.baseX) * 0.2;
        });
        // Avvia fase di espansione
        this.startExpanding();
      } else {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }
  
  startExpanding() {
    this.isExpanding = true;
    this.expandProgress = 0;
    const expandDuration = 0.035; // ~350ms
    
    const animate = () => {
      this.expandProgress += expandDuration;
      
      if (this.expandProgress >= 1) {
        this.isExpanding = false;
        this.expandProgress = 0;
        this.particles.forEach(p => p.isNew = false);
      } else {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new ParticleSkyline();
});
