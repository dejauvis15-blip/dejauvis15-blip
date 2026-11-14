# Media

Web-compressed clips used by `index.html` (H.264, faststart, mono 64k audio).

| File | Source upload | Who | Where it appears |
|---|---|---|---|
| `victoria.mp4` | `exp 1.mp4` | Victoria | Featured stream |
| `victoria-2.mp4` | `Exp 2.mp4` | Victoria | Her listing card |
| `cole.mp4` | `Sequence 6.mp4` | Cole | Cam 02 · bedroom, archive |
| `cole-2.mp4` | `Sequence 01 (2).mp4` | Cole | Archive |
| `cole-outside.mp4` | Drive · `Outside.mp4` (REC logo added) | Cole | Cam 01 · outside the cabin, archive |
| `cole-room.mp4` | Drive · `Bedroom.mp4` (REC logo added) | Cole | Cam 04 · guest bedroom, new-listing card, telemetry player, archive |
| `cole-living.mp4` | Drive · `Live_room.mp4` (REC logo added) | Cole | Cam 03 · living room, archive |
| `dre.mp4` | Bryce zip · `Sequence 01.mp4` | Dre | "Dre" listing card |
| `dre-2.mp4` … `dre-6.mp4` | Bryce zips · `Sequence 02–06.mp4` | Dre | Spare, not used yet |


The original full-size uploads are still in the git history (commits "Add files via upload").

To swap a clip, replace the file with the same name, or edit the `MEDIA` object at the top of the `<script>` in `index.html`.

Re-encode a new clip:

    ffmpeg -i in.mov -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 26 -preset slow -movflags +faststart -c:a aac -b:a 64k -ac 1 out.mp4
