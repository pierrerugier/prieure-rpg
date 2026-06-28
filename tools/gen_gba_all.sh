#!/bin/bash
cd "$(dirname "$0")/.."
PB="Pokemon Ruby Emerald GBA overworld character sprite, 16-bit retro pixel art, small chunky pixels, simple flat shading, black outline, top-down, full body, "
gen(){ # id  desc
  python3 tools/pixellab.py sprite "${1}_down" "${PB}${2}, facing camera front view"        40
  python3 tools/pixellab.py sprite "${1}_up"   "${PB}${2}, seen from behind, back view"       40
  python3 tools/pixellab.py sprite "${1}_left" "${PB}${2}, side view facing left, profile"     40
}
gen pierre  "young boy, beige polo shirt, khaki shorts, short brown hair, shy"
gen victor  "boy, red t-shirt, dark brown hair, confident leader"
gen charles "older boy, orange shirt, blue cap, brown hair"
gen margot  "young girl, pink dress, blonde curly hair, cheerful"
gen antoine "boy, light blue shirt, round glasses, brown hair, gentle"
gen oscar   "chubby boy, yellow shirt, green shorts, blond hair"
gen louis   "boy, purple shirt, brown hair, posh tidy"
gen kupi    "boy, brown shirt, messy light brown hair, grin"
gen paul    "boy, dark grey shirt, black hair, serious, arms crossed"
echo "=== chars done ==="
# Villas Runway : toit plat moderne, pierre grise, terrasse bois, baies vitrées
python3 tools/pixellab.py sprite villaf1 "top-down view, modern single-story house, flat roof, grey natural stone walls and wood panel siding, large glass bay windows, wooden deck terrace with table, GBA Pokemon pixel art, 16-bit" 96
python3 tools/pixellab.py sprite villaf3 "top-down view, modern flat-roof villa, grey stone and dark wood walls, big bay window, small wooden terrace, neat lawn, GBA Pokemon pixel art, 16-bit" 96
echo "=== ALL DONE ==="
