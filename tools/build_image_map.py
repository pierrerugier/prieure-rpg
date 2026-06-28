#!/usr/bin/env python3
# Carte image (assets/map.png) -> grille de TERRAIN multi-classes + collision.
# Génère src/map_data.js (terrain + solid) et assets/map_debug.png.
from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TILE = 16
WORLD = 2560
COLS = WORLD // TILE       # 160

src = Image.open(os.path.join(ROOT, 'assets', 'map.png')).convert('RGB')
grid = src.resize((COLS, COLS), Image.BILINEAR)
px = grid.load()

# Classes : r=rough  f=fairway  s=sable  w=eau  p=chemin  t=forêt  b=bâtiment
def classify(r, g, b):
    lum = 0.299*r + 0.587*g + 0.114*b
    if b > 110 and b > r + 12 and b > g - 20:        return 'w'   # eau (bleu)
    if g > r and g > b and lum < 96:                  return 't'   # forêt (vert très sombre)
    if r > 150 and g > 135 and b < 145 and abs(r-g) < 55 and lum > 150: return 's'  # sable pâle
    if g > r + 8 and g > b + 20 and lum > 155:        return 'f'   # fairway (vert vif)
    if r > g and g > b and 70 < lum < 165 and (r-b) > 25: return 'p'  # chemin (brun)
    if (r > g + 35 and r > b + 30) or (b > 95 and b > g + 15 and lum < 130): return 'b'  # toit rouge/bleu
    if abs(r-g) < 18 and abs(g-b) < 18 and 70 < lum < 175:  return 'p'  # gris (parking/dalle) -> praticable
    return 'r'   # rough (vert moyen, défaut)

terrain = []
for ry in range(COLS):
    for rx in range(COLS):
        terrain.append(classify(*px[rx, ry]))

BLOCK = set('wtb')                      # eau, forêt, bâtiment = mur
solid = ['1' if t in BLOCK else '0' for t in terrain]

ts = ''.join(terrain)
sd = ''.join(solid)
out = ('// AUTO-GÉNÉRÉ par tools/build_image_map.py (classification de assets/map.png)\n'
       f'export const MAPIMG = {{ w:{WORLD}, h:{WORLD}, tile:{TILE}, cols:{COLS}, rows:{COLS},\n'
       f'  terrain:"{ts}",\n  solid:"{sd}" }};\n')
open(os.path.join(ROOT, 'src', 'map_data.js'), 'w').write(out)

# Debug : colorise les classes
COL = {'r':(110,180,90),'f':(150,220,110),'s':(235,215,150),'w':(80,160,210),
       'p':(200,180,130),'t':(40,80,40),'b':(190,80,70)}
dbg = Image.new('RGB', (COLS, COLS))
dp = dbg.load()
for ry in range(COLS):
    for rx in range(COLS):
        dp[rx, ry] = COL[terrain[ry*COLS+rx]]
dbg.resize((768,768), Image.NEAREST).save(os.path.join(ROOT, 'assets', 'map_debug.png'))

import collections
c = collections.Counter(terrain)
print('classes:', dict(c))
print(f'monde {WORLD}, grille {COLS}x{COLS}, murs {sum(int(x) for x in sd)}/{len(sd)}')
print('-> src/map_data.js, assets/map_debug.png')
