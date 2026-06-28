#!/bin/bash
cd "$(dirname "$0")/.."
P="high quality pixel art, top-down RPG overworld character sprite, Pokemon Emerald GBA style, full body facing camera, clean black outline, flat shading, "
s(){ python3 tools/pixellab.py sprite "$1" "$P$2" 96; }
s pierre  "young boy, cream beige polo shirt, khaki shorts, short brown hair, white sneakers"
s victor  "teenage boy, red t-shirt, tanned olive skin, dark brown hair, jeans, confident"
s charles "teenage boy, orange t-shirt, blue baseball cap worn forward, brown hair"
s margot  "young girl, pink summer dress, long curly blonde hair, cheerful"
s oscar   "chubby boy, yellow polo shirt, blond hair, pale skin, beige shorts"
s antoine "skinny boy, light blue shirt, round glasses, brown hair"
s louis   "boy, purple polo shirt, neat brown hair, beige trousers, posh"
s paul    "tough boy, dark navy hoodie, black short hair, jeans, serious"
s kupi    "boy, brown t-shirt, messy brown hair, shorts"
echo "=== FINI ==="; ls assets/sprites/pierre.png && sips -g pixelWidth assets/sprites/pierre.png 2>/dev/null | grep pixelW
