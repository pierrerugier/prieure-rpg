// ═══════════════════════════════════════════════════════════════
// LE PRIEURÉ — NIVEAU dessiné à la main (tuiles + objets PixelLab)
// Mise en page pensée pour ressembler à la carte : hameau (maisons+haies+
// allées) en haut-gauche, club-house (abbaye) au centre, golf (fairways,
// greens, bunkers, étangs) autour, lisière de forêt. Collision = par design.
// terrain: g=herbe f=fairway d=sable(bunker) w=eau v=gravier/allée F=forêt
// ═══════════════════════════════════════════════════════════════

export const TILE = 16;
export const COLS = 144, ROWS = 132;     // monde 2304 × 2112

const T = new Array(COLS * ROWS).fill('g');
const OBJ = [];                          // {t, x, y, solid, w, h}  (x,y en px)
const ti = (c, r) => r * COLS + c;
const inb = (c, r) => c >= 0 && r >= 0 && c < COLS && r < ROWS;

function rect(x0, y0, x1, y1, code) {
  for (let r = y0; r <= y1; r++) for (let c = x0; c <= x1; c++) if (inb(c, r)) T[ti(c, r)] = code;
}
function disc(cx, cy, rad, code) {
  for (let r = cy-rad; r <= cy+rad; r++) for (let c = cx-rad; c <= cx+rad; c++)
    if (inb(c, r) && (c-cx)**2 + (r-cy)**2 <= rad*rad) T[ti(c, r)] = code;
}
function obj(t, cx, cy, solid = true, w = 1, h = 1) {
  OBJ.push({ t, x: cx * TILE + TILE/2, y: cy * TILE + TILE, solid, w, h });
}
function hedgeRect(x0, y0, x1, y1) {            // haie sur le périmètre
  for (let c = x0; c <= x1; c++) { obj('hedge', c, y0); obj('hedge', c, y1); }
  for (let r = y0+1; r < y1; r++) { obj('hedge', x0, r); obj('hedge', x1, r); }
}
function treeRow(x0, y0, x1, y1, step = 2) {
  const n = Math.max(Math.abs(x1-x0), Math.abs(y1-y0));
  for (let i = 0; i <= n; i += step) {
    const c = Math.round(x0 + (x1-x0)*i/n), r = Math.round(y0 + (y1-y0)*i/n);
    obj((c+r)%3 ? 'pine' : 'oak', c, r);
  }
}

// ── 1. FOND : tout en herbe, lisière de forêt sur le pourtour ──
rect(0, 0, COLS-1, ROWS-1, 'g');
const B = 4;                                    // épaisseur lisière
rect(0, 0, COLS-1, B-1, 'F'); rect(0, ROWS-B, COLS-1, ROWS-1, 'F');
rect(0, 0, B-1, ROWS-1, 'F'); rect(COLS-B, 0, COLS-1, ROWS-1, 'F');

// ── 2. GOLF : grandes zones de fairway + greens + bunkers + étangs ──
// fairways (bandes douces) répartis sur le domaine
function fairway(cx, cy, rx, ry) { for (let r=cy-ry;r<=cy+ry;r++) for(let c=cx-rx;c<=cx+rx;c++){ if(!inb(c,r))continue; const dx=(c-cx)/rx,dy=(r-cy)/ry; if(dx*dx+dy*dy<=1) T[ti(c,r)]='f'; } }
fairway(95, 24, 22, 7); fairway(118, 40, 9, 16); fairway(60, 30, 16, 6);
fairway(40, 70, 8, 20); fairway(80, 95, 26, 8); fairway(110, 100, 16, 7);
fairway(60, 110, 18, 6); fairway(120, 70, 9, 18);
// greens (petits disques de fairway clair + drapeau)
const greens = [[100,20],[124,52],[36,58],[44,86],[104,92],[122,108],[70,116],[58,30]];
for (const [gc,gr] of greens) { disc(gc, gr, 3, 'f'); obj('flag', gc, gr, false); }
// bunkers (sable)
const bunkers = [[90,26],[120,34],[34,72],[86,98],[112,96],[64,108],[52,26]];
for (const [bc,br] of bunkers) disc(bc, br, 2, 'd');
// étangs (eau)
disc(112, 60, 5, 'w'); disc(126, 116, 4, 'w'); disc(30, 96, 4, 'w');

// ── 3. HAMEAU (haut-gauche) : herbe + grille d'allées + maisons + haies ──
rect(8, 8, 52, 44, 'g');
// allées de gravier (grille)
rect(8, 26, 52, 27, 'v'); rect(8, 40, 52, 41, 'v');
for (const cx of [14, 24, 34, 44]) rect(cx, 8, cx+1, 44, 'v');
// maisons (sprite + haie + petit jardin) sur la grille
const roofs = ['house_red','house_blue','house_grey','house_brown','house_orange'];
let hi = 0;
const houseSpots = [[10,10],[20,10],[30,10],[40,10],[10,18],[30,18],[40,18],[10,30],[20,30],[40,30],[20,18]];
for (const [hx, hy] of houseSpots) {
  hedgeRect(hx-1, hy-1, hx+5, hy+5);
  obj(roofs[hi % roofs.length], hx+2, hy+2, true, 5, 4); hi++;
  if (hi % 2) obj(['flower_red','flower_yellow','flower_pink'][hi%3], hx+4, hy+5, false);
}
// lampadaires le long de l'allée centrale
for (let r = 10; r < 44; r += 8) { obj('lamp', 24, r, false); obj('lamp', 34, r, false); }

// ── 4. CLUB-HOUSE (abbaye) au centre + parking + cour gravier ──
rect(58, 50, 86, 70, 'v');                       // cour/parvis gravier
obj('abbey', 64, 52, true, 14, 9);               // l'abbaye (gros sprite)
rect(74, 60, 86, 70, 'v');                        // parking gravier
for (let i = 0; i < 5; i++) obj('car', 76 + i*2, 64, true);
disc(90, 56, 3, 'w'); rect(88, 53, 93, 59, 'v');  // piscine (eau) + plage gravier

// ── 5. ROUTES principales (gravier) ──
rect(28, 44, 29, 50, 'v'); rect(28, 50, 64, 51, 'v');   // hameau -> abbaye
rect(70, 70, 71, 100, 'v'); rect(40, 100, 110, 101, 'v'); // abbaye -> golf sud

// ── 6. Arbres : lisière dense + bosquets ──
for (let c = 2; c < COLS-2; c += 2) { obj('pine', c, 2, true); obj('oak', c, ROWS-3, true); }
for (let r = 2; r < ROWS-2; r += 2) { obj('oak', 2, r, true); obj('pine', COLS-3, r, true); }
treeRow(54, 8, 54, 44);          // sépare hameau du golf
treeRow(8, 46, 52, 46);          // sud du hameau
[[100,70],[110,80],[30,110],[125,90],[50,118],[95,115]].forEach(([c,r]) => { obj('oak',c,r); obj('pine',c+1,r+1); });

// ── Marque les cellules occupées par un objet solide comme bloquantes ──
const SOLID = new Uint8Array(COLS * ROWS);
for (let i = 0; i < SOLID.length; i++) {
  const t = T[i]; if (t === 'w' || t === 'F') SOLID[i] = 1;
}
for (const o of OBJ) {
  if (!o.solid) continue;
  const c0 = Math.floor((o.x - o.w*TILE/2) / TILE), r0 = Math.floor((o.y - o.h*TILE) / TILE);
  for (let r = r0; r < r0 + o.h; r++) for (let c = c0; c < c0 + o.w; c++) if (inb(c, r)) SOLID[ti(c, r)] = 1;
}

export function getLevel() {
  return { cols: COLS, rows: ROWS, width: COLS*TILE, height: ROWS*TILE, terrain: T, objects: OBJ, solid: SOLID };
}
