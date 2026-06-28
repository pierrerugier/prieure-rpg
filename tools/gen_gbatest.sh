#!/bin/bash
cd "$(dirname "$0")/.."
P="Pokemon Ruby Emerald GBA overworld character sprite, 16-bit retro pixel art, small chunky pixels, simple shading, top-down, "
python3 tools/pixellab.py sprite gbatest_pierre "${P}young boy, beige polo shirt, brown hair, front view" 40
python3 tools/pixellab.py sprite gbatest_victor "${P}teen boy, red shirt, dark hair, front view" 40
python3 tools/pixellab.py sprite gbatest_margot "${P}young girl, pink dress, blonde hair, front view" 40
echo "=== FINI GBATEST ==="
