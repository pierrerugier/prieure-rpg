#!/usr/bin/env python3
# OSM brut -> géométrie de jeu (px). Génère src/osm_map.js
# Source : tools/osm_raw.json (Overpass, secteur Golf du Prieuré, Sailly/Drocourt)
import json, math, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw = json.load(open(os.path.join(ROOT, 'tools', 'osm_raw.json')))

# ── Emprise = golf + hameau (topologie complète, mesurée) ──
CORE = dict(latmin=49.0438, latmax=49.0600, lonmin=1.7779, lonmax=1.8032)
def in_core(p):
    return CORE['latmin'] <= p['lat'] <= CORE['latmax'] and CORE['lonmin'] <= p['lon'] <= CORE['lonmax']
els = [e for e in raw['elements']
       if e.get('type') == 'way' and 'geometry' in e and any(in_core(p) for p in e['geometry'])]

# ── Projection lat/lon -> mètres locaux (équirectangulaire, nord en haut) ──
pts_all = []
for e in els:
    pts_all += [(p['lat'], p['lon']) for p in e['geometry']]
lat0 = sum(p[0] for p in pts_all) / len(pts_all)
lon0 = sum(p[1] for p in pts_all) / len(pts_all)
cosl = math.cos(math.radians(lat0))
def to_m(lat, lon):
    return ((lon - lon0) * 111320 * cosl, (lat0 - lat) * 110540)

# bornes en mètres = rectangle CORE (le reste est clippé hors-carte)
corners = [(CORE['latmin'], CORE['lonmin']), (CORE['latmin'], CORE['lonmax']),
           (CORE['latmax'], CORE['lonmin']), (CORE['latmax'], CORE['lonmax'])]
cm = [to_m(la, lo) for la, lo in corners]
minx, maxx = min(c[0] for c in cm), max(c[0] for c in cm)
miny, maxy = min(c[1] for c in cm), max(c[1] for c in cm)

TARGET_W = 3800.0          # largeur monde visée (px)
MARGIN = 48
scale = TARGET_W / (maxx - minx)
def px(lat, lon):
    mx, my = to_m(lat, lon)
    return [round((mx - minx) * scale + MARGIN, 1), round((my - miny) * scale + MARGIN, 1)]
W = round((maxx - minx) * scale + 2 * MARGIN)
H = round((maxy - miny) * scale + 2 * MARGIN)

def geom(e):
    return [px(p['lat'], p['lon']) for p in e['geometry']]
def tags(e):
    return e.get('tags', {})

MAP = {'w': W, 'h': H, 'scale': round(scale, 3),
       'forest': [], 'golf': [], 'greens': [], 'tees': [], 'bunkers': [],
       'fairways': [], 'water': [], 'pools': [], 'pitches': [], 'parking': [],
       'buildings': [], 'roads': [], 'hedges': [], 'streets': {}}

# largeur visuelle des routes (px) — élargies pour être praticables (style Pokémon)
RW = {'secondary': 34, 'tertiary': 30, 'residential': 28, 'unclassified': 26,
      'service': 24, 'track': 22, 'path': 18, 'footway': 16, 'cycleway': 18}

for e in els:
    if e.get('type') != 'way' or 'geometry' not in e:
        continue
    t = tags(e); g = geom(e)
    if 'building' in t:
        MAP['buildings'].append(g)
    elif 'highway' in t:
        hw = t['highway']
        MAP['roads'].append({'pts': g, 'w': RW.get(hw, 6), 'kind': hw})
        nm = t.get('name')
        if nm:
            MAP['streets'].setdefault(nm, []).extend(g)
    elif t.get('leisure') == 'golf_course':
        MAP['golf'].append(g)
    elif t.get('golf') == 'green':
        MAP['greens'].append(g)
    elif t.get('golf') == 'tee':
        MAP['tees'].append(g)
    elif t.get('golf') == 'bunker':
        MAP['bunkers'].append(g)
    elif t.get('golf') in ('fairway', 'hole', 'driving_range'):
        MAP['fairways'].append({'pts': g, 'kind': t.get('golf')})
    elif t.get('leisure') == 'swimming_pool':
        MAP['pools'].append(g)
    elif t.get('leisure') == 'pitch':
        MAP['pitches'].append({'poly': g, 'sport': t.get('sport', '?')})
    elif t.get('amenity') == 'parking':
        MAP['parking'].append(g)
    elif t.get('natural') == 'water':
        MAP['water'].append(g)
    elif t.get('natural') == 'wood' or t.get('landuse') == 'forest':
        MAP['forest'].append(g)
    elif t.get('barrier') == 'hedge':
        MAP['hedges'].append(g)

# centroïde des rues clés (pour placer les PNJ)
def centroid(name):
    ps = MAP['streets'].get(name)
    if not ps: return None
    return [round(sum(p[0] for p in ps)/len(ps),1), round(sum(p[1] for p in ps)/len(ps),1)]
streets_c = {n: centroid(n) for n in MAP['streets']}

out = ('// AUTO-GÉNÉRÉ par tools/build_map.py depuis OSM (Golf du Prieuré, Sailly/Drocourt).\n'
       '// Géométrie réelle projetée en pixels de jeu. Ne pas éditer à la main.\n'
       'export const MAP = ' + json.dumps(MAP, ensure_ascii=False, separators=(',', ':')) + ';\n'
       'export const STREETS = ' + json.dumps(streets_c, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(os.path.join(ROOT, 'src', 'osm_map.js'), 'w', encoding='utf-8').write(out)

print(f'Monde {W}x{H} px  (échelle {scale:.2f} px/m)')
for k in ['buildings','roads','forest','golf','greens','tees','bunkers','fairways','water','pools','pitches','parking','hedges']:
    print(f'  {len(MAP[k]):4d}  {k}')
print('rues nommées:', len([s for s in streets_c.values() if s]))
print('-> src/osm_map.js')
