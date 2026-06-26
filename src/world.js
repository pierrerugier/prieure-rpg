// ═══════════════════════════════════════════════════════════════
// LE PRIEURÉ RPG — MONDE (rendu aérien pixel-art + collisions)
// Approche reprise de assets/world_map_reference.html :
//   art vectoriel organique → pixellisation → upscale net.
// Les collisions sont calculées ANALYTIQUEMENT (testable sans navigateur).
// ═══════════════════════════════════════════════════════════════

export const TILE = 16;       // taille logique d'une case (collision)
const PIXELATE   = 1;         // GBA strict 1:1 (sol aussi net que les persos)

// ── PALETTE (style FireRed / Emerald) ──────────────────────────
const P = {
  fd:'#1c3810', fm:'#2a5018', fl:'#3a6824', fe:'#4a7830',
  tt:'#4e8c38', tb:'#60a848', ts:'#182c0c',
  fw:'#78c045', fwl:'#88d050', fws:'#6ab038',
  gg:'#8ee450', ggl:'#a0f460', gge:'#78c83c',
  rg:'#52902e', rgd:'#448024',
  sd:'#e0d278', sdl:'#ece890', sdd:'#c8b860',
  pr:'#a8d878', prl:'#bcea8c', prd:'#90c060', law:'#98cc68',
  wa:'#3080b8', wal:'#48a0d8', was:'#68c0f0',
  ro:'#ccc080', rod:'#aca060', roc:'#bab070', roe:'#8a7840',
  pt:'#b8a868', ptd:'#a09050',
  gr:'#b8b090', grd:'#a0987a',
  vw:'#ddd0a5', vw2:'#ccc090', vr:'#886038', vr2:'#6a4420',
  vrl:'#a87848', vwi:'#b0d0e8', vdo:'#4e2c10', vwo:'#b09060',
  mw:'#e8dcc0', mw2:'#d8c8a8', mr:'#3a2858', mr2:'#281840',
  mrl:'#504878', mwi:'#a8c8e8', msh:'#245018',
  hg:'#78b848', hh:'#2a5018', he:'#2a5018', hel:'#3a6828',
  fp:'#d0d0d0', fr:'#d82020', fb:'#2848d0',
  flower1:'#f04040', flower2:'#f0d040', flower3:'#f8f8f8',
};

// ── DIMENSIONS DU MONDE ─────────────────────────────────────────
// Hameau en haut-gauche, golf qui s'étale vers le sud-est (cf. captures aériennes)
const W = 2400, H = 1900;

// ── GÉOMÉTRIE (coordonnées monde, en px) ───────────────────────
// Clairière prairie du hameau (forme organique)
const PRAIRIE = [
  [120,140],[420,100],[720,90],[1040,120],[1280,230],[1340,460],
  [1300,720],[1180,960],[920,1090],[560,1110],[260,1020],[120,800],
  [90,460],[120,140],
];

// Routes / allées : { pts, w }
const ROADS = [
  // Allée des Fougères (axe nord-sud principal)
  { pts:[[560,120],[556,300],[552,520],[548,740],[544,960],[540,1060]], w:46, kind:'road' },
  // Allée des Hameaux (ouest)
  { pts:[[270,320],[262,520],[256,720],[252,900],[300,980],[470,1000]], w:34, kind:'path' },
  // Allée de la Lisière (diagonale NE) puis descente vers le golf
  { pts:[[600,840],[720,760],[860,660],[1010,560],[1160,470],[1320,400],[1480,360]], w:48, kind:'road' },
  // Descente Lisière → golf (route d'accès, traverse la lisière forestière)
  { pts:[[1480,360],[1540,480],[1560,640],[1540,820],[1500,1000],[1470,1180],[1470,1340]], w:34, kind:'road' },
  // Accès club-house ↔ D130 (en bas)
  { pts:[[1470,1340],[1500,1480],[1560,1620],[1640,1740],[1740,1820]], w:30, kind:'road' },
  // Connecteurs
  { pts:[[556,360],[470,372],[360,378],[280,372]], w:26, kind:'path' },
  { pts:[[700,300],[640,290],[580,300]], w:24, kind:'path' },
  { pts:[[552,640],[470,648],[360,650]], w:24, kind:'path' },
];

// Place du Prieuré (cul-de-sac gravier) — ellipse
const GRAVEL = { cx:540, cy:920, rx:130, ry:95 };

// ── GOLF DU PRIEURÉ (sud-est) — d'après l'aérien fourni ──
const GOLF = {
  // Grande étendue de rough (gazon), forme organique
  rough: [
    [1280,860],[1640,760],[2000,740],[2280,840],[2360,1120],[2360,1560],
    [2200,1820],[1860,1880],[1520,1860],[1320,1740],[1240,1480],[1240,1120],[1280,860],
  ],
  // Fairways serpentant (évoquent les trous du parcours)
  fairways: [
    { pts:[[1360,980],[1560,940],[1780,960],[1980,1020],[2120,1140]], w:60 },
    { pts:[[2120,1140],[2190,1320],[2120,1500],[1980,1620]], w:54 },
    { pts:[[1340,1300],[1560,1340],[1780,1380],[1960,1460]], w:54 },
    { pts:[[1340,1620],[1560,1660],[1800,1680],[2020,1720]], w:52 },
  ],
  greens:  [ {cx:2120,cy:1140,rx:46,ry:34}, {cx:1980,cy:1620,rx:44,ry:32},
             {cx:1960,cy:1460,rx:42,ry:30}, {cx:2020,cy:1720,rx:42,ry:30} ],
  bunkers: [ [1700,1000,28,16,0], [2070,1250,24,14,0.3], [1820,1420,26,15,-0.2], [1900,1700,22,13,0.1] ],
  abbey:   { x:1360, y:1360, w:228, h:150 },   // club-house (abbaye médiévale)
  pool:    { x:1640, y:1255, w:148, h:86 },
  tennis:  { x:1300, y:1560, w:96, h:128 },
  parking: { x:1772, y:1560, w:230, h:150 },
  practice:{ x:1360, y:1185, w:216, h:66 },
  d130:    { pts:[[1160,1858],[1700,1882],[2200,1842],[2392,1820]], w:42 },
};

// Maisons : {id,x,y,w,h,type,label,color}
const HOUSES = [
  // Cluster nord — autour des Lutreau
  { id:'lutreau', x:636, y:262, w:96, h:74, type:'villa', label:'LUTREAU', color:'#ff5050' },
  { x:470, y:212, w:76, h:58, type:'villa' },
  { x:842, y:228, w:76, h:58, type:'villa' },
  { x:336, y:268, w:72, h:56, type:'villa' },
  // Allée des Fougères — maison Jungers (joueur) + voisines
  { id:'jungers', x:444, y:792, w:88, h:66, type:'villa', label:'JUNGERS', color:'#ffd040' },
  { x:660, y:540, w:76, h:58, type:'villa' },
  { x:392, y:548, w:72, h:56, type:'villa' },
  // Allée des Hameaux — Paul + petits frères
  { id:'paul', x:150, y:812, w:84, h:62, type:'villa', label:'PAUL', color:'#ff5050' },
  { x:140, y:584, w:68, h:54, type:'villa' },
  // Manoirs allée de la Lisière (donnent sur le golf)
  { id:'webb',   x:968, y:452, w:108, h:84, type:'manor', label:'WEBB',   color:'#ff5050' },
  { id:'martin', x:1146,y:660, w:108, h:84, type:'manor', label:'MARTIN', color:'#ff5050' },
  // Kupi — grand manoir isolé au sud (hub de la bande)
  { id:'kupi',   x:792, y:884, w:120, h:92, type:'manor', label:'KUPI',   color:'#ff5050' },
];

// Position « devant la porte » d'une maison (façade sud)
function houseById(id) { return HOUSES.find(h => h.id === id); }
function front(id, dx = 0, dy = 0) {
  const h = houseById(id);
  return { x: h.x + h.w / 2 + dx, y: h.y + h.h + 34 + dy };
}

// Arbres décoratifs DANS la clairière (bloquants) — discrets, loin du spawn
const DECO_TREES = [
  [730,700,16],[300,690,18],[1000,840,16],
  [900,360,15],[1050,720,16],[250,520,16],[660,1000,17],
];

// Looks fidèles des persos (cf. brief de Pierre)
const LOOKS = {
  victor:  { hair:'#241608', skin:'#c39a5e', shirt:'#c83030', pants:'#39414f', shoes:'#2a2a30' },                 // brun, mat
  charles: { hair:'#3a2410', skin:'#e8c49a', shirt:'#d07820', pants:'#39414f', shoes:'#2a2a30', hat:'#2c5aa0' },  // casquette
  margot:  { hair:'#e8c84a', skin:'#f4d8b8', shirt:'#e060a0', pants:'#8a4a8a', shoes:'#6a3a6a', hairStyle:'curly' }, // blonde bouclée
  antoine: { hair:'#3a2a18', skin:'#eed0a8', shirt:'#5090c0', pants:'#39414f', shoes:'#2a2a30', glasses:true },   // lunettes
  oscar:   { hair:'#e8d24a', skin:'#f6dcc0', shirt:'#e8c83a', pants:'#5a6a3a', shoes:'#3a3a30', build:'chubby' }, // blond, enrobé, pâle
  louis:   { hair:'#3a2410', skin:'#f2dcc4', shirt:'#7050a0', pants:'#39414f', shoes:'#2a2a30' },                 // brun, peau blanche
  kupi:    { hair:'#4a3018', skin:'#dcb488', shirt:'#806040', pants:'#39414f', shoes:'#2a2a30' },
  paul:    { hair:'#1a1a1a', skin:'#e8c49a', shirt:'#404858', pants:'#2a2a30', shoes:'#1a1a1a' },
};

// PNJ : chacun devant SA maison (calé ensuite sur la case marchable la plus proche)
const NPC_ANCHORS = [
  { id:'victor',  ...front('lutreau', -34), look:LOOKS.victor,  idle:'victor_greet'  },
  { id:'charles', ...front('lutreau',  26), look:LOOKS.charles, idle:'charles_greet' },
  { id:'margot',  ...front('lutreau',  -6, 20), look:LOOKS.margot, idle:'margot_greet', wander:true },
  { id:'antoine', ...front('lutreau',  58), look:LOOKS.antoine, idle:'antoine_greet' },
  { id:'oscar',   ...front('webb',   -8), look:LOOKS.oscar,  idle:'oscar_greet'   },
  { id:'louis',   ...front('martin',-12), look:LOOKS.louis,  idle:'louis_greet'   },
  { id:'kupi',    ...front('kupi',   -8), look:LOOKS.kupi,   idle:'kupi_greet'    },
  { id:'paul',    ...front('paul',    0), look:LOOKS.paul,   idle:'paul_greet'    },
];

// Chiens errants — « Comment tu vas, toi ? » → « Ouaf ouaf ! »
const DOGS = [
  { id:'dog1', kind:'dog', name:'le chien', x:560, y:640, color:'#8a6038', wander:true, range:34 },
  { id:'dog2', kind:'dog', name:'le chien', x:320, y:880, color:'#2a2a2a', wander:true, range:34 },
  { id:'dog3', kind:'dog', name:'le chien', x:900, y:720, color:'#e6ddcb', wander:true, range:34 },
];

// Passants (petits vieux) qui se baladent dans les allées
const PASSANT_LOOK_A = { hair:'#bcbcbc', skin:'#e6c8a2', shirt:'#7a8a6a', pants:'#56564e', shoes:'#3a3a30' };
const PASSANT_LOOK_B = { hair:'#cfcfcf', skin:'#dcbc94', shirt:'#9a7a6a', pants:'#4a4a4a', shoes:'#2a2a2a' };
const PASSANTS = [
  { id:'passant1', kind:'passant', name:'Mme Lévêque', x:560, y:500, look:PASSANT_LOOK_A, wander:true, range:48,
    idle:[ {speaker:'Mme Lévêque', text:"Ah, les jeunes ! Profitez-en, c'est le plus bel été."},
           {speaker:'Mme Lévêque', text:"Vous n'auriez pas vu mon chien ? Il file toujours vers le golf."} ] },
  { id:'passant2', kind:'passant', name:'M. Grémont', x:255, y:700, look:PASSANT_LOOK_B, wander:true, range:48,
    idle:[ {speaker:'M. Grémont', text:"Belle journée pour marcher, n'est-ce pas ?"},
           {speaker:'M. Grémont', text:"De mon temps, on rentrait à la nuit tombée. Et encore."} ] },
  { id:'passant3', kind:'passant', name:'Le facteur', x:700, y:560, look:PASSANT_LOOK_A, wander:true, range:40,
    idle:[ {speaker:'Le facteur', text:"Du courrier pour les Lutreau, encore des magazines de Charles."},
           {speaker:'Le facteur', text:"Bonne journée, petit !"} ] },
];

// PNJ du golf
const GOLF_NPCS = [
  { id:'greenkeeper', kind:'npc', name:'Marcel', x:1470, y:1290,
    look:{ hair:'#9a9a9a', skin:'#d8b48a', shirt:'#2e6a3a', pants:'#3a3a2a', shoes:'#2a2a1a' },
    idle:[ {speaker:'Marcel', text:"Pas de vélo sur les greens, petit. C'est sacré, un green."},
           {speaker:'Marcel', text:"Ce golf, c'est le plus beau des Yvelines. Respecte-le."} ] },
];

const SPAWN_ANCHOR = front('jungers', 0, -6);  // place du Prieuré, devant chez Jungers
const BIKE_ANCHOR  = { x:560, y:760 };          // posé au bord de l'allée des Fougères

// Lampadaires « à l'anglaise » le long des allées
function lampsAlong(road, spacing, side) {
  const out = [], off = road.w / 2 + 10;
  for (let i = 0; i < road.pts.length - 1; i++) {
    const [ax, ay] = road.pts[i], [bx, by] = road.pts[i + 1];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len * side, ny = dx / len * side;
    const n = Math.floor(len / spacing);
    for (let k = 1; k <= n; k++) {
      const t = (k * spacing) / len;
      out.push({ x: ax + dx * t + nx * off, y: ay + dy * t + ny * off });
    }
  }
  return out;
}
const LAMPS = [
  ...lampsAlong(ROADS[1], 80, 1),    // Allée des Hameaux
  ...lampsAlong(ROADS[0], 95, -1),   // Allée des Fougères
];

// Voitures garées devant une maison sur deux (sur la terrasse / l'allée)
const CARS = (() => {
  const cols = ['#b83030', '#2c50a0', '#d8d8d8', '#3a3a3a', '#2e8050', '#c08030'];
  const out = [];
  HOUSES.forEach((h, i) => {
    if (i % 2 !== 0) return;
    out.push({ x: h.x + h.w * 0.6, y: h.y + h.h + 16, col: cols[i % cols.length] });
  });
  return out;
})();

// ── TESTS GÉOMÉTRIQUES ─────────────────────────────────────────
function inPoly(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if (((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx*dx + dy*dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t*dx), py - (ay + t*dy));
}
function nearPolyline(road, x, y) {
  const half = road.w / 2;
  for (let i = 0; i < road.pts.length - 1; i++) {
    const [ax, ay] = road.pts[i], [bx, by] = road.pts[i+1];
    if (distSeg(x, y, ax, ay, bx, by) <= half) return true;
  }
  return false;
}
function inEllipse(e, x, y) {
  const dx = (x - e.cx) / e.rx, dy = (y - e.cy) / e.ry;
  return dx*dx + dy*dy <= 1;
}
function inRect(r, x, y, m = 0) {
  return x >= r.x - m && x <= r.x + r.w + m && y >= r.y - m && y <= r.y + r.h + m;
}
function inHouseBlock(h, x, y) {
  const m = 4; // on ne bloque que le bâtiment (la terrasse/jardin restent praticables)
  return x >= h.x - m && x <= h.x + h.w + m &&
         y >= h.y - m && y <= h.y + h.h + m;
}

function walkableAt(x, y) {
  if (x < 4 || y < 4 || x > W - 4 || y > H - 4) return false;
  // Bloqueurs (priorité)
  for (const h of HOUSES)       if (inHouseBlock(h, x, y)) return false;
  for (const t of DECO_TREES)   if (Math.hypot(x - t[0], y - t[1]) < t[2] * 0.8) return false;
  for (const l of LAMPS)        if (Math.hypot(x - l.x, y - l.y) < 5) return false;
  for (const c of CARS)         if (x >= c.x - 2 && x <= c.x + 16 && y >= c.y - 2 && y <= c.y + 28) return false;
  // Golf : bâtiments bloquants
  if (inRect(GOLF.abbey, x, y)) return false;
  if (inRect(GOLF.pool, x, y))  return false;   // bassin (eau)
  // Surfaces marchables — hameau
  if (inPoly(PRAIRIE, x, y))    return true;
  if (inEllipse(GRAVEL, x, y))  return true;
  for (const r of ROADS)        if (nearPolyline(r, x, y)) return true;
  // Surfaces marchables — golf
  if (inPoly(GOLF.rough, x, y)) return true;
  if (inRect(GOLF.parking, x, y) || inRect(GOLF.practice, x, y) || inRect(GOLF.tennis, x, y)) return true;
  if (nearPolyline(GOLF.d130, x, y)) return true;
  return false; // sinon = forêt (bloquée)
}

function buildSolid() {
  const cols = Math.ceil(W / TILE), rows = Math.ceil(H / TILE);
  const solid = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      solid[r * cols + c] = walkableAt(c * TILE + TILE/2, r * TILE + TILE/2) ? 0 : 1;
  return { solid, cols, rows };
}

// Cale un point sur le centre de la case marchable la plus proche
function snapWalkable(grid, x, y) {
  const c0 = Math.floor(x / TILE), r0 = Math.floor(y / TILE);
  for (let rad = 0; rad < 12; rad++) {
    for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
      if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
      const c = c0 + dc, r = r0 + dr;
      if (c < 0 || r < 0 || c >= grid.cols || r >= grid.rows) continue;
      if (!grid.solid[r * grid.cols + c])
        return { x: c * TILE + TILE/2, y: r * TILE + TILE/2 };
    }
  }
  return { x, y };
}

// ═══════════════════════════════════════════════════════════════
// RENDU ARTISTIQUE (navigateur) — peint le monde dans un canvas
// ═══════════════════════════════════════════════════════════════
let g; // contexte courant
let _s = 12345;
function rng() { _s = Math.imul(_s ^ _s>>>13, _s|7); _s ^= _s<<17; return (_s>>>0) / 4294967296; }
function seed(n) { _s = n>>>0; rng(); }

function fr(x,y,w,h,c,s,sw=1,r=0){ if(r){g.beginPath();g.roundRect(x,y,w,h,r);} if(c){g.fillStyle=c; r?g.fill():g.fillRect(x,y,w,h);} if(s){g.strokeStyle=s;g.lineWidth=sw; r?g.stroke():g.strokeRect(x,y,w,h);} }
function el(cx,cy,rx,ry,c,s,sw=1){ g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,Math.PI*2); if(c){g.fillStyle=c;g.fill();} if(s){g.strokeStyle=s;g.lineWidth=sw;g.stroke();} }
function ci(cx,cy,r,c,s,sw=1){ g.beginPath();g.arc(cx,cy,r,0,Math.PI*2); if(c){g.fillStyle=c;g.fill();} if(s){g.strokeStyle=s;g.lineWidth=sw;g.stroke();} }
function poly(pts,c,s,sw=1){ g.beginPath();g.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]); g.closePath(); if(c){g.fillStyle=c;g.fill();} if(s){g.strokeStyle=s;g.lineWidth=sw;g.stroke();} }
function stroke(pts,col,w){ g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]); g.strokeStyle=col;g.lineWidth=w;g.stroke(); }

function drawRoad(r){
  if (r.kind === 'road') {
    stroke(r.pts, P.roe, r.w + 6);
    stroke(r.pts, P.ro,  r.w);
    stroke(r.pts, P.roc + 'aa', r.w * 0.45);
  } else {
    stroke(r.pts, P.ptd, r.w + 4);
    stroke(r.pts, P.pt,  r.w);
  }
}
function drawFairway(f){
  stroke(f.pts, P.rgd, f.w + 30);
  stroke(f.pts, P.rg,  f.w + 16);
  stroke(f.pts, P.fw,  f.w);
  stroke(f.pts, P.fwl, f.w * 0.5);
}
function drawGreen(e){
  el(e.cx,e.cy,e.rx+6,e.ry+6,P.gge);
  el(e.cx,e.cy,e.rx,e.ry,P.gg);
  el(e.cx,e.cy,e.rx*0.5,e.ry*0.45,P.ggl);
  ci(e.cx,e.cy,6,P.gge); ci(e.cx,e.cy,4,'#111');
  g.strokeStyle=P.fp;g.lineWidth=3;g.beginPath();g.moveTo(e.cx,e.cy);g.lineTo(e.cx,e.cy-40);g.stroke();
  poly([[e.cx,e.cy-40],[e.cx+18,e.cy-33],[e.cx,e.cy-26]],P.fr);
}
function drawBunker(b){ const [cx,cy,rx,ry,rot]=b; g.save();g.translate(cx,cy);g.rotate(rot); el(0,0,rx+3,ry+3,P.sdd);el(0,0,rx,ry,P.sd);el(0,0,rx*0.55,ry*0.5,P.sdl); g.restore(); }
function drawTree(cx,cy,r){
  g.fillStyle='#3a2010';g.fillRect(cx-2,cy+r*0.3,4,r*0.8);
  ci(cx+r*0.2,cy+r*0.6,r*0.8,P.ts+'55');
  ci(cx,cy,r,P.tt); ci(cx-r*0.28,cy-r*0.06,r*0.72,P.tb);
  ci(cx+r*0.2,cy-r*0.16,r*0.56,P.tt); ci(cx-r*0.12,cy-r*0.24,r*0.3,'rgba(120,200,80,0.5)');
}
// Haie de buissons sur le périmètre d'un rectangle de jardin
function drawHedgeRing(x0, y0, x1, y1){
  const step = 11;
  for (let x = x0; x <= x1; x += step){ ci(x, y0, 5, P.he, P.hel, 0.5); ci(x, y1, 5, P.he, P.hel, 0.5); }
  for (let y = y0; y <= y1; y += step){ ci(x0, y, 5, P.he, P.hel, 0.5); ci(x1, y, 5, P.he, P.hel, 0.5); }
}

// Maison : jardin (2-3× la maison) + terrasse dalles grises + baies vitrées,
// toit PLAT (villas forêt) ou PENTU (manoirs de lisière). Orientée plein sud.
function drawHouse(h, pitched){
  const cx=h.x+h.w/2, cy=h.y+h.h/2, w=h.w, hh=h.h, hw=w/2, hht=hh/2;
  g.save(); g.translate(cx, cy);
  // 1. Jardin (pelouse), plus large vers l'avant (sud)
  const gL=-w*0.9, gR=w*0.9, gT=-hht-h*0.45, gB=hht+h*1.25;
  fr(gL, gT, gR-gL, gB-gT, P.hg, null, 0, 10);
  // 2. Terrasse en dalles grises devant la maison
  const tY=hht+1, tH=h*0.55;
  fr(-hw-3, tY, w+6, tH, '#bab7ae', null, 0, 2);
  g.strokeStyle='#9a978f'; g.lineWidth=1;
  for(let gx=-hw; gx<=hw; gx+=8){ g.beginPath(); g.moveTo(gx,tY); g.lineTo(gx,tY+tH); g.stroke(); }
  for(let gy=tY+6; gy<tY+tH; gy+=7){ g.beginPath(); g.moveTo(-hw-3,gy); g.lineTo(hw+3,gy); g.stroke(); }
  // 3. Ombre de la maison
  g.fillStyle='rgba(0,0,0,0.2)'; g.fillRect(-hw+3, hht-1, w, 5);
  // 4. Couleurs
  const wc = h.label ? (pitched?'#f0e0d0':'#f0d8c0') : (pitched?P.mw:P.vw);
  const rc = pitched ? (h.label?'#3a2858':P.mr) : '#6f675c';     // pentu sombre / toit plat
  const rcl= pitched ? (h.label?'#504878':P.mrl) : '#8a8276';
  const roofH=Math.round(hh*(pitched?0.55:0.34)), facY=-hht+roofH, facH=hh-roofH, eave=6;
  // 5. Façade + grandes baies vitrées + porte
  fr(-hw, facY, w, facH, wc, P.vwo, 1.5);
  const bayY=facY+Math.max(2,facH*0.16), bayH=facH*0.5, bayW=w*0.32;
  fr(-hw+3, bayY, bayW, bayH, '#a8d0e8', '#7a98b0', 1);
  fr(hw-3-bayW, bayY, bayW, bayH, '#a8d0e8', '#7a98b0', 1);
  g.fillStyle='rgba(255,255,255,0.28)'; g.fillRect(-hw+4, bayY+1, bayW*0.5, 2); g.fillRect(hw-2-bayW, bayY+1, bayW*0.5, 2);
  const dw=Math.max(7,w*0.16), dh=facH*0.6;
  fr(-dw/2, hht-dh, dw, dh, P.vdo, P.vwo, 1.5, 1);
  ci(dw/2-2, hht-dh*0.5, 1.4, '#c89030');
  // 6. Toit
  if (pitched){
    poly([[-hw-eave,facY],[hw+eave,facY],[hw*0.45,-hht],[-hw*0.45,-hht]], rc);
    g.fillStyle=rcl; g.fillRect(Math.round(-hw*0.45),-hht,Math.round(w*0.45),2);
    g.fillStyle='rgba(0,0,0,0.25)'; g.fillRect(-hw-eave,facY-2,w+2*eave,2);
    fr(hw*0.5,-hht-10,7,14,P.sdd,'#6a4420',1);                    // cheminée
  } else {
    fr(-hw-2,-hht,w+4,roofH+2,rc,null,0);                         // toit plat (dalle)
    fr(-hw-2,-hht,w+4,3,rcl);                                     // acrotère clair
    g.strokeStyle='#5a5248'; g.lineWidth=1;
    for(let gy=-hht+5; gy<facY-1; gy+=5){ g.beginPath(); g.moveTo(-hw,gy); g.lineTo(hw,gy); g.stroke(); }
    g.fillStyle='#5a5248'; g.fillRect(-hw-2,facY-2,w+4,2);
  }
  // 7. Haie de périmètre + massif de fleurs (parfois)
  drawHedgeRing(gL, gT, gR, gB);
  if (h._flowers){
    for(let k=0;k<9;k++){ const fx=gL+10+(k%3)*7, fy=gT+12+((k/3|0))*6;
      g.fillStyle=[P.flower1,P.flower2,P.flower3][k%3]; g.fillRect(fx,fy,3,3); }
  }
  g.restore();
}

// Lampadaire à l'anglaise (mât + lanterne)
function drawLamp(x, y){
  g.fillStyle='rgba(0,0,0,0.22)'; g.fillRect(x-3, y+1, 8, 2);
  g.fillStyle='#2a2a2a'; g.fillRect(x-1, y-15, 2, 16);          // mât
  g.fillStyle='#1c1c1c'; g.fillRect(x-3, y-19, 6, 4);           // lanterne
  g.fillStyle='#ffe9a0'; g.fillRect(x-2, y-18, 4, 2);           // verre lumineux
  g.fillStyle='#2a2a2a'; g.fillRect(x-3, y-20, 6, 1);           // chapeau
}

// Voiture garée (vue de dessus), carrosserie + vitres + roues
function drawParkedCar(x, y, col){
  g.fillStyle='rgba(0,0,0,0.25)'; fr(x+1, y+2, 14, 26, 'rgba(0,0,0,0.22)', null, 0, 3);
  fr(x+1, y, 12, 26, col, null, 0, 3);
  g.fillStyle='rgba(255,255,255,0.18)'; g.fillRect(x+2, y+1, 10, 3);
  g.fillStyle='#9cc8e0'; fr(x+3, y+4, 8, 6, '#9cc8e0', null, 0, 1); fr(x+3, y+15, 8, 6, '#9cc8e0', null, 0, 1);
  g.fillStyle='#e8e8e8'; g.fillRect(x+3, y+1, 8, 2);            // pare-brise haut
  g.fillStyle='#1a1a1a'; g.fillRect(x-1, y+4, 2, 5); g.fillRect(x+13, y+4, 2, 5);  // roues
  g.fillRect(x-1, y+17, 2, 5); g.fillRect(x+13, y+17, 2, 5);
}

// Touffe d'herbe haute (déco, non bloquante)
function tuft(x, y){
  g.fillStyle = '#3a6a1e';
  g.fillRect(x, y+1, 1, 3); g.fillRect(x+2, y, 1, 4); g.fillRect(x+4, y+1, 1, 3);
  g.fillStyle = '#52962e';
  g.fillRect(x+1, y+1, 1, 2); g.fillRect(x+3, y, 1, 3);
}
// Texture de prairie : micro-grain + touffes + parterres de fleurs (variété)
function scatterMeadow(){
  seed(777);
  // 1. Grain fin (3 nuances) — casse l'aplat
  for (let i = 0; i < 2600; i++) {
    const x = rng()*W, y = rng()*H;
    if (!inPoly(PRAIRIE, x, y)) continue;
    const v = rng();
    g.fillStyle = v < 0.5 ? P.prd : v < 0.8 ? P.prl : P.law;
    g.fillRect(x, y, 2, 2);
  }
  // 2. Touffes d'herbe haute
  for (let i = 0; i < 150; i++) {
    const x = rng()*W, y = rng()*H;
    if (inPoly(PRAIRIE, x, y)) tuft(x, y);
  }
  // 3. Parterres de fleurs (petits groupes colorés)
  for (let i = 0; i < 50; i++) {
    const cx = rng()*W, cy = rng()*H;
    if (!inPoly(PRAIRIE, cx, cy)) continue;
    const col = [P.flower1, P.flower2, P.flower3][(rng()*3)|0];
    const n = 4 + (rng()*4|0);
    for (let k = 0; k < n; k++) {
      const x = cx + (rng()-0.5)*16, y = cy + (rng()-0.5)*12;
      g.fillStyle = '#3a6820'; g.fillRect(x, y+2, 1, 2);   // tige
      g.fillStyle = col;        g.fillRect(x, y, 2, 2);     // pétale
    }
  }
}
// ── Bâtiments & surfaces du golf ──
function drawAbbey(a){
  const { x, y, w, h } = a;
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 5, y + h - 2, w, 9);
  fr(x, y + h * 0.42, w, h * 0.58, '#c4a260', '#8a6030', 2);          // murs pierre
  fr(x - 4, y, w + 8, h * 0.46, '#6a2818', '#4a1c08', 2);            // toit tuiles
  g.fillStyle = '#822e14';
  for (let i = 0; i < w / 12; i++) g.fillRect(x - 2 + i * 12, y + 2, 6, h * 0.42);
  // arches romanes
  const n = Math.max(3, Math.floor(w / 28));
  for (let i = 0; i < n; i++) {
    const ax = x + 10 + i * ((w - 16) / n);
    fr(ax, y + h * 0.52, (w - 16) / n - 6, h * 0.4, '#caddf2');
    g.fillStyle = '#3a1c08'; g.fillRect(ax - 2, y + h * 0.52, 2, h * 0.4);
  }
  // clocher
  fr(x + w - 30, y - 34, 26, 38, '#c4a260', '#8a6030', 1.5);
  fr(x + w - 32, y - 38, 30, 8, '#6a2818', null);
  // jardin du cloître
  fr(x + 6, y + h + 2, w - 12, 14, P.hg, P.hh, 1);
}
function drawPool(p){
  const { x, y, w, h } = p;
  fr(x - 12, y - 10, w + 24, h + 24, '#cfc9b4', null, 0, 4);          // plage/deck
  fr(x, y, w, h, P.wa, P.wal, 2, 3);
  fr(x + 2, y + 2, w - 4, h - 4, P.wal, null, 0, 2);
  fr(x + 4, y + 4, w * 0.5, 5, 'rgba(255,255,255,0.25)');
  g.setLineDash([6, 5]); g.strokeStyle = '#cfeaff'; g.lineWidth = 1.5;
  for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x + 2, y + i * h / 4); g.lineTo(x + w - 2, y + i * h / 4); g.stroke(); }
  g.setLineDash([]);
  for (let i = 0; i < 5; i++) fr(x + 6 + i * ((w - 12) / 5), y + h + 4, 8, 5, '#e8e0c4', '#b0a884', 0.5);
}
function drawTennis(t){
  const { x, y, w, h } = t;
  fr(x, y, w, h, '#bf6f38', '#7a3a18', 2);
  g.strokeStyle = '#f0f0f0'; g.lineWidth = 1.5; g.strokeRect(x + 5, y + 5, w - 10, h - 10);
  g.beginPath(); g.moveTo(x + 3, y + h / 2); g.lineTo(x + w - 3, y + h / 2); g.stroke();
  g.beginPath(); g.moveTo(x + w / 2, y + 5); g.lineTo(x + w / 2, y + h - 5); g.stroke();
}
function drawParking(p){
  const { x, y, w, h } = p;
  fr(x, y, w, h, '#9a948a', '#6e685e', 2);
  g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 1;
  for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(x + i * w / 8, y + 4); g.lineTo(x + i * w / 8, y + h - 4); g.stroke(); }
  const cols = ['#b83030', '#2c50a0', '#d8d8d8', '#3a3a3a', '#2e8050'];
  for (let i = 0; i < 5; i++) drawParkedCar(x + 10 + i * ((w - 24) / 5), y + 12, cols[i % cols.length]);
}
function drawPractice(p){
  const { x, y, w, h } = p;
  for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? P.fw : P.fwl; g.fillRect(x + i * w / 10, y, Math.ceil(w / 10), h); }
  fr(x, y, w, h, null, P.rgd, 2);
}
function paintGolfGround(){
  poly(GOLF.rough, P.rg, P.fe, 3);
  el(1800, 1320, 320, 280, P.rgd);
  el(1500, 1000, 220, 160, P.rgd);
  GOLF.fairways.forEach(drawFairway);
  GOLF.greens.forEach(drawGreen);
  GOLF.bunkers.forEach(drawBunker);
}
function paintGolfStructures(){
  // D130 (tarmac) en bas
  stroke(GOLF.d130.pts, '#4e4e4e', GOLF.d130.w + 6);
  stroke(GOLF.d130.pts, '#6e6e6e', GOLF.d130.w);
  g.setLineDash([20, 14]); g.strokeStyle = '#d8c870'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(GOLF.d130.pts[0][0], GOLF.d130.pts[0][1]);
  for (let i = 1; i < GOLF.d130.pts.length; i++) g.lineTo(GOLF.d130.pts[i][0], GOLF.d130.pts[i][1]);
  g.stroke(); g.setLineDash([]);
  drawPractice(GOLF.practice);
  drawAbbey(GOLF.abbey);
  drawPool(GOLF.pool);
  drawTennis(GOLF.tennis);
  drawParking(GOLF.parking);
}

function inAnyGolfStruct(x, y){
  return inRect(GOLF.parking, x, y, 6) || inRect(GOLF.practice, x, y, 4) ||
         inRect(GOLF.tennis, x, y, 6) || inRect(GOLF.abbey, x, y, 10) ||
         inRect(GOLF.pool, x, y, 14);
}
function forestBorder(){
  seed(4242);
  for (let i = 0; i < 3000; i++) {
    const x = rng()*W, y = rng()*H;
    if (inPoly(PRAIRIE, x, y)) continue;
    if (inPoly(GOLF.rough, x, y)) continue;
    if (inAnyGolfStruct(x, y)) continue;
    if (nearPolyline(GOLF.d130, x, y)) continue;
    let onRoad = false; for (const r of ROADS) if (nearPolyline(r, x, y)) { onRoad = true; break; }
    if (onRoad) continue;
    drawTree(x, y, 9 + rng()*8);
  }
}

// Peint tout le monde dans le contexte fourni (résolution monde)
function paintWorld(ctx) {
  g = ctx;
  // 1. Forêt de fond
  g.fillStyle = P.fm; g.fillRect(0, 0, W, H);
  seed(99); for (let i = 0; i < 420; i++) { const x=rng()*W,y=rng()*H; el(x,y,30+rng()*70,18+rng()*40, rng()<0.5?P.fd:P.fl); }
  // 2. Golf (sol : rough, fairways, greens, bunkers)
  paintGolfGround();
  // 3. Clairière prairie du hameau + nuances
  poly(PRAIRIE, P.pr, P.fe, 3);
  el(560, 480, 360, 300, P.prl);
  el(820, 760, 280, 200, P.prl);
  el(380, 380, 150, 110, P.law);
  el(1000, 900, 170, 120, P.prd);
  scatterMeadow();
  // 4. Place du Prieuré (gravier)
  el(GRAVEL.cx, GRAVEL.cy, GRAVEL.rx, GRAVEL.ry, P.gr, P.grd, 2);
  el(GRAVEL.cx, GRAVEL.cy, GRAVEL.rx-10, GRAVEL.ry-10, P.gr);
  // 5. Routes / allées
  ROADS.forEach(drawRoad);
  // 6. Structures du golf (abbaye, piscine, tennis, parking, practice, D130)
  paintGolfStructures();
  // 7. Maisons (du nord au sud) — villas forêt à toit plat, lisière à toit pentu
  HOUSES.slice().sort((a,b)=>a.y-b.y).forEach((h,i)=>{ h._flowers = (i % 3 === 1); drawHouse(h, h.type==='manor'); });
  // 7b. Voitures garées devant + lampadaires des allées
  CARS.forEach(c => drawParkedCar(c.x, c.y, c.col));
  LAMPS.forEach(l => drawLamp(l.x, l.y));
  // 8. Arbres : bordure forêt + décor clairière
  forestBorder();
  DECO_TREES.forEach(([x,y,r]) => drawTree(x, y, r));
}

// Pixellise un canvas source dans un canvas destination (crunch GBA)
function pixelate(src, makeCanvas) {
  const pw = Math.floor(W / PIXELATE), ph = Math.floor(H / PIXELATE);
  const small = makeCanvas(pw, ph);
  const sc = small.getContext('2d'); sc.imageSmoothingEnabled = false;
  sc.drawImage(src, 0, 0, pw, ph);
  const out = makeCanvas(W, H);
  const oc = out.getContext('2d'); oc.imageSmoothingEnabled = false;
  oc.drawImage(small, 0, 0, pw, ph, 0, 0, W, H);
  return out;
}

// ═══════════════════════════════════════════════════════════════
// API PUBLIQUE
// ═══════════════════════════════════════════════════════════════
export function buildWorld(makeCanvas) {
  const grid = buildSolid();
  const meta = {
    width: W, height: H, cols: grid.cols, rows: grid.rows, solid: grid.solid,
    label: 'Hameau du Prieuré',
    spawn: snapWalkable(grid, SPAWN_ANCHOR.x, SPAWN_ANCHOR.y),
    bike:  snapWalkable(grid, BIKE_ANCHOR.x, BIKE_ANCHOR.y),
    npcs:  [...NPC_ANCHORS, ...DOGS, ...PASSANTS, ...GOLF_NPCS]
             .map(n => ({ ...n, ...snapWalkable(grid, n.x, n.y) })),
    golf:  { x: 1500, y: 1300 },
  };
  // Le rendu n'est possible qu'en navigateur (Canvas réel)
  if (makeCanvas) {
    try {
      const art = makeCanvas(W, H);
      const actx = art.getContext('2d');
      actx.imageSmoothingEnabled = true;
      paintWorld(actx);
      meta.ground = pixelate(art, makeCanvas);
    } catch (e) {
      meta.ground = null; // headless / pas de vrai canvas
    }
  }
  return meta;
}

export { W as WORLD_W, H as WORLD_H };
