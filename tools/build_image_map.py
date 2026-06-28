#!/usr/bin/env python3
# Carte image (assets/map.png) -> image de jeu HD + COLLISION précise.
# Génère assets/map_world.png, src/map_data.js (solid), assets/map_debug.png (murs en rouge sur la carte).
from PIL import Image
import os, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TILE = 16
WORLD = 2560
COLS = WORLD // TILE       # 160

src = Image.open(os.path.join(ROOT, 'assets', 'map.png')).convert('RGB')
world_img = src.resize((WORLD, WORLD), Image.LANCZOS)
world_img.save(os.path.join(ROOT, 'assets', 'map_world.png'))

# Échantillonnage fin : moyenne par tile sur un sous-échantillon 4x4 par cellule
SUB = COLS * 4            # 640
small = src.resize((SUB, SUB), Image.BILINEAR)
sp = small.load()

def cell_block(cx, cy):
    # Vote sur 4x4 pixels de la cellule : proportion de pixels "mur"
    blocked = 0
    for yy in range(cy*4, cy*4+4):
        for xx in range(cx*4, cx*4+4):
            r, g, b = sp[xx, yy]
            lum = 0.299*r + 0.587*g + 0.114*b
            mx, mn = max(r, g, b), min(r, g, b)
            sat = mx - mn
            is_block = False
            if b > 105 and b >= mx - 4 and b > r + 8:                 # eau (bleu)
                is_block = True
            elif g >= r and g >= b and lum < 104:                      # arbres / haies / forêt (vert sombre)
                is_block = True
            elif sat >= 55 and not (g == mx and g > r + 6) and lum < 175 \
                 and not (r >= g >= b and sat < 95 and lum > 150):     # toits colorés (rouge/bleu/sombre)
                is_block = True
            elif lum < 70:                                             # zones très sombres (ombres de bâti)
                is_block = True
            if is_block:
                blocked += 1
    return 1 if blocked >= 7 else 0    # majorité de la cellule = mur

solid = []
for ry in range(COLS):
    for rx in range(COLS):
        solid.append(cell_block(rx, ry))

# Nettoyage : retire les murs isolés (1 cellule entourée de marchable) -> évite faux blocages sur l'herbe
def at(c, r): return solid[r*COLS+c] if 0 <= c < COLS and 0 <= r < COLS else 1
clean = solid[:]
for r in range(COLS):
    for c in range(COLS):
        if solid[r*COLS+c]:
            n = at(c-1,r)+at(c+1,r)+at(c,r-1)+at(c,r+1)
            if n == 0:
                clean[r*COLS+c] = 0
solid = clean

sd = ''.join(str(v) for v in solid)
out = ('// AUTO-GÉNÉRÉ par tools/build_image_map.py (collision depuis assets/map.png)\n'
       f'export const MAPIMG = {{ w:{WORLD}, h:{WORLD}, tile:{TILE}, cols:{COLS}, rows:{COLS},\n'
       f'  src:"assets/map_world.png",\n  solid:"{sd}" }};\n')
open(os.path.join(ROOT, 'src', 'map_data.js'), 'w').write(out)

# Debug : murs en rouge translucide SUR la vraie carte (pour vérifier la précision)
dbg = world_img.copy().convert('RGBA')
ov = Image.new('RGBA', dbg.size, (0,0,0,0)); od = ov.load()
for ry in range(COLS):
    for rx in range(COLS):
        if solid[ry*COLS+rx]:
            for yy in range(ry*TILE, ry*TILE+TILE):
                for xx in range(rx*TILE, rx*TILE+TILE):
                    od[xx,yy] = (255, 0, 0, 90)
Image.alpha_composite(dbg, ov).convert('RGB').resize((900,900), Image.LANCZOS).save(os.path.join(ROOT,'assets','map_debug.png'))

b = sum(solid)
print(f'monde {WORLD}, grille {COLS}x{COLS}, murs {b}/{len(solid)} ({100*b//len(solid)}%)')
print('-> assets/map_world.png, src/map_data.js, assets/map_debug.png')
