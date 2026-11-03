# Jauvis Dozier — 3D Room Portfolio

An interactive 3D bedroom built with Next.js, React Three Fiber and GSAP.

- **Monitor** → click it and the camera glides in to the screen, where my dev portfolio ([jauvis.dev](https://www.jauvis.dev)) is running live and fully clickable.
- **Poster** → the big framed poster on the wall shows my [design portfolio](https://jauvis-dozier-portfolio.vercel.app/) live. Click it to zoom in and browse.
- **Room view** → subtle mouse parallax, soft shadows, desk lamp, LED strip, dust particles.
- Leave a screen with **← Back to room**, **Esc**, or by clicking anywhere in the room around it.
- On phones, zooming into a screen hands off to a full-screen view of that page.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · React Three Fiber · Three.js · Drei · GSAP · Zustand

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Where things live

| Path | What |
| --- | --- |
| `lib/scene-config.ts` | Camera poses, screen positions/sizes, what each screen loads, timing |
| `lib/content.ts` | Profile, projects, experience, contact (used by the desktop-OS mode) |
| `components/scene/PlaceholderRoom.tsx` | Primitive stand-in room (walls, desk, chair, bed, plant…) |
| `components/scene/Monitor.tsx` | Interactive monitor (hover glow, click to zoom) |
| `components/scene/DesignPoster.tsx` | Interactive poster with the design portfolio |
| `components/scene/LiveScreen.tsx` | Maps a real web page onto a 3D surface |
| `components/scene/CameraRig.tsx` | Intro fly-in, parallax and GSAP zoom choreography |
| `components/ScreenControls.tsx` | Back-to-room bar, Esc handling, phone full-screen fallback |
| `components/desktop/*` | Optional desktop-OS portfolio (draggable windows, dock, apps) |
| `public/site/` | Copy of the Dev-Portfolio site shown on the monitor |

## Updating the site on the monitor

The monitor serves a copy of the [Dev-Portfolio](https://github.com/dejauvis15-blip/Dev-Portfolio-) repo from `public/site` (same origin, so it always embeds). After changing that repo:

```bash
npm run sync-site -- /path/to/Dev-Portfolio-
```

Prefer to load the live site instead? Set `SCREENS.monitor.url` to `https://www.jauvis.dev`. That only works if the site doesn't send `X-Frame-Options` / `frame-ancestors` headers that block framing.

## Monitor content: live site or desktop OS

`MONITOR_CONTENT` in `lib/scene-config.ts` switches what you see when you sit down:

- `"site"` (default): the dev portfolio, live inside the 3D monitor.
- `"desktop"`: a desktop-style OS with draggable windows for Projects, About, Experience, Resume and Contact (content in `lib/content.ts`).

## Swapping in the Blender room

1. Model the room at real-world scale (1 Blender unit = 1 m). Put the back wall behind the desk toward +Y in Blender (the glTF exporter turns Blender +Y into three.js −Z) and have the monitor screen and poster face the camera.
2. Leave the monitor's screen surface and the poster's print as their own objects, or delete them: the app renders those itself so they stay interactive. A mesh named `MonitorScreen` is hidden automatically.
3. Bake lighting into textures if you can (Cycles → Bake → Combined), which is far cheaper than real-time lights.
4. Export **glTF Binary (.glb)** with *Apply Modifiers* and *+Y Up*, then compress it:
   ```bash
   npx @gltf-transform/cli optimize room.glb public/models/room.glb --texture-compress webp
   ```
5. Set `SCENE.roomModelUrl = "/models/room.glb"` in `lib/scene-config.ts`.
6. Line up `SCREENS.monitor.center/size` and `SCREENS.poster.center/size` with the model (a Blender location `(x, y, z)` becomes `[x, z, -y]` here), then tune `CAMERA.room`.

## Deploying to Vercel

Import the repository in Vercel and set **Root Directory** to `portfolio`. Everything else uses Next.js defaults.
