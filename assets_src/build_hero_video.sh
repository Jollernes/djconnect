#!/usr/bin/env bash
# Builds the homepage hero background loop from royalty-free Pexels stock clips.
# Requires: ffmpeg, curl. Outputs to ../public/hero/.
# Pexels License (free, no attribution required): https://www.pexels.com/license/
set -euo pipefail
cd "$(dirname "$0")"

OUTDIR="../public/hero"
mkdir -p "$OUTDIR"
TMP="$(mktemp -d)"

# clip id -> direct file URL (resolved from https://www.pexels.com/download/video/<id>/)
declare -A CLIPS=(
  [dj_crowd]="https://videos.pexels.com/video-files/9003382/9003382-hd_1920_1080_25fps.mp4"   # DJ performing with crowd
  [club]="https://videos.pexels.com/video-files/30077981/12900608_3840_2160_120fps.mp4"        # packed club dance floor
  [outdoor]="https://videos.pexels.com/video-files/30665567/13122917_1920_1080_50fps.mp4"      # outdoor / summer DJ set
)
for name in dj_crowd club outdoor; do
  curl -sL --max-time 120 -o "$TMP/$name.mp4" "${CLIPS[$name]}"
done

NORM="scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,setsar=1"

ffmpeg -y \
  -ss 0.6 -t 6 -i "$TMP/dj_crowd.mp4" \
  -ss 1.5 -t 6 -i "$TMP/club.mp4" \
  -ss 3.0 -t 6 -i "$TMP/outdoor.mp4" \
  -filter_complex "\
[0:v]${NORM}[v0];[1:v]${NORM}[v1];[2:v]${NORM}[v2];\
[v0][v1]xfade=transition=fade:duration=1:offset=5[a];\
[a][v2]xfade=transition=fade:duration=1:offset=10[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf 25 -vf "scale=1280:720" \
  -pix_fmt yuv420p -movflags +faststart "$OUTDIR/hero-loop.mp4"

ffmpeg -y -i "$OUTDIR/hero-loop.mp4" -an -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 \
  "$OUTDIR/hero-loop.webm"

ffmpeg -y -i "$OUTDIR/hero-loop.mp4" -frames:v 1 -q:v 3 "$OUTDIR/hero-poster.jpg"

rm -rf "$TMP"
ls -lh "$OUTDIR"
