#!/bin/bash
cd "$(dirname "$0")/.."
c(){ python3 tools/pixellab.py char "$1" "$2"; }
c pierre  "young boy, cream beige polo shirt, khaki shorts, short brown hair, cute kid"
c victor  "teenage boy, red t-shirt, tanned skin, dark brown hair, confident leader"
c charles "teenage boy, orange t-shirt, blue baseball cap, brown hair"
c margot  "young girl, pink dress, long curly blonde hair"
c oscar   "chubby boy, yellow polo shirt, blond hair, pale skin"
c antoine "skinny boy, blue shirt, round glasses, brown hair"
c louis   "boy, purple polo shirt, brown hair"
c paul    "tough boy, dark navy hoodie, black short hair"
c kupi    "boy, brown t-shirt, messy brown hair"
echo "=== FINI CHARS ==="; ls assets/sprites/*_south.png 2>/dev/null | wc -l
