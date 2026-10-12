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

// Snow along the bottom of the page: layered flakes blown by gusting wind,
// settling onto a drift that slowly builds up where they land.
function startSnow() {
  const canvas = document.querySelector('.snow');
  const ctx = canvas.getContext('2d');
  const css = getComputedStyle(document.documentElement);
  const floral = css.getPropertyValue('--floral').trim();
  const bone = css.getPropertyValue('--bone').trim();
  const olive = css.getPropertyValue('--olive').trim();

  // Depth layers: far flakes are small, dim and slow; near ones are big, soft and fast.
  const LAYERS = [
    { share: 0.55, size: [0.6, 1.2], speed: [14, 22], alpha: 0.45, wind: 0.4, soft: 0.25 },
    { share: 0.35, size: [1.2, 2.2], speed: [24, 38], alpha: 0.75, wind: 0.7, soft: 0.45 },
    { share: 0.10, size: [2.6, 4.2], speed: [42, 62], alpha: 0.85, wind: 1.0, soft: 0.75 },
  ];
  const COL = 2;          // drift heightmap resolution, px per column
  const MAX_PILE = 26;    // how much the drift can grow from landed snow, px

  const rand = (a, b) => a + Math.random() * (b - a);
  let w, h, flakes = [], base = [], pile = [], sparkles = [], sprite;

  // A soft round flake, pre-rendered once and scaled per flake.
  function makeSprite() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.85)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return c;
  }

  function makeFlake(layer, anywhere) {
    const L = LAYERS[layer];
    return {
      layer,
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : rand(-20, -4),
      r: rand(...L.size),
      vy: rand(...L.speed),
      flutterAmp: rand(4, 14) * (0.5 + L.wind),   // side-to-side drift, px/s
      flutterFreq: rand(0.6, 1.6),
      phase: Math.random() * Math.PI * 2,
    };
  }

  const surfaceAt = x => {
    const i = Math.max(0, Math.min(base.length - 1, Math.round(x / COL)));
    return base[i] - pile[i];
  };

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Static rolling drift shape, with the landed-snow pile on top
    const cols = Math.ceil(w / COL) + 1;
    const seed = Math.random() * 100;
    base = Array.from({ length: cols }, (_, i) => {
      const x = i * COL;
      return h * 0.8
        - Math.sin(x * 0.0026 + seed) * h * 0.07
        - Math.sin(x * 0.0071 + seed * 2) * h * 0.035
        - Math.sin(x * 0.019 + seed * 3) * h * 0.012;
    });
    pile = new Array(cols).fill(0);

    const count = Math.round(w / 4.5);
    flakes = [];
    LAYERS.forEach((L, li) => {
      for (let n = 0; n < count * L.share; n++) flakes.push(makeFlake(li, true));
    });
    sparkles = Array.from({ length: Math.round(w / 28) }, () => ({
      x: Math.random() * w, dy: rand(1, 14), phase: Math.random() * 10, speed: rand(0.6, 1.8),
    }));
  }

  // Add landed snow around column i, spread like a small mound
  function land(x, amount) {
    const c = Math.round(x / COL);
    for (let k = -4; k <= 4; k++) {
      const i = c + k;
      if (i < 0 || i >= pile.length) continue;
      pile[i] = Math.min(MAX_PILE, pile[i] + amount * (1 - Math.abs(k) / 5));
    }
  }

  // Gusting wind: a few slow sine waves layered, in px/s (positive = rightward)
  const windAt = s => 10 + Math.sin(s * 0.11) * 14 + Math.sin(s * 0.37 + 1) * 7 + Math.sin(s * 0.9) * 2;

  let last = 0;
  function frame(t) {
    const s = t / 1000;
    const dt = Math.min(0.05, (t - last) / 1000 || 0);
    last = t;
    const wind = windAt(s);
    ctx.clearRect(0, 0, w, h);

    // Settle the pile: smooth neighbors so it never looks spiky
    for (let i = 1; i < pile.length - 1; i++) pile[i] = pile[i] * 0.96 + (pile[i - 1] + pile[i + 1]) * 0.02;

    const drawFlake = f => {
      const L = LAYERS[f.layer];
      f.y += f.vy * dt;
      f.x += (wind * L.wind + Math.sin(s * f.flutterFreq + f.phase) * f.flutterAmp) * dt;
      if (f.x > w + 10) f.x -= w + 20;
      if (f.x < -10) f.x += w + 20;

      const ground = surfaceAt(f.x);
      if (f.y >= ground) {
        if (f.layer > 0) land(f.x, f.r * 0.3); // only nearer flakes visibly add to the drift
        Object.assign(f, makeFlake(f.layer, false));
        return;
      }
      // Fade in from the top of the band; far flakes also fade before reaching the drift
      let a = L.alpha * Math.min(1, f.y / (h * 0.4));
      if (f.layer === 0) a *= Math.min(1, (ground - f.y) / 20);
      const size = f.r * (2 + L.soft * 2);
      ctx.globalAlpha = Math.max(0, a);
      ctx.drawImage(sprite, f.x - size, f.y - size, size * 2, size * 2);
    };

    // Far and mid flakes fall behind the drift, near flakes in front of it
    for (const f of flakes) if (f.layer < 2) drawFlake(f);

    // The drift: solid snow, bright on top and shading into blue-grey below
    ctx.globalAlpha = 1;
    let top = h;
    for (let i = 0; i < base.length; i++) top = Math.min(top, base[i] - pile[i]);
    const grad = ctx.createLinearGradient(0, top, 0, h);
    grad.addColorStop(0, floral);
    grad.addColorStop(0.35, '#d5dce8');
    grad.addColorStop(0.75, bone);
    grad.addColorStop(1, olive);
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i < base.length; i++) ctx.lineTo(i * COL, base[i] - pile[i]);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Soft glow along the crest
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = floral;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < base.length; i++) ctx.lineTo(i * COL, base[i] - pile[i] + 0.5);
    ctx.stroke();
    ctx.restore();

    // Twinkling ice crystals in the snow surface
    ctx.fillStyle = '#ffffff';
    for (const p of sparkles) {
      const tw = Math.max(0, Math.sin(s * p.speed + p.phase));
      if (tw < 0.85) continue;
      ctx.globalAlpha = (tw - 0.85) / 0.15;
      const y = surfaceAt(p.x) + p.dy;
      ctx.fillRect(p.x - 0.5, y - 2, 1, 4);
      ctx.fillRect(p.x - 2, y - 0.5, 4, 1);
    }

    for (const f of flakes) if (f.layer === 2) drawFlake(f);
    ctx.globalAlpha = 1;

    if (!reduceMotion) requestAnimationFrame(frame);
  }

  sprite = makeSprite();
  resize();
  addEventListener('resize', () => { resize(); if (reduceMotion) frame(0); });
  requestAnimationFrame(frame);
}

document.fonts.ready.then(renderName);
startSnow();
