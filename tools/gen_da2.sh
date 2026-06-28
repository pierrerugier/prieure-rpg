#!/bin/bash
cd "$(dirname "$0")/.."
# Abbaye depuis la vraie photo aérienne (img2img)
python3 tools/pixellab.py isprite abbey "top-down bird's eye Pokemon Emerald GBA pixel art, long medieval stone abbey golf clubhouse, brown clay tiled roof, small bell tower, arched cloister, terrace, grand" 200 /tmp/abbey_ref.png
# Villas FORÊT (haut du hameau) : toit PLAT, pierre + lambris bois, baies vitrées
V="top-down bird's eye Pokemon Emerald GBA pixel art, 1990s single-storey forest villa, FLAT roof, "
python3 tools/pixellab.py sprite villaf1 "${V}stone and wood-panel walls, large bay windows" 96
python3 tools/pixellab.py sprite villaf2 "${V}grey stone walls, wooden lambris, big glass bay windows" 96
python3 tools/pixellab.py sprite villaf3 "${V}beige stone and dark wood panel walls, bay windows" 96
# Manoirs ÎLE-DE-FRANCE (bas) : étage, enduit beige, baies vitrées, toit pentu
M="top-down bird's eye Pokemon Emerald GBA pixel art, Ile-de-France two-storey house, beige rendered walls, pitched tiled roof, bay windows, 1990s, elegant"
python3 tools/pixellab.py sprite manorif1 "${M}, grey slate roof" 120
python3 tools/pixellab.py sprite manorif2 "${M}, red tiled roof" 120
echo "=== FINI DA2 ==="
