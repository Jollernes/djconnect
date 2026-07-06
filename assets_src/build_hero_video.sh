#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

SRC1="scene_julefrokost.jpg"
SRC2="scene_sommerfest.jpg"
SRC3="scene_firmafest.jpg"

OUTDIR="../public/hero"
mkdir -p "$OUTDIR"

FPS=20
DUR=4          # seconds per clip
FADE=1         # crossfade seconds

kenburns () {
  local in="$1" out="$2" dir="$3"
  local frames=$((FPS * DUR))
  local zexpr
  if [ "$dir" = "in" ]; then
    zexpr="min(zoom+0.0006,1.14)"
  else
    zexpr="if(eq(on,0),1.14,max(zoom-0.0006,1.0))"
  fi
  ffmpeg -y -loop 1 -t "$DUR" -i "$in" -filter_complex \
    "[0:v]scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,\
zoompan=z='${zexpr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:fps=${FPS}:s=1280x720,\
format=yuv420p" \
    -frames:v "$frames" -c:v libx264 -preset ultrafast -crf 20 -an "$out"
}

kenburns "$SRC1" c1.mp4 in
kenburns "$SRC2" c2.mp4 out
kenburns "$SRC3" c3.mp4 in

# Crossfade the three clips together
OFF1=$((DUR - FADE))            # 3
OFF2=$(( (DUR - FADE) * 2 ))    # 6
ffmpeg -y -i c1.mp4 -i c2.mp4 -i c3.mp4 -filter_complex \
  "[0][1]xfade=transition=fade:duration=${FADE}:offset=${OFF1}[a];\
[a][2]xfade=transition=fade:duration=${FADE}:offset=${OFF2}[v]" \
  -map "[v]" -an -c:v libx264 -preset ultrafast -crf 21 -pix_fmt yuv420p -movflags +faststart \
  "$OUTDIR/hero-loop.mp4"

# WebM (VP9) variant
ffmpeg -y -i "$OUTDIR/hero-loop.mp4" -an -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 \
  "$OUTDIR/hero-loop.webm"

# Poster (first frame)
ffmpeg -y -i "$OUTDIR/hero-loop.mp4" -frames:v 1 -q:v 3 "$OUTDIR/hero-poster.jpg"

rm -f c1.mp4 c2.mp4 c3.mp4
ls -lh "$OUTDIR"
