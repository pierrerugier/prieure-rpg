#!/bin/bash
cd "$(dirname "$0")/.."
# Cadrage VERROUILLÉ corps entier pour la cohérence (pas de buste/portrait)
PB="16-bit GBA Pokemon overworld sprite, a tiny full-body character standing, ENTIRE body head to toe visible including legs and shoes, small centered sprite with empty space around, simple flat colors, clean black outline, "
gen(){
  python3 tools/pixellab.py sprite "${1}_down" "${PB}${2}, viewed from the front facing the viewer"        48
  python3 tools/pixellab.py sprite "${1}_up"   "${PB}${2}, viewed from behind, back of the body"            48
  python3 tools/pixellab.py sprite "${1}_left" "${PB}${2}, viewed from the side walking to the left"         48
}
gen pierre  "young boy, beige polo shirt, khaki shorts, short brown hair, shy"
gen victor  "boy, red t-shirt, dark brown hair, confident"
gen charles "older boy, orange shirt, blue cap, brown hair"
gen margot  "young girl, pink dress, blonde curly hair"
gen antoine "boy, light blue shirt, round glasses, brown hair"
gen oscar   "chubby boy, yellow shirt, green shorts, blond hair"
gen louis   "boy, purple shirt, brown hair, neat"
gen kupi    "boy, brown shirt, messy light brown hair"
gen paul    "boy, dark grey shirt, black hair, serious"
echo "=== CHARS2 DONE ==="
