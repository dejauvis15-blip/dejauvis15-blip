/**
 * The desktop wallpaper is drawn twice: once onto a canvas texture for the
 * 3D monitor, and once as CSS for the DOM desktop. Keeping both here makes
 * the hand-off between them seamless when the camera finishes zooming.
 */
export const WALLPAPER = {
  base: "#0f0c29",
  glows: [
    // [x%, y%, radius as fraction of width, color]
    [0.18, 0.2, 0.75, "rgba(99, 102, 241, 0.85)"],
    [0.85, 0.3, 0.6, "rgba(236, 72, 153, 0.65)"],
    [0.6, 1.0, 0.8, "rgba(249, 115, 22, 0.55)"],
  ] as [number, number, number, string][],
};

export const wallpaperCss = () =>
  [
    ...WALLPAPER.glows.map(
      ([x, y, r, c]) => `radial-gradient(circle at ${x * 100}% ${y * 100}%, ${c} 0%, transparent ${r * 100}%)`,
    ),
    WALLPAPER.base,
  ].join(", ");

export function drawWallpaper(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = WALLPAPER.base;
  ctx.fillRect(0, 0, w, h);
  for (const [x, y, r, c] of WALLPAPER.glows) {
    const g = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * Math.hypot(w, h) * 0.72);
    g.addColorStop(0, c);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}
