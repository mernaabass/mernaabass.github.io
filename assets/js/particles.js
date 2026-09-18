/**
 * Hero Particles / Atoms Animation
 * Canvas-based floating dots connected by lines — matches Ahmed Sneed reference style
 * Color: rgba(37, 99, 235, ...) — blue accent
 */
(function () {
  "use strict";

  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const heroSection = document.getElementById("hero");

  const CONFIG = {
    particleCount: 55,
    maxRadius: 2.5,
    minRadius: 0.8,
    maxSpeed: 0.45,
    minSpeed: 0.1,
    connectionDistance: 130,
    maxConnections: 3,
    interactionRadius: 140,
    interactive: true,
  };

  let particles = [];
  let width = 0;
  let height = 0;
  let mouse = { x: -9999, y: -9999 };
  let resizeTimeout = null;

  function resize() {
    const section = heroSection || canvas.parentElement;
    width = canvas.width = section ? section.offsetWidth : window.innerWidth;
    height = canvas.height = section ? section.offsetHeight : window.innerHeight;
  }

  function createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = CONFIG.minSpeed + Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed);
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
      opacity: 0.3 + Math.random() * 0.5,
    };
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(createParticle());
    }
  }

  function update() {
    for (const p of particles) {
      if (CONFIG.interactive) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.interactionRadius && dist > 0) {
          const force = (CONFIG.interactionRadius - dist) / CONFIG.interactionRadius;
          p.vx += (dx / dist) * force * 0.08;
          p.vy += (dy / dist) * force * 0.08;
        }
      }

      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > CONFIG.maxSpeed) {
        p.vx = (p.vx / speed) * CONFIG.maxSpeed;
        p.vy = (p.vy / speed) * CONFIG.maxSpeed;
      }
      if (speed < CONFIG.minSpeed * 0.5) {
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = width + 10;
      else if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      else if (p.y > height + 10) p.y = -10;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      let connections = 0;
      for (let j = i + 1; j < particles.length && connections < CONFIG.maxConnections; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.connectionDistance) {
          const lineOpacity = (1 - dist / CONFIG.connectionDistance) * 0.35;
          ctx.beginPath();
          ctx.strokeStyle = "rgba(37, 99, 235, " + lineOpacity + ")";
          ctx.lineWidth = 0.7;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          connections++;
        }
      }
    }

    // Draw dots
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(37, 99, 235, " + p.opacity + ")";
      ctx.fill();

      if (p.r > 1.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(37, 99, 235, " + (p.opacity * 0.08) + ")";
        ctx.fill();
      }
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function trackMouse(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }

  function resetMouse() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  function init() {
    resize();
    initParticles();

    // Track mouse on entire hero section for better coverage
    var trackTarget = heroSection || canvas;
    trackTarget.addEventListener("mousemove", trackMouse, { passive: true });
    trackTarget.addEventListener("mouseleave", resetMouse, { passive: true });

    window.addEventListener("resize", function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        resize();
        initParticles();
      }, 200);
    });

    loop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
