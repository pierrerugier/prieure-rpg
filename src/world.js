// ═══════════════════════════════════════════════════════════════
// LE PRIEURÉ RPG — MONDE basé sur la VRAIE carte (OpenStreetMap)
// Géométrie réelle (Golf du Prieuré, Sailly/Drocourt) projetée en px,
// rendue style GBA puis pixellisée. Collision déduite de la géométrie.
// Source des données : src/osm_map.js (généré par tools/build_map.py)
// ═══════════════════════════════════════════════════════════════

import { MAP, STREETS } from './osm_map.js';

export const TILE = 16;
const PIXELATE = 1;            // GBA strict 1:1
const W = MAP.w, H = MAP.h;

// ── PALETTE (style FireRed / Emerald) ──────────────────────────
const P = {
  fdeep:'#1c3810', forest:'#27491b', flit:'#356024',
  tt:'#4e8c38', tb:'#62ac46', trunk:'#3a2410', tsh:'#173008',
  rough:'#5a9a32', roughd:'#4c8a28', fair:'#86c84a', fairl:'#9adb5c',
  green:'#9ae85a', greenl:'#b0f56e', greene:'#74c038',
  sand:'#e6d68a', sandl:'#f2e8a8',
  water:'#3a90c8', waterl:'#5ab0e0',
  tar:'#9a958c', tare:'#74706a', dirt:'#c2a86a', dirte:'#a08a50',
  tennis:'#b9633a', clay:'#c8743f',
  roofW:'#b85838', roofWl:'#d0764e',        // villa (toit chaud)
  roofM:'#55506e', roofMl:'#6e6890',        // manoir (toit ardoise)
  wall:'#e6dcc4', walle:'#a89a78',
  hedge:'#2f5a1e', hedgel:'#3f7028',
  flag:'#e02828', pole:'#e0e0e0',
  flower1:'#f04040', flower2:'#f0d040', flower3:'#f8f8f8',
};

// ── GÉOMÉTRIE ──────────────────────────────────────────────────
function inPoly(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function inAny(list, x, y) { for (const p of list) if (inPoly(p, x, y)) return true; return false; }
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx*dx + dy*dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / l2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(px - (ax + t*dx), py - (ay + t*dy));
}
function nearLine(pts, x, y, half) {
  for (let i = 0; i < pts.length - 1; i++)
    if (distSeg(x, y, pts[i][0], pts[i][1], pts[i+1][0], pts[i+1][1]) <= half) return true;
  return false;
}
function nearRoads(x, y) {
  for (const r of MAP.roads) if (nearLine(r.pts, x, y, r.w / 2 + 4)) return true;
  return false;
}
function area(pts) {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++)
    a += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
  return Math.abs(a / 2);
}
function centroid(pts) {
  let x = 0, y = 0; for (const p of pts) { x += p[0]; y += p[1]; }
  return [x / pts.length, y / pts.length];
}

// ── COLLISION ──────────────────────────────────────────────────
function walkableAt(x, y) {
  if (x < 6 || y < 6 || x > W - 6 || y > H - 6) return false;
  // Surfaces praticables : golf (rough/fairway/green/bunker), allées, parking, terrains
  let walk = inAny(MAP.golf, x, y) || nearRoads(x, y) ||
             inAny(MAP.parking, x, y) || MAP.pitches.some(pt => inPoly(pt.poly, x, y));
  if (!walk) return false;          // sinon = forêt (bloquée)
  // Bloqueurs par-dessus
  if (inAny(MAP.buildings, x, y)) return false;
  if (inAny(MAP.pools, x, y) || inAny(MAP.water, x, y)) return false;
  return true;
}
function buildSolid() {
  const cols = Math.ceil(W / TILE), rows = Math.ceil(H / TILE);
  const solid = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      solid[r * cols + c] = walkableAt(c * TILE + TILE/2, r * TILE + TILE/2) ? 0 : 1;
  return { solid, cols, rows };
}
function snapWalkable(grid, x, y) {
  const c0 = Math.floor(x / TILE), r0 = Math.floor(y / TILE);
  for (let rad = 0; rad < 30; rad++)
    for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
      if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
      const c = c0 + dc, r = r0 + dr;
      if (c < 0 || r < 0 || c >= grid.cols || r >= grid.rows) continue;
      if (!grid.solid[r * grid.cols + c]) return { x: c * TILE + TILE/2, y: r * TILE + TILE/2 };
    }
  return { x, y };
}
function openness(grid, c, r) {
  let o = 0;
  for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const cc = c+dc, rr = r+dr;
    if (cc<0||rr<0||cc>=grid.cols||rr>=grid.rows||grid.solid[rr*grid.cols+cc]) continue;
    o++;
  }
  return o;
}
// Cherche une case marchable bien dégagée (≥3 voisins libres) près de (x,y)
function findOpenSpot(grid, x, y) {
  const c0 = Math.floor(x / TILE), r0 = Math.floor(y / TILE);
  let best = null, bestScore = -1;
  for (let rad = 0; rad < 26; rad++) {
    for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
      if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
      const c = c0+dc, r = r0+dr;
      if (c<0||r<0||c>=grid.cols||r>=grid.rows||grid.solid[r*grid.cols+c]) continue;
      const score = openness(grid, c, r) - rad * 0.08;
      if (score > bestScore) { bestScore = score; best = { x: c*TILE+TILE/2, y: r*TILE+TILE/2 }; }
    }
    if (best && bestScore >= 3) break;
  }
  return best || snapWalkable(grid, x, y);
}

// ── RENDU ──────────────────────────────────────────────────────
let g, _s = 12345;
function rng() { _s = Math.imul(_s ^ _s>>>13, _s|7); _s ^= _s<<17; return (_s>>>0) / 4294967296; }
function seed(n) { _s = n>>>0; rng(); }
function path(pts) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); }
function fillPoly(pts, c) { path(pts); g.closePath(); g.fillStyle = c; g.fill(); }
function strokePoly(pts, c, w) { path(pts); g.closePath(); g.strokeStyle = c; g.lineWidth = w; g.stroke(); }
function strokeLine(pts, c, w) { g.lineCap='round'; g.lineJoin='round'; path(pts); g.strokeStyle = c; g.lineWidth = w; g.stroke(); }
function ci(cx, cy, r, c) { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI*2); g.fillStyle = c; g.fill(); }

function drawTree(cx, cy, r) {
  g.fillStyle = P.trunk; g.fillRect(cx - 1.5, cy + r*0.3, 3, r*0.7);
  ci(cx + r*0.2, cy + r*0.55, r*0.8, P.tsh);
  ci(cx, cy, r, P.tt); ci(cx - r*0.28, cy - r*0.06, r*0.7, P.tb);
  ci(cx - r*0.12, cy - r*0.22, r*0.32, '#7ad05a');
}
function drawGreen(poly) {
  fillPoly(poly, P.greene);
  // léger inset clair
  const c = centroid(poly);
  fillPoly(poly, P.green);
  ci(c[0], c[1], 4, P.greenl);
  // trou + drapeau
  g.fillStyle = '#101010'; g.beginPath(); g.arc(c[0], c[1], 2.5, 0, Math.PI*2); g.fill();
  g.strokeStyle = P.pole; g.lineWidth = 1.5; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0], c[1] - 16); g.stroke();
  fillPoly([[c[0], c[1]-16],[c[0]+9, c[1]-12],[c[0], c[1]-8]], P.flag);
}
function drawBuilding(poly) {
  const big = area(poly) > 760;            // grand = manoir (lisière), petit = villa
  const roof = big ? P.roofM : P.roofW, hi = big ? P.roofMl : P.roofWl;
  // ombre
  g.save(); g.translate(2, 3); fillPoly(poly, 'rgba(0,0,0,0.28)'); g.restore();
  fillPoly(poly, roof);
  strokePoly(poly, big ? '#2e2a40' : '#5a2410', 1.5);
  // faîte : ligne claire à mi-hauteur (approx via bbox)
  let minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;
  for (const p of poly){ minx=Math.min(minx,p[0]);maxx=Math.max(maxx,p[0]);miny=Math.min(miny,p[1]);maxy=Math.max(maxy,p[1]); }
  g.fillStyle = hi; g.fillRect(minx+1, (miny+maxy)/2 - 0.5, maxx-minx-2, 1.5);
}

// Routes : tarmac clair (allées résidentielles) ou terre (chemins/tracks)
function drawRoad(r) {
  const dirt = ['track','path','footway','cycleway'].includes(r.kind);
  if (dirt) { strokeLine(r.pts, P.dirte, r.w + 3); strokeLine(r.pts, P.dirt, r.w); }
  else { strokeLine(r.pts, P.tare, r.w + 4); strokeLine(r.pts, P.tar, r.w);
         strokeLine(r.pts, 'rgba(220,210,180,0.5)', Math.max(1, r.w*0.35)); }
}

function paintWorld(ctx) {
  g = ctx;
  // 1. Forêt de fond (le hameau est en forêt)
  g.fillStyle = P.forest; g.fillRect(0, 0, W, H);
  seed(7); for (let i = 0; i < 900; i++) { const x=rng()*W,y=rng()*H; ci(x,y,18+rng()*40, rng()<0.5?P.fdeep:P.flit); }
  // 2. Golf : rough puis fairways, départs, greens, bunkers
  MAP.golf.forEach(p => { fillPoly(p, P.rough); });
  MAP.golf.forEach(p => { const c=centroid(p); fillPoly(p, P.rough); });
  MAP.fairways.forEach(f => { if (f.kind === 'hole') strokeLine(f.pts, P.fair, 26); else fillPoly(f.pts, P.fair); });
  MAP.tees.forEach(p => fillPoly(p, P.fairl));
  MAP.bunkers.forEach(p => { fillPoly(p, P.sand); });
  MAP.greens.forEach(drawGreen);
  // 3. Eau / piscine
  MAP.water.forEach(p => { fillPoly(p, P.water); });
  MAP.pools.forEach(p => { fillPoly(p, P.water); const c=centroid(p); ci(c[0],c[1],6,P.waterl); });
  // 4. Terrains (tennis = terre battue, autres = gazon)
  MAP.pitches.forEach(pt => {
    if (pt.sport === 'tennis') { fillPoly(pt.poly, P.clay); strokePoly(pt.poly, '#f0f0f0', 1.5); }
    else fillPoly(pt.poly, P.fairl);
  });
  // 5. Parking (gravier)
  MAP.parking.forEach(p => { fillPoly(p, P.tar); strokePoly(p, P.tare, 1.5); });
  // 6. Allées / routes
  MAP.roads.forEach(drawRoad);
  // 7. Haies
  MAP.hedges.forEach(h => strokeLine(h, P.hedge, 4));
  // 8. Bâtiments (toits vus de dessus)
  MAP.buildings.forEach(drawBuilding);
  // 9. Arbres dans la forêt (hors golf / routes / bâtiments)
  seed(4242);
  for (let i = 0; i < 4200; i++) {
    const x = rng()*W, y = rng()*H;
    if (inAny(MAP.golf, x, y)) continue;
    if (nearRoads(x, y)) continue;
    if (inAny(MAP.buildings, x, y)) continue;
    drawTree(x, y, 7 + rng()*7);
  }
}

function pixelate(src, makeCanvas) {
  if (PIXELATE <= 1) return src;
  const pw = Math.floor(W / PIXELATE), ph = Math.floor(H / PIXELATE);
  const small = makeCanvas(pw, ph); const sc = small.getContext('2d'); sc.imageSmoothingEnabled = false;
  sc.drawImage(src, 0, 0, pw, ph);
  const out = makeCanvas(W, H); const oc = out.getContext('2d'); oc.imageSmoothingEnabled = false;
  oc.drawImage(small, 0, 0, pw, ph, 0, 0, W, H);
  return out;
}

// ── LOOKS & PNJ ────────────────────────────────────────────────
const LOOKS = {
  victor:  { hair:'#241608', skin:'#c39a5e', shirt:'#c83030', pants:'#39414f', shoes:'#2a2a30' },
  charles: { hair:'#3a2410', skin:'#e8c49a', shirt:'#d07820', pants:'#39414f', shoes:'#2a2a30', hat:'#2c5aa0' },
  margot:  { hair:'#e8c84a', skin:'#f4d8b8', shirt:'#e060a0', pants:'#8a4a8a', shoes:'#6a3a6a', hairStyle:'curly' },
  antoine: { hair:'#3a2a18', skin:'#eed0a8', shirt:'#5090c0', pants:'#39414f', shoes:'#2a2a30', glasses:true },
  oscar:   { hair:'#e8d24a', skin:'#f6dcc0', shirt:'#e8c83a', pants:'#5a6a3a', shoes:'#3a3a30', build:'chubby' },
  louis:   { hair:'#3a2410', skin:'#f2dcc4', shirt:'#7050a0', pants:'#39414f', shoes:'#2a2a30' },
  kupi:    { hair:'#4a3018', skin:'#dcb488', shirt:'#806040', pants:'#39414f', shoes:'#2a2a30' },
  paul:    { hair:'#1a1a1a', skin:'#e8c49a', shirt:'#404858', pants:'#2a2a30', shoes:'#1a1a1a' },
  passantA:{ hair:'#bcbcbc', skin:'#e6c8a2', shirt:'#7a8a6a', pants:'#56564e', shoes:'#3a3a30' },
  passantB:{ hair:'#cfcfcf', skin:'#dcbc94', shirt:'#9a7a6a', pants:'#4a4a4a', shoes:'#2a2a2a' },
  marcel:  { hair:'#9a9a9a', skin:'#d8b48a', shirt:'#2e6a3a', pants:'#3a3a2a', shoes:'#2a2a1a' },
};
// Point de référence d'une rue (centroïde réel), avec décalage
function street(name, dx = 0, dy = 0) {
  const c = STREETS[name];
  return c ? { x: c[0] + dx, y: c[1] + dy } : { x: W/2 + dx, y: H/2 + dy };
}
function npcDefs() {
  const F = 'Allée des Fougères', L = 'Allée de la Lisière', Hh = 'Allée des Hameaux', Hp = 'Hameau du Prieuré';
  const g0 = MAP.golf[0] ? centroid(MAP.golf[0]) : [W*0.7, H*0.7];
  return [
    { id:'victor',  ...street(F, -10, -30), look:LOOKS.victor,  idle:'victor_greet' },
    { id:'charles', ...street(F,  18, -30), look:LOOKS.charles, idle:'charles_greet' },
    { id:'margot',  ...street(F,   0,  10), look:LOOKS.margot,  idle:'margot_greet', wander:true },
    { id:'antoine', ...street(F,  34, -10), look:LOOKS.antoine, idle:'antoine_greet' },
    { id:'oscar',   ...street(L, -10, -20), look:LOOKS.oscar,   idle:'oscar_greet' },
    { id:'louis',   ...street(L,  20,  30), look:LOOKS.louis,   idle:'louis_greet' },
    { id:'kupi',    ...street(Hh,  0, -10), look:LOOKS.kupi,    idle:'kupi_greet' },
    { id:'paul',    ...street(Hp,  0,   0), look:LOOKS.paul,    idle:'paul_greet' },
    { id:'greenkeeper', kind:'npc', name:'Marcel', x:g0[0], y:g0[1], look:LOOKS.marcel,
      idle:[ {speaker:'Marcel', text:"Pas de vélo sur les greens, petit. C'est sacré."},
             {speaker:'Marcel', text:"Ce golf, c'est le plus beau du coin. Respecte-le."} ] },
    // Chiens
    { id:'dog1', kind:'dog', name:'le chien', ...street(F, 40, 20), color:'#8a6038', wander:true, range:36 },
    { id:'dog2', kind:'dog', name:'le chien', ...street(Hh, 30, 30), color:'#2a2a2a', wander:true, range:36 },
    { id:'dog3', kind:'dog', name:'le chien', ...street(L, -30, 40), color:'#e6ddcb', wander:true, range:36 },
    // Passants (petits vieux)
    { id:'passant1', kind:'passant', name:'Mme Lévêque', ...street(F, 0, 60), look:LOOKS.passantA, wander:true, range:60,
      idle:[ {speaker:'Mme Lévêque', text:"Ah, les jeunes ! Profitez-en, c'est le plus bel été."},
             {speaker:'Mme Lévêque', text:"Vous n'auriez pas vu mon chien ? Il file toujours vers le golf."} ] },
    { id:'passant2', kind:'passant', name:'M. Grémont', ...street(Hh, 10, -40), look:LOOKS.passantB, wander:true, range:60,
      idle:[ {speaker:'M. Grémont', text:"Belle journée pour marcher, n'est-ce pas ?"},
             {speaker:'M. Grémont', text:"De mon temps, on rentrait à la nuit tombée."} ] },
  ];
}

// ── API ────────────────────────────────────────────────────────
export function buildWorld(makeCanvas) {
  const grid = buildSolid();
  const fou = street('Allée des Fougères');
  const spawn = findOpenSpot(grid, fou.x, fou.y);
  // Vélo sur une autre allée (bien séparé du spawn pour éviter l'auto-ramassage)
  let bike = findOpenSpot(grid, ...Object.values(street('Allée des Hameaux')));
  if (Math.hypot(bike.x - spawn.x, bike.y - spawn.y) < 80)
    bike = findOpenSpot(grid, ...Object.values(street('Hameau du Prieuré')));
  const meta = {
    width: W, height: H, cols: grid.cols, rows: grid.rows, solid: grid.solid,
    label: 'Le Prieuré',
    spawn, bike,
    npcs: npcDefs().map(n => ({ ...n, ...snapWalkable(grid, n.x, n.y) })),
    golf: MAP.golf[0] ? centroid(MAP.golf[0]) : { x: W*0.7, y: H*0.7 },
  };
  if (makeCanvas) {
    try {
      const art = makeCanvas(W, H);
      const actx = art.getContext('2d');
      actx.imageSmoothingEnabled = true;
      paintWorld(actx);
      meta.ground = pixelate(art, makeCanvas);
    } catch (e) { meta.ground = null; }
  }
  return meta;
}

export { W as WORLD_W, H as WORLD_H };
