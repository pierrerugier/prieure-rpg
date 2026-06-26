#!/usr/bin/env python3
# Carte = image Nano Banana (assets/map.png, 4096²).
# Produit : assets/map_world.png (échelle de jeu) + src/map_data.js (collision).
# La collision est déduite par classification couleur (eau/arbres/bâtiments = mur).
from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TILE = 16
WORLD = 2048                      # taille monde (px) — bon compromis échelle/lisibilité
COLS = WORLD // TILE              # 128

src = Image.open(os.path.join(ROOT, 'assets', 'map.png')).convert('RGB')
# 1. Image de jeu (sol)
world_img = src.resize((WORLD, WORLD), Image.LANCZOS)
world_img.save(os.path.join(ROOT, 'assets', 'map_world.png'))

# 2. Couleur moyenne par tile (resize -> grille)
grid = src.resize((COLS, COLS), Image.BILINEAR)
px = grid.load()

def classify(r, g, b):
    lum = 0.299*r + 0.587*g + 0.114*b
    # Eau (bleu) -> mur
    if b > 95 and b > r + 18 and b > g - 5 and b >= g - 0 and r < 150:
        return 1
    # Arbres / forêt dense (vert foncé) -> mur
    if g > r and g >= b and lum < 112:
        return 1
    # Bâtiments (toits bruns/rouges, pas trop clairs -> exclut le sable) -> mur
    if r > g and (r - b) > 38 and lum < 168:
        return 1
    return 0  # herbe, fairway, allées, sable, green = marchable

solid = []
for ry in range(COLS):
    for rx in range(COLS):
        r, g, b = px[rx, ry]
        solid.append(classify(r, g, b))

# 3. map_data.js
s = ''.join(str(v) for v in solid)
out = ('// AUTO-GÉNÉRÉ par tools/build_image_map.py — carte image Nano Banana.\n'
       f'export const MAPIMG = {{ w:{WORLD}, h:{WORLD}, tile:{TILE}, cols:{COLS}, rows:{COLS},\n'
       f'  src:"assets/map_world.png",\n'
       f'  solid:"{s}" }};\n')
open(os.path.join(ROOT, 'src', 'map_data.js'), 'w').write(out)

# 4. Image de debug : rouge sur les cases bloquées
dbg = world_img.copy().convert('RGBA')
overlay = Image.new('RGBA', dbg.size, (0,0,0,0))
od = overlay.load()
for ry in range(COLS):
    for rx in range(COLS):
        if solid[ry*COLS+rx]:
            for yy in range(ry*TILE, ry*TILE+TILE):
                for xx in range(rx*TILE, rx*TILE+TILE):
                    od[xx,yy] = (255,0,0,90)
dbg = Image.alpha_composite(dbg, overlay).convert('RGB')
dbg.resize((1024,1024), Image.LANCZOS).save(os.path.join(ROOT, 'assets', 'map_debug.png'))

blocked = sum(solid)
print(f'monde {WORLD}x{WORLD}, grille {COLS}x{COLS}')
print(f'cases bloquées : {blocked}/{len(solid)} ({100*blocked/len(solid):.0f}%)')
print('-> assets/map_world.png, src/map_data.js, assets/map_debug.png')
