#!/bin/bash
cd "$(dirname "$0")/.."
PRE="consistent pixel art, top-down RPG overworld character, Pokemon Ruby GBA style, full body, clean black outline, flat shading, "
gen(){ # id "desc"
  python3 tools/pixellab.py sprite "${1}_down" "${PRE}${2}, front view facing viewer" 48
  python3 tools/pixellab.py sprite "${1}_up"   "${PRE}${2}, back view seen from behind" 48
  python3 tools/pixellab.py sprite "${1}_left" "${PRE}${2}, left side profile view" 48
}
gen pierre  "young boy, cream beige polo shirt, khaki shorts, brown hair"
gen victor  "teen boy, red t-shirt, tanned skin, dark brown hair"
gen charles "teen boy, orange t-shirt, blue baseball cap, brown hair"
gen margot  "young girl, pink dress, long curly blonde hair"
gen oscar   "chubby boy, yellow polo shirt, blond hair, pale skin"
gen antoine "skinny boy, light blue shirt, round glasses, brown hair"
gen louis   "boy, purple polo shirt, neat brown hair"
gen paul    "tough boy, dark navy hoodie, black hair"
gen kupi    "boy, brown t-shirt, messy brown hair"
echo "=== FINI CHARS DIR ==="; ls assets/sprites/*_down.png | wc -l
