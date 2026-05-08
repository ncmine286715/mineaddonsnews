/**
 * VISUAL EFFECTS
 * =====================
 * Efeitos visuais otimizados (3D tilt, partículas, chuva de blocos)
 * Com throttle para evitar travamentos
 */

import { UI_CONFIG, MINECRAFT_BLOCKS } from '../config.js';

// Detectar se é mobile
const isMobile = window.innerWidth < 768;

/**
 * Aplica efeito 3D tilt ao card com throttle
 * Desabilita em telas touch para evitar cálculos desnecessários
 * @param {HTMLElement} card - Elemento do card
 */
export function apply3DTilt(card) {
  // Desabilitar em telas touch (celulares, tablets)
  if (window.matchMedia('(pointer: coarse)').matches) {
    return; // Não aplicar efeito em telas touch
  }

  let lastUpdateTime = 0;
  let rafId = null;

  card.addEventListener('mousemove', (e) => {
    const now = Date.now();
    
    // Throttle: atualizar no máximo a cada 16ms (~60fps)
    if (now - lastUpdateTime < UI_CONFIG.CARD_TILT_THROTTLE_MS) {
      return;
    }
    
    lastUpdateTime = now;

    if (rafId) cancelAnimationFrame(rafId);
    
    rafId = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const rotY = ((x - cx) / cx) * UI_CONFIG.CARD_TILT_MAX_ROTATION_Y;
      const rotX = ((cy - y) / cy) * UI_CONFIG.CARD_TILT_MAX_ROTATION_X;
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      card.style.transform = `translateY(${UI_CONFIG.CARD_TILT_TRANSLATE_Y}px) scale(${UI_CONFIG.CARD_TILT_SCALE}) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      card.style.transition = 'transform 0.05s ease-out, box-shadow 0.3s';
      card.style.setProperty('--glare-x', glareX + '%');
      card.style.setProperty('--glare-y', glareY + '%');
      card.style.setProperty('--glare-opacity', '0.12');

      const img = card.querySelector('.card-image');
      if (img) {
        img.style.transform = `scale(1.12) translateX(${(x - cx) * 0.03}px) translateY(${(y - cy) * 0.03}px)`;
      }
    });
  });

  card.addEventListener('mouseleave', () => {
    if (rafId) cancelAnimationFrame(rafId);
    
    card.style.transform = 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)';
    card.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s';
    card.style.setProperty('--glare-opacity', '0');

    const img = card.querySelector('.card-image');
    if (img) {
      img.style.transform = '';
      img.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    }
  });
}

/**
 * Inicializa partículas animadas no canvas
 * Reduzido em dispositivos móveis e pausado quando aba não está visível
 */
export function initializeParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  let animationId = null;
  let isPaused = false;

  // Detectar se é mobile
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 30 : UI_CONFIG.PARTICLES_COUNT;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 1.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 200, 83, ${this.alpha})`;
      ctx.fill();
    }
  }

  // Criar partículas (reduzido em mobile)
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Pausar animação quando aba não está visível
  const handleVisibilityChange = () => {
    isPaused = document.hidden;
    if (!isPaused && animationId === null) {
      animate();
    } else if (isPaused && animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  function animate() {
    if (isPaused) {
      animationId = null;
      return;
    }

    ctx.clearRect(0, 0, w, h);
    
    // Atualizar e desenhar partículas
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Desenhar conexões entre partículas próximas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < UI_CONFIG.PARTICLES_CONNECTION_DISTANCE) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,200,83,${0.06 * (1 - dist / UI_CONFIG.PARTICLES_CONNECTION_DISTANCE)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  animate();

  console.log('✅ Partículas inicializadas');

  // Retornar função para parar animação se necessário
  return () => {
    if (animationId) cancelAnimationFrame(animationId);
  };
}

/**
 * Cria efeito de chuva de blocos
 * Desabilita em telas pequenas (< 768px) para melhor performance
 */
export function spawnBlockRain() {
  const container = document.getElementById('blockRain');
  if (!container) return;

  // Desabilitar chuva de blocos em telas menores que 768px
  if (window.innerWidth < 768) {
    console.log('📱 Chuva de blocos desabilitada em mobile');
    return;
  }

  const count = window.innerWidth < 600 ? UI_CONFIG.BLOCK_RAIN_COUNT_MOBILE : UI_CONFIG.BLOCK_RAIN_COUNT_DESKTOP;
  const vw = window.innerWidth;

  for (let i = 0; i < count; i++) {
    const src = MINECRAFT_BLOCKS[Math.floor(Math.random() * MINECRAFT_BLOCKS.length)];
    const size = 44 + Math.floor(Math.random() * 32);
    const block = document.createElement('div');
    block.className = 'rain-block';

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'block';
    img.width = size;
    img.height = size;
    block.appendChild(img);

    const x = Math.random() * (vw - size);
    const initRot = (Math.random() - 0.5) * 40;
    const finalRot = initRot + (Math.random() - 0.5) * 120;
    const duration = 0.7 + Math.random() * 0.7;
    const delay = i * 0.07;
    const targetY = 70 + Math.random() * (window.innerHeight * 0.55);
    const bounceBack = 12 + Math.random() * 22;

    block.style.cssText = `
      left: ${x}px;
      width: ${size}px;
      height: ${size}px;
      transform: translateY(-120px) rotate(${initRot}deg);
      opacity: 0;
      transition: transform ${duration}s cubic-bezier(0.34,1.46,0.64,1) ${delay}s,
                  opacity 0.12s ease ${delay}s;
    `;

    container.appendChild(block);

    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        block.style.transform = `translateY(${targetY}px) rotate(${finalRot}deg)`;
        block.style.opacity = '1';
      });
    });

    // Bounce effect
    setTimeout(() => {
      block.style.transition = 'transform 0.22s ease-out, opacity 0.35s ease';
      block.style.transform = `translateY(${targetY - bounceBack}px) rotate(${finalRot - 5}deg)`;
      
      setTimeout(() => {
        block.style.transition = 'transform 0.12s ease-out, opacity 0.25s ease';
        block.style.transform = `translateY(${targetY}px) rotate(${finalRot}deg)`;
      }, 220);
    }, (delay + duration) * 1000 + 120);

    // Remove after animation
    setTimeout(() => {
      block.remove();
    }, 4500);
  }

  // Clear container after all animations
  setTimeout(() => {
    if (container) container.innerHTML = '';
  }, 4500);

  console.log('✅ Chuva de blocos iniciada');
}

/**
 * Cria partículas de download com throttle
 * @param {HTMLElement} origin - Elemento de origem
 */
export function spawnDownloadParticles(origin) {
  // Limitar em mobile
  if (isMobile) return;
  const rect = origin.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const emojis = ['⬇️', '✅', '🎉', '⚡', '💚'];

  const particleCount = isMobile ? 3 : 7;
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const tx = (Math.random() - 0.5) * 120;
    const ty = -40 - Math.random() * 80;

    p.style.cssText = `
      position: fixed;
      left: ${cx}px;
      top: ${cy}px;
      font-size: ${0.9 + Math.random() * 0.6}rem;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      animation: dlParticle 0.8s ease-out forwards;
      --tx: ${tx}px;
      --ty: ${ty}px;
    `;
    p.textContent = emoji;
    document.body.appendChild(p);

    setTimeout(() => p.remove(), 900);
  }

  console.log('✨ Partículas de download criadas');
  }
}
