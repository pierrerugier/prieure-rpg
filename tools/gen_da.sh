#!/bin/bash
cd "$(dirname "$0")/.."
spr(){ python3 tools/pixellab.py sprite "$1" "$2" "$3"; }
# ── Maisons années 90 (PAS médiéval) ──
H="top-down bird's eye view, Pokemon Emerald GBA pixel art, clean outline, 1990s suburban house, modern villa, "
spr house_red    "${H}red clay tiled roof, beige rendered walls, modern windows" 96
spr house_blue   "${H}blue-grey slate roof, white rendered walls, modern windows" 96
spr house_grey   "${H}grey roof, pale brick walls, modern windows" 96
spr house_brown  "${H}brown tiled roof, wood and stone walls, modern windows" 96
spr house_orange "${H}orange terracotta roof, cream walls, modern windows" 96
spr manor        "top-down bird's eye, Pokemon GBA pixel art, 1990s large two-storey villa, dark slate roof, big bay windows, modern" 120
# ── Abbaye club-house (grande, pierre, arches) ──
spr abbey "top-down bird's eye view, Pokemon Emerald GBA pixel art, large medieval stone abbey building converted to golf clubhouse, long horizontal hall, romanesque stone arched cloister, brown clay tile roof, small bell tower, grand" 200
# ── Arbres cohérents (verts naturels) ──
spr pine "top-down bird's eye, Pokemon GBA pixel art, lush green pine conifer tree, natural green" 72
spr oak  "top-down bird's eye, Pokemon GBA pixel art, big round leafy green tree, natural green" 72
echo "=== FINI DA ==="
