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

// PNJ : chacun devant SA maison (calé ensuite sur la case marchable la plus proche)
const NPC_ANCHORS = [
  // Les Lutreau (+ Antoine qui squatte chez eux) — devant la villa Lutreau
  { id:'victor',  ...front('lutreau', -34), color:'#c83030', idle:'victor_greet'  },
  { id:'charles', ...front('lutreau',  26), color:'#d08020', idle:'charles_greet' },
  { id:'margot',  ...front('lutreau',  -6, 20), color:'#e060a0', idle:'margot_greet', wander:true },
  { id:'antoine', ...front('lutreau',  58), color:'#5090c0', idle:'antoine_greet' },
  // Oscar devant le manoir Webb (allée de la Lisière)
  { id:'oscar',   ...front('webb',   -8), color:'#e8d040', idle:'oscar_greet'   },
  // Louis devant le manoir Martin
  { id:'louis',   ...front('martin',-12), color:'#7050a0', idle:'louis_greet'   },
  // Kupi devant son grand manoir isolé
  { id:'kupi',    ...front('kupi',   -8), color:'#806040', idle:'kupi_greet'    },
  // Paul devant sa maison (allée des Hameaux)
  { id:'paul',    ...front('paul',    0), color:'#404858', idle:'paul_greet'    },
];

const SPAWN_ANCHOR = front('jungers', 0, -6);  // place du Prieuré, devant chez Jungers
const BIKE_ANCHOR  = { x:560, y:760 };          // posé au bord de l'allée des Fougères

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
  const m = 12; // marge jardin/haie
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
// Villa plain-pied : grand toit + petit mur (look Pokémon)
function drawVilla(h){
  const cx=h.x+h.w/2, cy=h.y+h.h/2, w=h.w, hh=h.h, hw=w/2, hht=hh/2;
  g.save();g.translate(cx,cy);
  // Jardin + haie
  fr(-hw-14,-hht-8,w+28,hh+22,P.hg,P.hh,1.5,6);
  for(let i=0;i<=5;i++){ci(-hw-10+i*(w+20)/5,-hht-6,5,P.he,P.hel,0.5);ci(-hw-10+i*(w+20)/5,hht+12,5,P.he,P.hel,0.5);}
  g.fillStyle='rgba(0,0,0,0.18)';g.fillRect(-hw+3,hht-1,w,6);
  const wc=h.label?'#f0d8c0':P.vw, rc=h.label?'#b85038':P.vr, rcl=h.label?'#d87858':P.vrl, rcd=P.vr2;
  const roofH=Math.round(hh*0.54), eave=6, wallY=-hht+roofH, wh=hh-roofH;
  // Mur (partie basse) + fenêtres + porte
  fr(-hw,wallY,w,wh,wc,P.vwo,1.5);
  const fwd=Math.max(7,Math.round(w*0.2));
  fr(-hw+4,wallY+3,fwd,Math.round(wh*0.45),P.vwi,P.vwo,1);
  fr(hw-4-fwd,wallY+3,fwd,Math.round(wh*0.45),P.vwi,P.vwo,1);
  const dw=Math.max(8,Math.round(w*0.22)), dh=Math.round(wh*0.6);
  fr(-dw/2,hht-dh,dw,dh,P.vdo,P.vwo,1.5,2);
  ci(dw/2-2,hht-dh*0.45,1.6,'#c89030');
  // Toit (trapèze à débord)
  poly([[-hw-eave,wallY],[hw+eave,wallY],[hw*0.42,-hht],[-hw*0.42,-hht]],rc);
  g.fillStyle=rcd;g.fillRect(-hw-eave,wallY-2,w+2*eave,2);          // avant-toit
  g.fillStyle=rcl;g.fillRect(Math.round(-hw*0.42),-hht,Math.round(w*0.42),2); // faîte
  g.strokeStyle=rcl;g.lineWidth=1;                                  // tuiles
  const my=wallY-roofH*0.5, mhw=hw*0.72+eave*0.5;
  g.beginPath();g.moveTo(-mhw,my);g.lineTo(mhw,my);g.stroke();
  g.restore();
}
// Manoir à étage : toit à deux pans haut, deux rangées de fenêtres
function drawManor(h){
  const cx=h.x+h.w/2, cy=h.y+h.h/2, w=h.w, hh=h.h, hw=w/2, hht=hh/2;
  g.save();g.translate(cx,cy);
  fr(-hw-18,-hht-12,w+36,hh+28,P.law,P.hh,1.5,7);
  for(let i=0;i<=6;i++){ci(-hw-14+i*(w+28)/6,-hht-10,6,P.hel,P.he,0.5);ci(-hw-14+i*(w+28)/6,hht+14,6,P.hel,P.he,0.5);}
  g.fillStyle='rgba(0,0,0,0.2)';g.fillRect(-hw+4,hht-2,w,8);
  const wc=h.label?'#f0e0d0':P.mw, rc=h.label?'#3a2858':P.mr, rcl=h.label?'#504878':P.mrl;
  const roofH=Math.round(hh*0.42), wallY=-hht+roofH, wh=hh-roofH, eave=7;
  // Mur (2 niveaux)
  fr(-hw,wallY,w,wh,wc,P.mw2,2);
  g.fillStyle=P.mw2;g.fillRect(-hw,wallY+wh*0.5,w,2);
  for(let i=0;i<3;i++){ const fx=-hw+w*0.14+i*w*0.3;                 // fenêtres étage
    fr(fx,wallY+3,w*0.14,wh*0.32,P.mwi,P.mw2,1);}
  for(let i=0;i<2;i++){ const fx=-hw+w*0.16+i*w*0.46;                // fenêtres RDC
    fr(fx,wallY+wh*0.56,w*0.16,wh*0.34,P.mwi,P.mw2,1);}
  const dw=Math.max(9,w*0.2), dh=wh*0.44;
  fr(-dw/2,hht-dh,dw,dh,P.vdo,P.mw2,1.5,2);                          // porte centrale
  // Toit 2 pans
  poly([[-hw-eave,wallY],[hw+eave,wallY],[hw*0.5,-hht],[-hw*0.5,-hht]],rc);
  poly([[0,-hht-4],[hw*0.5,-hht],[ -hw*0.5,-hht]],rcl);
  g.fillStyle=rcl;g.fillRect(Math.round(-hw*0.5),-hht,Math.round(w*0.5),2);
  g.fillStyle='#2a1c40';g.fillRect(-hw-eave,wallY-2,w+2*eave,2);
  fr(hw*0.5,-hht-12,8,16,P.sdd,'#6a4420',1);                         // cheminée
  g.restore();
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
  // 2. Clairière prairie + nuances douces (variété macro)
  poly(PRAIRIE, P.pr, P.fe, 3);
  el(560, 480, 360, 300, P.prl);
  el(820, 760, 280, 200, P.prl);
  el(380, 380, 150, 110, P.law);
  el(700, 980, 160, 100, P.law);
  el(1000, 900, 170, 120, P.prd);
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
