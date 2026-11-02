# Media

Drop the three live-recording clips here with these names:

| File | Who | Where it appears |
|---|---|---|
| `victoria.mp4` | Victoria | Scene 07 listing card, Scene 08 main player, "Sold" card (cropped) |
| `cole.mp4` | Cole | Scene 07 "new listing" card, all four Scene 09 cams (cropped/filtered as different angles), Scene 12 player, Scene 15 archive thumbnails |
| `subject3.mp4` | Third person ("Casey M.") | Scene 07 listing card, "Upcoming" card (dimmed) |

Tips
- H.264 MP4, 1280×720 or 1920×1080, 15–60 seconds, no audio needed (clips play muted until the visitor taps the speaker button).
- Keep each file under ~10 MB so the page loads fast (`ffmpeg -i in.mov -vf scale=1280:-2 -c:v libx264 -crf 26 -preset slow -an out.mp4`).
- To use different names, or extra angles for Cole's cameras, edit the `MEDIA` object at the top of the `<script>` in `index.html`.
- If a file is missing, that feed shows a styled "no signal" panel instead of breaking.
