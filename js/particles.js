// ============================================================
// particles.js — Animated background particle field on canvas
// ============================================================

let canvas, ctx, dots = [], raf = null, enabled = true, dpr = 1;

function rand(min, max) { return Math.random() * (max - min) + min; }

function createParticle(w, h) {
  return {
    x: rand(0, w),
    y: rand(0, h),
    vx: rand(-0.25, 0.25),
    vy: rand(-0.25, 0.25),
    r: rand(1, 2.5),
    alpha: rand(0.2, 0.7),
    hue: rand(0, 1) > 0.5 ? 'accent' : 'accent2',
  };
}

function getColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: styles.getPropertyValue('--accent').trim() || '#7c5cff',
    accent2: styles.getPropertyValue('--accent-2').trim() || '#3da9ff',
  };
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(n, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 22000));
  dots = Array.from({ length: count }, () => createParticle(window.innerWidth, window.innerHeight));
}

function tick() {
  if (!enabled) { raf = null; return; }
  const w = window.innerWidth, h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);
  const colors = getColors();
  const c1 = hexToRgb(colors.accent);
  const c2 = hexToRgb(colors.accent2);

  dots.forEach((p) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
    const c = p.hue === 'accent' ? c1 : c2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${p.alpha})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = `rgba(${c.r},${c.g},${c.b},0.6)`;
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  // connect nearby particles
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x;
      const dy = dots[i].y - dots[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < 120) {
        const a = (1 - dist / 120) * 0.15;
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(dots[j].x, dots[j].y);
        ctx.strokeStyle = `rgba(${c1.r},${c1.g},${c1.b},${a})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
  raf = requestAnimationFrame(tick);
}

export const particles = {
  init(el, on) {
    canvas = el;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    enabled = !!on;
    resize();
    window.addEventListener('resize', resize);
    if (enabled) raf = requestAnimationFrame(tick);
  },
  setEnabled(on) {
    enabled = !!on;
    canvas.style.display = enabled ? 'block' : 'none';
    if (enabled && !raf) raf = requestAnimationFrame(tick);
    if (!enabled && raf) { cancelAnimationFrame(raf); raf = null; ctx && ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
  },
};
