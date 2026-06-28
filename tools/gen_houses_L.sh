#!/bin/bash
cd "$(dirname "$0")/.."
V="top-down bird eye view from directly above, modern L-shaped single-story house, flat grey stone roof, attached wooden deck terrace wing, large glass bay windows, GBA Pokemon pixel art tile, no perspective, "
M="top-down bird eye view from directly above, L-shaped Ile-de-France house, terracotta tiled roof, beige rendered walls, attached wood terrace wing, bay windows, GBA Pokemon pixel art tile, no perspective, "
python3 tools/pixellab.py ihouse villaf1  "${V}grey stone and wood"            96 /tmp/href/villaf1.png
python3 tools/pixellab.py ihouse villaf3  "${V}dark wood and grey stone"        96 /tmp/href/villaf3.png
python3 tools/pixellab.py ihouse manorif1 "${M}two storeys"                      96 /tmp/href/manorif1.png
python3 tools/pixellab.py ihouse manorif2 "${M}large family manor"               96 /tmp/href/manorif2.png
echo "=== HOUSES L DONE ==="
