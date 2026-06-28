#!/bin/bash
cd "$(dirname "$0")/.."
P="top-down RPG overworld character sprite, GBA Pokemon pixel art, facing forward, full body, "
spr(){ python3 tools/pixellab.py sprite "$1" "$2" "$3"; }
# Personnages (vue de face)
spr pierre  "${P}young boy, cream beige polo shirt, khaki shorts, short brown hair" 48
spr victor  "${P}teenage boy, red t-shirt, tanned skin, dark brown hair, confident" 48
spr charles "${P}teenage boy, orange t-shirt, blue baseball cap, brown hair" 48
spr margot  "${P}young girl, pink dress, long curly blonde hair" 48
spr oscar   "${P}chubby boy, yellow polo shirt, blond hair, pale skin" 48
spr antoine "${P}skinny boy, blue shirt, round glasses, brown hair" 48
spr louis   "${P}boy, purple polo shirt, brown hair, posh" 48
spr paul    "${P}tough boy, dark navy hoodie, black hair" 48
spr kupi    "${P}boy, brown t-shirt, messy brown hair" 48
# Bâtiments
spr abbey      "top-down RPG, medieval stone abbey clubhouse, brown tiled roof, arched windows, GBA pixel art" 128
spr manor      "top-down RPG, large two-storey manor house, dark slate roof, GBA pixel art" 112
spr house_red    "top-down RPG, small cottage house, red roof, GBA pixel art" 96
spr house_blue   "top-down RPG, small cottage house, blue roof, GBA pixel art" 96
spr house_grey   "top-down RPG, small cottage house, grey roof, GBA pixel art" 96
spr house_brown  "top-down RPG, small cottage house, brown wooden roof, GBA pixel art" 96
spr house_orange "top-down RPG, small house, orange tiled roof, GBA pixel art" 96
# Nature
spr pine   "top-down RPG, tall pine conifer tree, GBA pixel art" 64
spr oak    "top-down RPG, round leafy oak tree, GBA pixel art" 64
spr bush   "top-down RPG, small round green bush, GBA pixel art" 40
spr flower_red    "top-down RPG, patch of small red flowers, GBA pixel art" 32
spr flower_yellow "top-down RPG, patch of small yellow flowers, GBA pixel art" 32
spr flower_pink   "top-down RPG, patch of small pink flowers, GBA pixel art" 32
spr rock   "top-down RPG, grey boulder rock, GBA pixel art" 40
spr flag   "top-down RPG, golf hole red flag on pole, GBA pixel art" 32
spr bench  "top-down RPG, wooden park bench, GBA pixel art" 40
spr lamp   "top-down RPG, black victorian street lamp, GBA pixel art" 40
spr car    "top-down RPG, parked car seen from above, GBA pixel art" 56
echo "=== BATCH FINI ==="; ls assets/sprites/*.png | wc -l
