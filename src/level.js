// ═══════════════════════════════════════════════════════════════
// LE PRIEURÉ — NIVEAU composé à la main (tuiles + objets PixelLab)
// Hameau (haut-gauche) · Club-house abbaye (centre) · Golf (sud/est).
// terrain: g=herbe f=fairway d=sable(bunker) w=eau v=gravier F=forêt
// ═══════════════════════════════════════════════════════════════
export const TILE = 16;
export const COLS = 150, ROWS = 140;          // monde 2400 × 2240

const T = new Array(COLS * ROWS).fill('g');
const OBJ = [];                                // {t,x,y,solid,w,h} (px)
const DECO = [];                               // déco non-solide (fleurs, touffes) {t,x,y}
const ti = (c, r) => r * COLS + c;
const inb = (c, r) => c >= 0 && r >= 0 && c < COLS && r < ROWS;

function rect(x0, y0, x1, y1, code) { for (let r=y0;r<=y1;r++) for (let c=x0;c<=x1;c++) if (inb(c,r)) T[ti(c,r)] = code; }
function disc(cx, cy, rad, code) { for (let r=cy-rad;r<=cy+rad;r++) for (let c=cx-rad;c<=cx+rad;c++) if (inb(c,r) && (c-cx)**2+(r-cy)**2 <= rad*rad) T[ti(c,r)] = code; }
function thick(pts, w, code) {                 // trait épais le long d'une polyligne
  for (let i=0;i<pts.length-1;i++){ const [ax,ay]=pts[i],[bx,by]=pts[i+1]; const n=Math.max(Math.abs(bx-ax),Math.abs(by-ay)); for(let k=0;k<=n;k++){ disc(Math.round(ax+(bx-ax)*k/n), Math.round(ay+(by-ay)*k/n), w, code);} } }
function obj(t, cx, cy, solid=true, w=1, h=1) { OBJ.push({ t, x: cx*TILE+TILE/2, y: cy*TILE+TILE, solid, w, h }); }
function deco(t, cx, cy) { DECO.push({ t, x: cx*TILE+TILE/2, y: cy*TILE+TILE/2 }); }
function hedgeRing(x0,y0,x1,y1){ for(let c=x0;c<=x1;c++){obj('hedge',c,y0);obj('hedge',c,y1);} for(let r=y0+1;r<y1;r++){obj('hedge',x0,r);obj('hedge',x1,r);} }
function treeLine(x0,y0,x1,y1,step=2){ const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0)); for(let i=0;i<=n;i+=step){const c=Math.round(x0+(x1-x0)*i/n),r=Math.round(y0+(y1-y0)*i/n); obj((c+r)%3?'pine':'oak',c,r);} }
// Haie le long d'une polyligne (cellule par cellule)
function hedgeLine(pts){ for(let i=0;i<pts.length-1;i++){ const [ax,ay]=pts[i],[bx,by]=pts[i+1]; const n=Math.max(Math.abs(bx-ax),Math.abs(by-ay))||1; for(let k=0;k<=n;k++){ obj('hedge', Math.round(ax+(bx-ax)*k/n), Math.round(ay+(by-ay)*k/n)); } } }
// Parcelle en L : haie en polygone (gros coin coupé → vrai L), maison décalée + terrasse-fleurs + arbre
function plotL(x0,y0,x1,y1,type,w,h,cut,cw=5,ch=4){
  let p, hx, hy, tx, ty;            // hx,hy = maison ; tx,ty = arbre/coin vide
  if(cut==='tr'){ p=[[x0,y0],[x1-cw,y0],[x1-cw,y0+ch],[x1,y0+ch],[x1,y1],[x0,y1],[x0,y0]]; hx=x0+2; hy=y1-h-1; tx=x1-2; ty=y1-2; }
  else if(cut==='tl'){ p=[[x0+cw,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0+ch],[x0+cw,y0+ch],[x0+cw,y0]]; hx=x1-w-2; hy=y1-h-1; tx=x0+2; ty=y1-2; }
  else if(cut==='br'){ p=[[x0,y0],[x1,y0],[x1,y1-ch],[x1-cw,y1-ch],[x1-cw,y1],[x0,y1],[x0,y0]]; hx=x0+2; hy=y0+1; tx=x1-2; ty=y1-2; }
  else { p=[[x0,y0],[x1,y0],[x1,y1],[x0+cw,y1],[x0+cw,y1-ch],[x0,y1-ch],[x0,y0]]; hx=x1-w-2; hy=y0+1; tx=x0+2; ty=y1-2; } // bl
  hedgeLine(p);
  obj(type, Math.round(hx+w/2), hy+h, true, w, h);            // maison décalée (pas centrée)
  obj('pine', tx, ty, true);                                  // arbre de jardin
  for(let k=0;k<3;k++) deco(['flower_red','flower_yellow','flower_pink'][k], hx+k, hy+h+1); // massif devant la maison
}
function rng(s){ let x=s>>>0; return ()=>{x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return((x^x>>>14)>>>0)/4294967296;}; }
const R = rng(20260628);

// ── 1. Fond herbe + lisière de forêt dense ──
rect(0,0,COLS-1,ROWS-1,'g');
const B=5; rect(0,0,COLS-1,B-1,'F'); rect(0,ROWS-B,COLS-1,ROWS-1,'F'); rect(0,0,B-1,ROWS-1,'F'); rect(COLS-B,0,COLS-1,ROWS-1,'F');

// ── 2. GOLF (sud + est) : fairways sinueux, greens, bunkers, étangs ──
// Grands couloirs de fairway qui serpentent (chaque "trou")
const holes = [
  [[64,28],[80,24],[98,28],[114,36],[122,48]],
  [[122,48],[120,64],[110,76],[96,84]],
  [[96,84],[80,90],[64,96],[52,108]],
  [[52,108],[64,116],[84,118],[104,114]],
  [[104,114],[120,108],[130,96],[132,80]],
  [[30,60],[34,78],[40,96],[44,112]],
  [[122,48],[134,40],[140,30]],
];
for (const h of holes) thick(h, 4, 'f');
// greens (bout de chaque trou) + drapeau, et bunkers à côté
const greens = [[122,48],[96,84],[52,108],[104,114],[132,80],[44,112],[140,30]];
for (const [c,r] of greens){ disc(c,r,3,'f'); obj('flag',c,r,false); disc(c+4,r-2,2,'d'); }
const bunkers = [[88,26],[116,40],[104,78],[70,94],[120,100],[36,86],[126,60]];
for (const [c,r] of bunkers) { disc(c,r,3,'d'); disc(c+2,r+1,2,'d'); }   // bunkers plus larges/organiques
disc(112,62,5,'w'); disc(58,120,4,'w'); disc(134,116,4,'w');   // étangs
// arbres qui bordent les fairways (bosquets)
for (let i=0;i<70;i++){ const c=6+Math.floor(R()*(COLS-12)), r=50+Math.floor(R()*(ROWS-58)); if(T[ti(c,r)]==='g' && R()<0.5) obj(R()<0.5?'pine':'oak',c,r); }

// ── 3. HAMEAU (haut-gauche) : parcelles en L irrégulières + chemins de gravier irréguliers ──
rect(7,7,58,46,'g');                                    // prairie de fond
// Chemins de gravier SINUEUX (irréguliers, pas une grille) — veneer visuel, tout est marchable hors haies
thick([[28,8],[28,16],[35,16],[35,21],[23,21],[23,35],[40,35],[40,46]],2,'v'); // épine dorsale qui serpente
thick([[23,21],[9,21]],1,'v');                                  // branche ouest
thick([[40,35],[53,35]],1,'v');                                 // branche est
thick([[35,21],[52,21]],1,'v');                                 // branche nord-est
// Parcelles de TAILLES VARIÉES (jardins hedgés, légèrement irréguliers) ; c'est la MAISON qui porte le plan en L
plotL( 8, 8, 21,19, 'villaf1', 6,5, 'br', 3,2);   // grande, top-gauche
plotL(25, 8, 33,16, 'villaf3', 5,4, 'bl', 2,2);   // petite, top-centre
plotL(37, 8, 50,18, 'villaf1', 6,5, 'br', 3,2);   // large top-droite
plotL( 8,24, 17,35, 'villaf3', 5,4, 'tr', 2,3);   // étroite, gauche
plotL(20,23, 34,32, 'manorif1',6,5, 'tl', 3,2);   // large mid
plotL(39,22, 51,34, 'manorif2',6,5, 'tr', 3,3);   // grande, droite
plotL(10,38, 25,45, 'manorif1',6,5, 'tr', 3,2);   // large bas-gauche
plotL(31,37, 49,45, 'manorif2',6,5, 'tl', 3,2);   // large bas-droite
// Haie d'enceinte (bloquante) avec une brèche au sud (col 26-30, alignée sur l'interstice P7/P8) vers le golf
for(let c=7;c<=58;c++){ obj('hedge',c,7); if(c<26||c>30) obj('hedge',c,46); }
for(let r=8;r<46;r++){ obj('hedge',7,r); obj('hedge',58,r); }
thick([[28,45],[28,56]],3,'v');                         // route de sortie sud (par la brèche)
// Mobilier d'allée (déco non bloquante) dans les chemins
obj('lamp',20,20,false); obj('lamp',39,20,false); obj('lamp',20,34,false); obj('lamp',39,34,false);
obj('bench',23,22,false); obj('bench',36,35,false);

// ── 4. CLUB-HOUSE (abbaye) au centre + cour resserrée + parking/piscine ──
obj('abbey',64,50,true,16,10);                    // l'abbaye (gros sprite)
rect(64,60,80,67,'v');                            // parvis devant l'abbaye
thick([[71,67],[71,78]],1,'v');                   // allée d'accès sud
rect(83,60,93,67,'v');                            // parking
for (let i=0;i<5;i++) obj('car',84+i*2,64,true);
disc(96,56,3,'w'); rect(93,53,100,60,'v');        // piscine + plage
disc(78,82,3,'f'); obj('flag',78,82,false);       // putting green
for (let i=0;i<6;i++) deco(['flower_red','flower_yellow','flower_pink'][i%3], 62+i, 68); // massif devant l'abbaye

// ── 5. ROUTES principales (gravier) reliant hameau -> abbaye -> golf ──
thick([[40,46],[44,50],[52,52],[60,56]],1,'v');
thick([[76,74],[76,90],[70,104]],1,'v');
thick([[60,62],[40,66],[24,72]],1,'v');

// ── 6. Lisière dense + bosquets décoratifs ──
treeLine(2,2,COLS-3,2,1); treeLine(2,ROWS-3,COLS-3,ROWS-3,1);
treeLine(2,2,2,ROWS-3,1); treeLine(COLS-3,2,COLS-3,ROWS-3,1);
treeLine(60,8,60,46);                              // sépare hameau / golf
[[100,40],[112,52],[30,100],[128,86],[50,124],[96,108],[120,120]].forEach(([c,r])=>{obj('oak',c,r);obj('pine',c+1,r+1);});

// ── 7. Déco au sol : semis LÉGER et varié (touffes, fleurs sauvages, fougères près des bois) ──
for (let i=0;i<320;i++){
  const c=6+Math.floor(R()*(COLS-12)), r=6+Math.floor(R()*(ROWS-12));
  if(T[ti(c,r)]!=='g') continue;                         // herbe seulement (pas fairway/sable/gravier)
  const nearForest = T[ti(Math.max(0,c-2),r)]==='F'||T[ti(Math.min(COLS-1,c+2),r)]==='F'||
                     T[ti(c,Math.max(0,r-2))]==='F'||T[ti(c,Math.min(ROWS-1,r+2))]==='F';
  const v=R();
  if(nearForest && v<0.65)      deco('fern',c,r);          // sous-bois
  else if(v<0.42)               deco('tuft',c,r);          // touffes d'herbe
  else if(v<0.70)               deco('wildflowers',c,r);   // fleurs sauvages
  else                          deco(['flower_red','flower_yellow','flower_pink'][i%3],c,r);
}

// ── Collision : eau/forêt + objets solides ──
const SOLID = new Uint8Array(COLS*ROWS);
for (let i=0;i<SOLID.length;i++){ const t=T[i]; if(t==='w'||t==='F') SOLID[i]=1; }
for (const o of OBJ){ if(!o.solid) continue; const c0=Math.floor((o.x-o.w*TILE/2)/TILE), r0=Math.floor((o.y-o.h*TILE)/TILE); for(let r=r0;r<r0+o.h;r++) for(let c=c0;c<c0+o.w;c++) if(inb(c,r)) SOLID[ti(c,r)]=1; }

export function getLevel(){ return { cols:COLS, rows:ROWS, width:COLS*TILE, height:ROWS*TILE, terrain:T, objects:OBJ, deco:DECO, solid:SOLID }; }
