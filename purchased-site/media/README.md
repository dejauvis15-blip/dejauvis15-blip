# Media

Web-compressed clips used by `index.html` (H.264, faststart, mono 64k audio).

| File | Source upload | Where it appears |
|---|---|---|
| `victoria.mp4` | `exp 1.mp4` | Featured stream (Victoria Reeves) |
| `victoria-2.mp4` | `Exp 2.mp4` | Victoria's listing card |
| `subject3.mp4` | `Sequence 6.mp4` | "Casey M." listing card |
| `subject3-2.mp4` | `Sequence 01 (2).mp4` | Spare, not used yet |
| `cole.mp4` | `Sequence 01.mp4` (zip 1) | Cam 04 guest bedroom, new-listing card |
| `cole-2.mp4` … `cole-4.mp4` | `Sequence 02–04.mp4` | Cams 01–03 (cropped/filtered) |
| `cole-5.mp4` | `Sequence 05.mp4` | Subject telemetry player |
| `cole-2.mp4` … `cole-6.mp4`, `cole.mp4` | `Sequence 02–06.mp4` | Archive thumbnails |

The original full-size uploads are still in the git history (commits "Add files via upload").

To swap a clip, replace the file with the same name, or edit the `MEDIA` object at the top of the `<script>` in `index.html`.

Re-encode a new clip:

    ffmpeg -i in.mov -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 26 -preset slow -movflags +faststart -c:a aac -b:a 64k -ac 1 out.mp4
