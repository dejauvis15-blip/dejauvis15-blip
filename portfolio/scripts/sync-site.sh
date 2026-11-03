#!/usr/bin/env bash
# Copies the existing static portfolio (Dev-Portfolio repo) into public/site,
# where it is served same-origin and rendered on the 3D monitor.
#   usage: npm run sync-site -- /path/to/dev-portfolio-
set -euo pipefail
SRC="${1:-../../dev-portfolio-}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/site"
[ -f "$SRC/index.html" ] || { echo "No index.html in $SRC" >&2; exit 1; }
rm -rf "$DEST" && mkdir -p "$DEST"
for f in "$SRC"/*; do
  case "$(basename "$f")" in README.md|LICENSE) ;; *) cp -R "$f" "$DEST/";; esac
done
# Vercel Web Analytics for the old site lives at /_vercel/insights on its own
# project; inside this app it would 404, so drop it from the embedded copy.
sed -i.bak '/_vercel\/insights/d; /window\.va = window\.va/d' "$DEST/index.html" && rm "$DEST/index.html.bak"
# Remove the now-empty inline <script></script> left behind.
perl -0pi -e 's#\s*<script>\s*</script>##' "$DEST/index.html"
echo "Synced $SRC -> $DEST"
