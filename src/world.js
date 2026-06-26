// ═══════════════════════════════════════════════════════════════
// LE PRIEURÉ RPG — MONDE (rendu aérien pixel-art + collisions)
// Approche reprise de assets/world_map_reference.html :
//   art vectoriel organique → pixellisation → upscale net.
// Les collisions sont calculées ANALYTIQUEMENT (testable sans navigateur).
// ═══════════════════════════════════════════════════════════════

export const TILE = 16;       // taille logique d'une case (collision)
const PIXELATE   = 2;         // facteur de pixellisation (crunch GBA)

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

// ── DIMENSIONS DU MONDE (hameau jouable) ───────────────────────
const W = 1600, H = 1200;

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
  // Allée de la Lisière (diagonale NE → golf)
  { pts:[[600,840],[720,760],[860,660],[1010,560],[1160,470],[1320,400],[1480,360]], w:48, kind:'road' },
  // Connecteurs
  { pts:[[556,360],[470,372],[360,378],[280,372]], w:26, kind:'path' },
  { pts:[[700,300],[640,290],[580,300]], w:24, kind:'path' },
  { pts:[[552,640],[470,648],[360,650]], w:24, kind:'path' },
];

// Place du Prieuré (cul-de-sac gravier) — ellipse
const GRAVEL = { cx:540, cy:920, rx:130, ry:95 };

// Golf : fairway qui entre par la lisière (évoque l'aérien) + green
const FAIRWAY = { pts:[[1340,400],[1440,388],[1540,392],[1600,400]], w:120 };
const GREEN   = { cx:1560, cy:396, rx:70, ry:48 };
const BUNKERS = [ [1470,340,30,16,-0.2], [1520,450,24,14,0.25] ];

// Étang (eau, bloquant)
const POND = { cx:1180, cy:980, rx:120, ry:80 };

// Maisons : {x,y,w,h,type,label,color}
const HOUSES = [
  // Cluster nord — autour des Lutreau
  { x:610, y:230, w:190, h:130, type:'villa', label:'LUTREAU', color:'#ff5050' },
  { x:430, y:180, w:150, h:104, type:'villa' },
  { x:830, y:200, w:150, h:104, type:'villa' },
  { x:300, y:250, w:140, h:100, type:'villa' },
  // Allée des Fougères — maison Jungers (joueur) + voisines
  { x:410, y:780, w:170, h:118, type:'villa', label:'JUNGERS', color:'#ffd040' },
  { x:650, y:520, w:150, h:104, type:'villa' },
  { x:380, y:520, w:140, h:100, type:'villa' },
  // Allée des Hameaux — Paul + petits frères
  { x:130, y:800, w:160, h:110, type:'villa', label:'PAUL', color:'#ff5050' },
  { x:120, y:560, w:130, h:96,  type:'villa' },
  // Manoirs allée de la Lisière (donnent sur le golf)
  { x:950, y:430, w:200, h:150, type:'manor', label:'WEBB',   color:'#ff5050' },
  { x:1130,y:640, w:200, h:150, type:'manor', label:'MARTIN', color:'#ff5050' },
  // Kupi — grand manoir isolé au sud (hub de la bande)
  { x:760, y:960, w:230, h:170, type:'manor', label:'KUPI',   color:'#ff5050' },
];

// Arbres décoratifs DANS la clairière (bloquants)
const DECO_TREES = [
  [700,690,26],[760,710,22],[300,700,24],[980,860,26],
  [880,360,22],[470,940,22],[1020,720,24],
];

// PNJ : cible d'ancrage (sera capée sur la case marchable la plus proche)
const NPC_ANCHORS = [
  { id:'victor',  x:690, y:400, color:'#c83030', firstMeet:'meet_victor_sequence', idle:'victor_idle' },
  { id:'charles', x:760, y:400, color:'#d08020', idle:'charles_idle' },
  { id:'margot',  x:640, y:430, color:'#e060a0', idle:'margot_idle', wander:true },
  { id:'antoine', x:720, y:440, color:'#5090c0', idle:'antoine_idle' },
  { id:'oscar',   x:1000,y:610, color:'#e8d040', idle:'oscar_idle' },
  { id:'louis',   x:1180,y:820, color:'#7050a0', idle:'louis_idle' },
  { id:'kupi',    x:820, y:1090,color:'#806040', idle:'kupi_idle' },
  { id:'paul',    x:215, y:960, color:'#404858', idle:'paul_idle' },
];

const SPAWN_ANCHOR = { x:500, y:930 };  // place du Prieuré, devant chez Jungers
const BIKE_ANCHOR  = { x:560, y:760 };  // posé au bord de l'allée des Fougères

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
function inHouseBlock(h, x, y) {
  const m = 18; // marge jardin/haie
  return x >= h.x - m && x <= h.x + h.w + m &&
         y >= h.y - m && y <= h.y + h.h + m;
}

function walkableAt(x, y) {
  if (x < 4 || y < 4 || x > W - 4 || y > H - 4) return false;
  // Bloqueurs (priorité)
  for (const h of HOUSES)       if (inHouseBlock(h, x, y)) return false;
  if (inEllipse(POND, x, y))    return false;
  for (const t of DECO_TREES)   if (Math.hypot(x - t[0], y - t[1]) < t[2] * 0.8) return false;
  // Surfaces marchables
  if (inPoly(PRAIRIE, x, y))    return true;
  if (inEllipse(GRAVEL, x, y))  return true;
  for (const r of ROADS)        if (nearPolyline(r, x, y)) return true;
  if (nearPolyline(FAIRWAY, x, y)) return true;
  if (inEllipse(GREEN, x, y))   return true;
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
function drawVilla(h){
  const cx=h.x+h.w/2, cy=h.y+h.h/2, w=h.w, hh=h.h, hw=w/2, hht=hh/2;
  g.save();g.translate(cx,cy);
  fr(-hw-16,-hht-14,w+32,hh+28,P.hg,P.hh,2,6);             // jardin
  for(let i=0;i<=6;i++){ci(-hw-12+i*(w+24)/6,-hht-12,6,P.he,P.hel,0.5);ci(-hw-12+i*(w+24)/6,hht+12,6,P.he,P.hel,0.5);}
  for(let i=1;i<3;i++){ci(-hw-12,-hht+i*hh/3,5,P.he,P.hel,0.5);ci(hw+12,-hht+i*hh/3,5,P.he,P.hel,0.5);}
  g.fillStyle='rgba(0,0,0,0.18)';g.fillRect(-hw+4,hht-2,w,9);
  const wc=h.label?'#f0d8c0':P.vw, rc=h.label?'#b85038':P.vr, rcl=h.label?'#d87858':P.vrl;
  fr(-hw,-hht,w,hh,wc,P.vwo,2);
  for(let i=1;i<4;i++){g.fillStyle=P.vw2+'66';g.fillRect(-hw,-hht+i*hh/4,w,2);}
  poly([[-hw-6,-hht-12],[hw+6,-hht-12],[hw,-hht],[-hw,-hht]],rc);   // toit
  poly([[-hw-6,-hht-12],[hw+6,-hht-12],[hw+6,-hht-15],[-hw-6,-hht-15]],rcl);
  fr(-hw+w*0.10,-hht+hh*0.24,w*0.26,hh*0.34,P.vwi,P.vwo,1.5);       // fenêtres
  fr(-hw+w*0.52,-hht+hh*0.24,w*0.26,hh*0.34,P.vwi,P.vwo,1.5);
  fr(-w*0.10,-hht+hh*0.46,w*0.2,hh*0.52,P.vdo,P.vwo,1.5,3);          // porte
  ci(w*0.06,-hht+hh*0.74,2.5,'#c89030');
  g.restore();
}
function drawManor(h){
  const cx=h.x+h.w/2, cy=h.y+h.h/2, w=h.w, hh=h.h, hw=w/2, hht=hh/2;
  g.save();g.translate(cx,cy);
  fr(-hw-22,-hht-18,w+44,hh+36,P.law,P.hh,2,7);
  for(let i=0;i<=7;i++){ci(-hw-18+i*(w+36)/7,-hht-15,7,P.hel,P.he,0.5);ci(-hw-18+i*(w+36)/7,hht+15,7,P.hel,P.he,0.5);}
  g.fillStyle='rgba(0,0,0,0.2)';g.fillRect(-hw+5,hht-3,w,11);
  const wc=h.label?'#f0e0d0':P.mw, rc=h.label?'#3a2858':P.mr, rcl=h.label?'#504878':P.mrl;
  fr(-hw,-hht,w,hh,wc,P.mw2,2.5);
  g.fillStyle=P.mw2;g.fillRect(-hw,-hht+hh*0.46,w,3);
  poly([[-hw,-hht],[hw,-hht],[hw+8,-hht-16],[0,-hht-28],[-hw-8,-hht-16]],rc);  // toit 2 pans
  poly([[0,-hht-28],[hw+8,-hht-16],[hw,-hht]],rcl);
  fr(hw-22,-hht-34,12,24,P.sdd,'#6a4420',1);                          // cheminée
  for(let i=0;i<3;i++){ const fx=-hw+w*0.12+i*w*0.3;                  // fenêtres RDC
    fr(fx,-hht+hh*0.56,w*0.18,hh*0.32,P.mwi,P.mw2,1.5);
    fr(fx-w*0.06,-hht+hh*0.56,w*0.05,hh*0.32,P.msh);fr(fx+w*0.18,-hht+hh*0.56,w*0.05,hh*0.32,P.msh);}
  for(let i=0;i<4;i++){ const fx=-hw+w*0.08+i*w*0.23;                 // fenêtres étage
    fr(fx,-hht+hh*0.12,w*0.15,hh*0.28,P.mwi,P.mw2,1.5);}
  fr(-w*0.1,-hht+hh*0.56,w*0.2,hh*0.42,P.vdo,P.mw2,2,3);              // porte
  g.restore();
}

// Texture de prairie : touffes + petites fleurs, dispersées (variété)
function scatterMeadow(){
  seed(777);
  for (let i = 0; i < 1400; i++) {
    const x = rng()*W, y = rng()*H;
    if (!inPoly(PRAIRIE, x, y)) continue;
    const v = rng();
    if (v < 0.55) { g.fillStyle = P.prd; g.fillRect(x, y, 2, 2); }            // touffe sombre
    else if (v < 0.8) { g.fillStyle = P.prl; g.fillRect(x, y, 3, 2); }        // touffe claire
    else if (v < 0.9) { g.fillStyle = P.flower1; g.fillRect(x, y, 2, 2); g.fillStyle=P.flower2; g.fillRect(x+1,y+1,1,1); }
    else if (v < 0.96){ g.fillStyle = P.flower2; g.fillRect(x, y, 2, 2); }
    else { g.fillStyle = P.flower3; g.fillRect(x, y, 2, 2); }
  }
}
function forestBorder(){
  // Bande d'arbres tout autour de la clairière (donne le cadre Pokémon)
  seed(4242);
  for (let i = 0; i < 1100; i++) {
    const x = rng()*W, y = rng()*H;
    if (inPoly(PRAIRIE, x, y)) continue;
    if (nearPolyline(FAIRWAY, x, y) || inEllipse(GREEN, x, y)) continue;
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
  seed(99); for (let i = 0; i < 220; i++) { const x=rng()*W,y=rng()*H; el(x,y,30+rng()*70,18+rng()*40, rng()<0.5?P.fd:P.fl); }
  // 2. Clairière prairie
  poly(PRAIRIE, P.pr, P.fe, 3);
  el(560, 480, 360, 300, P.prl);
  el(820, 760, 280, 200, P.prl);
  scatterMeadow();
  // 3. Golf (entre par la lisière)
  drawFairway(FAIRWAY); drawGreen(GREEN); BUNKERS.forEach(drawBunker);
  // 4. Place du Prieuré (gravier)
  el(GRAVEL.cx, GRAVEL.cy, GRAVEL.rx, GRAVEL.ry, P.gr, P.grd, 2);
  el(GRAVEL.cx, GRAVEL.cy, GRAVEL.rx-10, GRAVEL.ry-10, P.gr);
  // 5. Routes
  ROADS.forEach(drawRoad);
  // 6. Étang
  el(POND.cx, POND.cy, POND.rx+6, POND.ry+6, P.rgd);
  el(POND.cx, POND.cy, POND.rx, POND.ry, P.wa);
  el(POND.cx, POND.cy, POND.rx-8, POND.ry-8, P.wal);
  el(POND.cx-30, POND.cy-20, POND.rx*0.4, POND.ry*0.3, P.was+'66');
  // 7. Maisons (du nord au sud pour un léger recouvrement)
  HOUSES.slice().sort((a,b)=>a.y-b.y).forEach(h => h.type==='manor'?drawManor(h):drawVilla(h));
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
    npcs:  NPC_ANCHORS.map(n => ({ ...n, ...snapWalkable(grid, n.x, n.y) })),
    golf:  { x: 1460, y: 396 },   // sortie est (golf, à venir)
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
