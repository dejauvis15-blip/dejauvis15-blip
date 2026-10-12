const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Draw the name as a grid of square "pixels" for a bitmap look.
function renderName() {
  const el = document.querySelector('.name');
  const canvas = el.querySelector('.name-canvas');
  const rect = el.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.ceil(rect.width), h = Math.ceil(rect.height);
  if (!w || !h) return;

  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const o = off.getContext('2d');
  const style = getComputedStyle(el);
  o.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  o.textBaseline = 'middle';
  o.fillText(el.querySelector('.name-text').textContent, 0, h / 2 + 1);
  const data = o.getImageData(0, 0, w, h).data;

  canvas.width = w * dpr; canvas.height = h * dpr;
  const c = canvas.getContext('2d');
  c.scale(dpr, dpr);
  c.fillStyle = style.color;
  const step = 1.5;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const a = data[(Math.floor(y) * w + Math.floor(x)) * 4 + 3];
      if (a > 110) c.fillRect(x, y, step * 0.82, step * 0.82);
    }
  }
  el.classList.add('rendered');
}

// Snow falling along the bottom: flakes drift down onto a halftone snowbank.
function startSnow() {
  const canvas = document.querySelector('.snow');
  const ctx = canvas.getContext('2d');
  const css = getComputedStyle(document.documentElement);
  const moon = css.getPropertyValue('--moonlight').trim();
  const frost = css.getPropertyValue('--frost').trim();
  const gap = 4;
  let w, h, flakes = [];

  function makeFlake(anywhere) {
    const z = Math.random(); // depth: 0 = far, 1 = near
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -10,
      r: 0.6 + z * 1.8,
      vy: 12 + z * 30,          // px per second
      sway: Math.random() * Math.PI * 2,
      alpha: 0.35 + z * 0.6,
    };
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(w / 6);
    flakes = Array.from({ length: count }, () => makeFlake(true));
  }

  // Height of the snowbank surface at x (slow rolling drifts)
  const surface = (x, s) => h * 0.62
    + Math.sin(x * 0.0035 + s * 0.08) * h * 0.08
    + Math.sin(x * 0.012 + 1.7) * h * 0.035;

  let last = 0;
  function frame(t) {
    const s = t / 1000;
    const dt = Math.min(0.05, (t - last) / 1000 || 0);
    last = t;
    ctx.clearRect(0, 0, w, h);

    // Snowbank as halftone dots, brighter on top, settling into frost blue below
    for (let x = 0; x < w; x += gap) {
      const top = surface(x, s);
      for (let y = Math.floor(top / gap) * gap; y < h; y += gap) {
        if (y < top) continue;
        const depth = (y - top) / (h - top + 1);
        const shade = 0.55 + 0.25 * Math.sin(x * 0.02 + y * 0.04) + 0.2 * Math.sin(x * 0.007 - y * 0.06);
        const edge = Math.min(1, (y - top) / 10);
        const r = (0.3 + 0.7 * shade * (1 - depth * 0.5)) * edge * gap * 0.45;
        if (r < 0.25) continue;
        ctx.fillStyle = depth < 0.35 ? moon : frost;
        ctx.globalAlpha = 0.9 - depth * 0.45;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Falling flakes, fading in from the top of the band
    ctx.fillStyle = moon;
    for (const f of flakes) {
      f.y += f.vy * dt;
      f.x += Math.sin(s * 0.8 + f.sway) * 0.25;
      if (f.y > surface(f.x, s) + 4 || f.x < -5 || f.x > w + 5) Object.assign(f, makeFlake(false));
      ctx.globalAlpha = f.alpha * Math.min(1, f.y / (h * 0.35));
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!reduceMotion) requestAnimationFrame(frame);
  }

  resize();
  addEventListener('resize', () => { resize(); if (reduceMotion) frame(0); });
  requestAnimationFrame(frame);
}

document.fonts.ready.then(renderName);
startSnow();
