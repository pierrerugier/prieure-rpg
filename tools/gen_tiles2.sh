#!/bin/bash
cd "$(dirname "$0")/.."
# Tilesets Wang (lower = herbe commune) pour un système cohérent
python3 tools/pixellab.py tileset grass_fairway "green grass lawn, top-down" "golf fairway, bright light green mown grass with subtle stripes, top-down"
python3 tools/pixellab.py tileset grass_gravel  "green grass lawn, top-down" "beige gravel path, small stones, top-down"
# Objets (pixflux, fond transparent)
S="high quality pixel art, top-down RPG, Pokemon Emerald GBA style, clean outline, "
python3 tools/pixellab.py sprite hedge      "${S}neat green garden hedge bush segment, seamless" 32
python3 tools/pixellab.py sprite stonewall  "${S}low grey stone retaining wall segment, seamless" 32
python3 tools/pixellab.py sprite tree_pine2 "${S}tall dark green pine conifer tree" 80
python3 tools/pixellab.py sprite tree_oak2  "${S}big round leafy green tree" 80
echo "=== FINI TILES2 ==="
