"use client";

import dynamic from "next/dynamic";
import { Desktop } from "./desktop/Desktop";
import { FilmOverlay } from "./FilmOverlay";
import { Loader } from "./Loader";
import { RoomHud } from "./RoomHud";
import { ScreenControls } from "./ScreenControls";

// WebGL only exists in the browser.
const Scene = dynamic(() => import("./scene/Scene"), { ssr: false });

export function Experience() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#0d0e14]">
      <Scene />
      <RoomHud />
      <Desktop />
      <ScreenControls />
      <FilmOverlay />
      <Loader />
    </main>
  );
}
