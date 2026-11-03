import * as THREE from "three";

/**
 * Procedural canvas textures for the room. They keep the bundle tiny (no
 * image downloads) while giving surfaces the variation that makes them read
 * as real materials. Swap any of these for photo textures later if you like.
 */

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function toTexture(c: HTMLCanvasElement, opts: { srgb?: boolean; repeat?: [number, number] } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (opts.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
  if (opts.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...opts.repeat);
  }
  t.anisotropy = 8;
  return t;
}

/** Seeded PRNG so textures look the same on every load. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Warm hardwood strip flooring. */
export function woodFloorTexture() {
  const [c, ctx] = canvas(1024, 1024);
  const r = rng(7);
  const rows = 12;
  const rowH = c.height / rows;
  for (let i = 0; i < rows; i++) {
    let x = -r() * 400;
    while (x < c.width) {
      const len = 260 + r() * 420;
      const tone = 0.75 + r() * 0.35;
      ctx.fillStyle = `rgb(${Math.round(120 * tone)}, ${Math.round(66 * tone)}, ${Math.round(38 * tone)})`;
      ctx.fillRect(x, i * rowH, len, rowH);
      // grain
      for (let g = 0; g < 14; g++) {
        ctx.strokeStyle = `rgba(40, 18, 8, ${0.05 + r() * 0.12})`;
        ctx.lineWidth = 0.6 + r() * 1.4;
        ctx.beginPath();
        const y = i * rowH + r() * rowH;
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(x + len * 0.3, y + (r() - 0.5) * 6, x + len * 0.6, y + (r() - 0.5) * 6, x + len, y + (r() - 0.5) * 4);
        ctx.stroke();
      }
      // seam
      ctx.fillStyle = "rgba(25, 12, 6, 0.85)";
      ctx.fillRect(x, i * rowH, 2, rowH);
      x += len;
    }
    ctx.fillStyle = "rgba(25, 12, 6, 0.9)";
    ctx.fillRect(0, i * rowH, c.width, 2);
  }
  return toTexture(c, { repeat: [2.2, 2.2] });
}

/** Flat paint with faint roller texture. */
export function paintTexture(base: string, seed = 3) {
  const [c, ctx] = canvas(512, 512);
  const r = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) {
    const v = r() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${r() * 0.035})`;
    ctx.fillRect(r() * 512, r() * 512, 1 + r() * 3, 1 + r() * 3);
  }
  return toTexture(c, { repeat: [3, 2] });
}

/** Dark grey camo / ink-wash desk mat. */
export function camoMatTexture() {
  const [c, ctx] = canvas(1024, 512);
  const r = rng(11);
  ctx.fillStyle = "#2b2b2c";
  ctx.fillRect(0, 0, c.width, c.height);
  const tones = ["#4a4a48", "#1a1a1b", "#5f5d58", "#3a3937", "#737069"];
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = tones[Math.floor(r() * tones.length)];
    ctx.globalAlpha = 0.5 + r() * 0.5;
    ctx.beginPath();
    const x = r() * c.width;
    const y = r() * c.height;
    const n = 7;
    for (let k = 0; k <= n; k++) {
      const a = (k / n) * Math.PI * 2;
      const rad = 8 + r() * 34;
      ctx.lineTo(x + Math.cos(a) * rad * 1.6, y + Math.sin(a) * rad);
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // stitched edge
  ctx.strokeStyle = "#141414";
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, c.width - 10, c.height - 10);
  return toTexture(c);
}

/** IKEA-style pegboard: white with rounded vertical slots. */
export function pegboardTexture() {
  const [c, ctx] = canvas(512, 512);
  ctx.fillStyle = "#ecebe6";
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = "#2a2a28";
  for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 13; col++) {
      const x = 22 + col * 37 + (row % 2) * 18;
      const y = 18 + row * 45;
      if (x > 496) continue;
      ctx.beginPath();
      ctx.roundRect(x, y, 7, 24, 3.5);
      ctx.fill();
    }
  }
  return toTexture(c);
}

/** Night view through the window: dark yard, a couple of distant lights. */
export function nightWindowTexture() {
  const [c, ctx] = canvas(512, 512);
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#05070a");
  g.addColorStop(0.6, "#0a0d10");
  g.addColorStop(1, "#06080a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  // tree silhouettes
  ctx.fillStyle = "#020304";
  for (const [x, w] of [[90, 26], [380, 20]] as const) {
    ctx.fillRect(x, 160, w, 352);
    ctx.beginPath();
    ctx.ellipse(x + w / 2, 150, 120, 90, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // street lights with soft halos
  for (const [x, y, s] of [[300, 260, 26], [455, 245, 14], [205, 280, 9]] as const) {
    const h = ctx.createRadialGradient(x, y, 0, x, y, s);
    h.addColorStop(0, "rgba(255, 214, 150, 0.95)");
    h.addColorStop(0.25, "rgba(255, 190, 110, 0.35)");
    h.addColorStop(1, "rgba(255, 190, 110, 0)");
    ctx.fillStyle = h;
    ctx.fillRect(x - s, y - s, s * 2, s * 2);
  }
  return toTexture(c);
}

/** Lush abstract foliage art for the portrait monitor. */
export function foliageArtTexture() {
  const [c, ctx] = canvas(512, 900);
  const r = rng(21);
  const bg = ctx.createLinearGradient(0, 0, 0, 900);
  bg.addColorStop(0, "#0f3d2a");
  bg.addColorStop(1, "#06261a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 900);
  // warm glow in the middle
  const glow = ctx.createRadialGradient(256, 420, 10, 256, 420, 260);
  glow.addColorStop(0, "rgba(255, 150, 140, 0.75)");
  glow.addColorStop(0.5, "rgba(140, 120, 200, 0.35)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 512, 900);
  const greens = ["#1f7a3f", "#38a35a", "#5fd17a", "#9be59a", "#14592d", "#2e8b57"];
  for (let i = 0; i < 70; i++) {
    const x = r() * 512;
    const y = r() * 900;
    const s = 40 + r() * 90;
    const a = r() * Math.PI * 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillStyle = greens[Math.floor(r() * greens.length)];
    ctx.globalAlpha = 0.75 + r() * 0.25;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.55, 0, 0, s);
    ctx.quadraticCurveTo(-s * 0.55, 0, 0, -s);
    ctx.fill();
    ctx.strokeStyle = "rgba(10, 40, 20, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(0, s);
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  return toTexture(c);
}

/** Moody pagoda-street art print for the shelf. */
export function templeArtTexture() {
  const [c, ctx] = canvas(300, 420);
  const r = rng(5);
  ctx.fillStyle = "#18241d";
  ctx.fillRect(0, 0, 300, 420);
  for (let i = 0; i < 4; i++) {
    const y = 60 + i * 90;
    ctx.fillStyle = ["#2f4a35", "#3c5a3f", "#4b3a2c", "#2a3b30"][i];
    ctx.beginPath();
    ctx.moveTo(30, y + 30);
    ctx.lineTo(150, y - 10);
    ctx.lineTo(270, y + 30);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#121a15";
    ctx.fillRect(60, y + 30, 180, 55);
    for (let w = 0; w < 5; w++) {
      ctx.fillStyle = r() > 0.4 ? "rgba(255, 196, 120, 0.85)" : "#26332b";
      ctx.fillRect(72 + w * 34, y + 44, 18, 26);
    }
  }
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(80, 140, 90, ${0.3 + r() * 0.4})`;
    ctx.beginPath();
    ctx.arc(r() * 300, r() * 420, 6 + r() * 14, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTexture(c);
}

/** Generic print: vertical gradient with a big circle (manga covers, posters). */
export function coverTexture(top: string, bottom: string, accent: string, seed = 1) {
  const [c, ctx] = canvas(128, 192);
  const r = rng(seed);
  const g = ctx.createLinearGradient(0, 0, 0, 192);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 192);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(40 + r() * 50, 70 + r() * 50, 22 + r() * 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(10, 10, 108, 22);
  return toTexture(c);
}

/** Soft radial falloff, used as an alpha map for glows. */
export function radialAlphaTexture() {
  const [c, ctx] = canvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, "#000000");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return toTexture(c, { srgb: false });
}
