// ═══════════════════════════════════════════════════════════════
// LE PRIEURÉ RPG — MONDE reconstruit depuis la VRAIE topologie (OSM)
// Rendu volontairement SIMPLIFIÉ et CARRÉ (greens/bunkers/bâtiments =
// formes nettes), placé comme dans la réalité. Collision EXACTE : chaque
// élément est une forme connue (l'abbaye bloque, l'eau bloque, etc.).
// Données : src/osm_map.js (généré par tools/build_map.py).
// ═══════════════════════════════════════════════════════════════

import { MAP, STREETS } from './osm_map.js';

export const TILE = 16;
const PIX = 1;
const W = MAP.w, H = MAP.h;

const P = {
  forest:'#3c8a44', forestD:'#2f7036', forestL:'#49a052', tree:'#2c6a32', treeTop:'#54b85e',
  rough:'#7cc265', roughD:'#6cb255', fairway:'#9ad96a', fairwayL:'#a8e678',
  green:'#bdee7e', greenE:'#86c84a', sand:'#ecd9a0', sandE:'#d4be84',
  water:'#5bb0e0', waterE:'#3f90c8', waterL:'#86cdf0',
  path:'#dccfa6', pathE:'#b7a87e', tar:'#a8a49a', tarE:'#7c7870',
  wall:'#e0d2ac', roofV:'#c2623a', roofVE:'#8a3f22', roofM:'#7a5450', roofME:'#4e3430',
  abbeyW:'#cdbd95', abbeyR:'#8a4a30', abbeyRE:'#5c2e18',
  hedge:'#367a2e', flagPole:'#e8e8e8', flag:'#e02828', clay:'#bf6f3a',
};

// ── Helpers géométrie ──
function bbox(poly){ let a=1e9,b=1e9,c=-1e9,d=-1e9; for(const p of poly){a=Math.min(a,p[0]);b=Math.min(b,p[1]);c=Math.max(c,p[0]);d=Math.max(d,p[1]);} return {x:a,y:b,w:c-a,h:d-b,cx:(a+c)/2,cy:(b+d)/2}; }
function inBox(B,x,y,m=0){ return x>=B.x-m&&x<=B.x+B.w+m&&y>=B.y-m&&y<=B.y+B.h+m; }
function inPoly(pts,x,y){ let i,j,c=false; for(i=0,j=pts.length-1;i<pts.length;j=i++){const xi=pts[i][0],yi=pts[i][1],xj=pts[j][0],yj=pts[j][1]; if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;} return c; }
function inAnyPoly(list,x,y){ for(const p of list) if(inPoly(p,x,y)) return true; return false; }
function distSeg(px,py,ax,ay,bx,by){ const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1; let t=((px-ax)*dx+(py-ay)*dy)/l2; t=t<0?0:t>1?1:t; return Math.hypot(px-(ax+t*dx),py-(ay+t*dy)); }
function nearRoad(r,x,y){ const h=r.w/2+3; for(let i=0;i<r.pts.length-1;i++) if(distSeg(x,y,r.pts[i][0],r.pts[i][1],r.pts[i+1][0],r.pts[i+1][1])<=h) return true; return false; }

// Pré-calcul des boîtes (formes carrées simplifiées)
const ABBEY = MAP.buildings.reduce((m,b)=>{const B=bbox(b);return (B.w*B.h)>(m? m.w*m.h:0)?B:m;}, null);
const BUILD_BOX = MAP.buildings.map(bbox);
const GREEN_BOX = MAP.greens.map(bbox);
const TEE_BOX   = MAP.tees.map(bbox);
const BUNK_BOX  = MAP.bunkers.map(bbox);
const POOL_BOX  = MAP.pools.map(bbox);
const PITCH_BOX = MAP.pitches.map(p=>({...bbox(p.poly), sport:p.sport}));
const FAIRWAYS  = MAP.fairways.map(f=>f.pts);

// ── COLLISION EXACTE ──
function walkableAt(x,y){
  if(x<6||y<6||x>W-6||y>H-6) return false;
  // Bloqueurs (priorité) — bâtiments (dont l'abbaye), eau/piscine, haies
  for(const B of BUILD_BOX) if(inBox(B,x,y)) return false;
  for(const B of POOL_BOX)  if(inBox(B,x,y)) return false;
  // Surfaces praticables
  if(inAnyPoly(MAP.golf,x,y)) return true;
  if(inAnyPoly(FAIRWAYS,x,y)) return true;
  for(const B of GREEN_BOX) if(inBox(B,x,y)) return true;
  for(const B of TEE_BOX)   if(inBox(B,x,y)) return true;
  for(const B of BUNK_BOX)  if(inBox(B,x,y)) return true;
  for(const B of PITCH_BOX) if(inBox(B,x,y)) return true;
  for(const r of MAP.roads) if(nearRoad(r,x,y)) return true;
  return false; // forêt = bloquée
}
function buildSolid(){
  const cols=Math.ceil(W/TILE), rows=Math.ceil(H/TILE);
  const solid=new Uint8Array(cols*rows);
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++)
    solid[r*cols+c]=walkableAt(c*TILE+TILE/2,r*TILE+TILE/2)?0:1;
  return {solid,cols,rows};
}
function snap(grid,x,y){
  const c0=Math.floor(x/TILE),r0=Math.floor(y/TILE);
  for(let rad=0;rad<40;rad++) for(let dr=-rad;dr<=rad;dr++) for(let dc=-rad;dc<=rad;dc++){
    if(Math.max(Math.abs(dr),Math.abs(dc))!==rad)continue;
    const c=c0+dc,r=r0+dr; if(c<0||r<0||c>=grid.cols||r>=grid.rows||grid.solid[r*grid.cols+c])continue;
    return {x:c*TILE+TILE/2,y:r*TILE+TILE/2};
  }
  return {x,y};
}

// ── RENDU PROPRE ──
let g, _s=99;
function rng(){_s=Math.imul(_s^_s>>>13,_s|7);_s^=_s<<17;return(_s>>>0)/4294967296;}
function seed(n){_s=n>>>0;rng();}
function rrect(x,y,w,h,r,fill,stroke,sw){ g.beginPath(); g.roundRect(x,y,w,h,r); if(fill){g.fillStyle=fill;g.fill();} if(stroke){g.strokeStyle=stroke;g.lineWidth=sw||2;g.stroke();} }
function fillP(pts,c){ g.beginPath();g.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]); g.closePath(); g.fillStyle=c; g.fill(); }
function strokeP(pts,c,w){ g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]); g.strokeStyle=c;g.lineWidth=w;g.stroke(); }
function tree(x,y,r){ g.fillStyle=P.tree; g.beginPath();g.arc(x,y+r*0.35,r,0,7);g.fill(); g.fillStyle=P.treeTop; g.beginPath();g.arc(x,y,r*0.92,0,7);g.fill(); g.fillStyle='#6acc66'; g.beginPath();g.arc(x-r*0.25,y-r*0.25,r*0.4,0,7);g.fill(); }

function paint(ctx){
  g=ctx;
  // 1. Forêt de fond (claire, propre) + grain
  g.fillStyle=P.forest; g.fillRect(0,0,W,H);
  seed(3); for(let i=0;i<700;i++){const x=rng()*W,y=rng()*H;g.fillStyle=rng()<0.5?P.forestD:P.forestL;g.beginPath();g.arc(x,y,16+rng()*30,0,7);g.fill();}
  // 2. Golf : rough (forme réelle) + liseré
  MAP.golf.forEach(p=>{ fillP(p,P.rough); });
  // 3. Fairways (formes réelles, vert clair)
  FAIRWAYS.forEach(p=>fillP(p,P.fairway));
  // 4. Départs (petits carrés)
  TEE_BOX.forEach(B=>rrect(B.x,B.y,B.w,B.h,3,P.fairwayL,P.roughD,1));
  // 5. Bunkers (carrés arrondis, sable)
  BUNK_BOX.forEach(B=>rrect(B.x,B.y,Math.max(10,B.w),Math.max(8,B.h),5,P.sand,P.sandE,1.5));
  // 6. Greens (carrés arrondis, vert vif) + drapeau
  GREEN_BOX.forEach(B=>{ rrect(B.x,B.y,Math.max(16,B.w),Math.max(14,B.h),8,P.green,P.greenE,2);
    const fx=B.cx,fy=B.cy; g.fillStyle='#111';g.beginPath();g.arc(fx,fy,2.5,0,7);g.fill();
    g.strokeStyle=P.flagPole;g.lineWidth=2;g.beginPath();g.moveTo(fx,fy);g.lineTo(fx,fy-22);g.stroke();
    fillP([[fx,fy-22],[fx+12,fy-17],[fx,fy-12]],P.flag); });
  // 7. Piscine / eau (bleu net)
  POOL_BOX.forEach(B=>{ rrect(B.x,B.y,B.w,B.h,4,P.water,P.waterE,2); rrect(B.x+3,B.y+3,B.w-6,Math.max(2,B.h*0.4),3,P.waterL,null); });
  // 8. Terrains (tennis = terre battue)
  PITCH_BOX.forEach(B=>{ if(B.sport==='tennis'){rrect(B.x,B.y,B.w,B.h,2,P.clay,'#fff',1.5);} else rrect(B.x,B.y,B.w,B.h,3,P.fairwayL,null); });
  // 9. Allées (propres, larges)
  MAP.roads.forEach(r=>{ const dirt=['track','path','footway','cycleway'].includes(r.kind);
    strokeP(r.pts, dirt?P.pathE:P.tarE, r.w+4); strokeP(r.pts, dirt?P.path:P.tar, r.w); });
  // 10. Haies
  MAP.hedges.forEach(h=>strokeP(h,P.hedge,5));
  // 11. Bâtiments (rectangles nets + toit ; l'abbaye distincte)
  MAP.buildings.forEach((b,i)=>{ const B=BUILD_BOX[i]; const isAbbey=B===ABBEY;
    const big=isAbbey||B.w*B.h>2600;
    g.fillStyle='rgba(0,0,0,0.18)'; g.fillRect(B.x+2,B.y+B.h-1,B.w,4);
    const wall=isAbbey?P.abbeyW:P.wall;
    const roof=isAbbey?P.abbeyR:(big?P.roofM:P.roofV);
    const roofE=isAbbey?P.abbeyRE:(big?P.roofME:P.roofVE);
    rrect(B.x,B.y,B.w,B.h,2,wall,roofE,1.5);                          // murs
    rrect(B.x,B.y,B.w,Math.max(6,B.h*0.55),2,roof,roofE,1.5);         // toit (moitié haute)
    if(isAbbey){ g.fillStyle=P.abbeyRE; for(let a=0;a<B.w;a+=10)g.fillRect(B.x+a,B.y,2,B.h*0.55); } // tuiles abbaye
  });
  // 12. Arbres de bordure (forêt) — grille nette, hors golf/allées/bâtiments
  seed(77);
  for(let y=20;y<H;y+=26) for(let x=20;x<W;x+=26){
    const jx=x+(rng()-0.5)*10, jy=y+(rng()-0.5)*10;
    if(inAnyPoly(MAP.golf,jx,jy)) continue;
    let onRoad=false; for(const r of MAP.roads) if(nearRoad(r,jx,jy)){onRoad=true;break;} if(onRoad) continue;
    let inB=false; for(const B of BUILD_BOX) if(inBox(B,jx,jy,4)){inB=true;break;} if(inB) continue;
    if(rng()<0.82) tree(jx,jy,8+rng()*5);
  }
}

// ── LOOKS & PNJ ──
const LOOKS = {
  victor:{hair:'#241608',skin:'#c39a5e',shirt:'#c83030',pants:'#39414f',shoes:'#2a2a30'},
  charles:{hair:'#3a2410',skin:'#e8c49a',shirt:'#d07820',pants:'#39414f',shoes:'#2a2a30',hat:'#2c5aa0'},
  margot:{hair:'#e8c84a',skin:'#f4d8b8',shirt:'#e060a0',pants:'#8a4a8a',shoes:'#6a3a6a',hairStyle:'curly'},
  antoine:{hair:'#3a2a18',skin:'#eed0a8',shirt:'#5090c0',pants:'#39414f',shoes:'#2a2a30',glasses:true},
  oscar:{hair:'#e8d24a',skin:'#f6dcc0',shirt:'#e8c83a',pants:'#5a6a3a',shoes:'#3a3a30',build:'chubby'},
  louis:{hair:'#3a2410',skin:'#f2dcc4',shirt:'#7050a0',pants:'#39414f',shoes:'#2a2a30'},
  kupi:{hair:'#4a3018',skin:'#dcb488',shirt:'#806040',pants:'#39414f',shoes:'#2a2a30'},
  paul:{hair:'#1a1a1a',skin:'#e8c49a',shirt:'#404858',pants:'#2a2a30',shoes:'#1a1a1a'},
  pA:{hair:'#bcbcbc',skin:'#e6c8a2',shirt:'#7a8a6a',pants:'#56564e',shoes:'#3a3a30'},
  pB:{hair:'#cfcfcf',skin:'#dcbc94',shirt:'#9a7a6a',pants:'#4a4a4a',shoes:'#2a2a2a'},
  marcel:{hair:'#9a9a9a',skin:'#d8b48a',shirt:'#2e6a3a',pants:'#3a3a2a',shoes:'#2a2a1a'},
};
function streetPt(name,frac){
  let ps=((MAP.streets&&MAP.streets[name])||[]).filter(p=>p[0]>40&&p[0]<W-40&&p[1]>40&&p[1]<H-40);
  if(!ps.length) return {x:W/2,y:H/2};
  ps=ps.slice().sort((a,b)=>(a[0]+a[1])-(b[0]+b[1]));
  const p=ps[Math.floor(frac*(ps.length-1))]; return {x:p[0],y:p[1]};
}
function npcDefs(){
  const F='Allée des Fougères',L='Allée de la Lisière',Hh='Allée des Hameaux',Hp='Hameau du Prieuré';
  const gc=MAP.golf[0]?bbox(MAP.golf[0]):{cx:W/2,cy:H/2};
  return [
    {id:'victor', ...streetPt(F,0.2),look:LOOKS.victor, idle:'victor_greet'},
    {id:'charles',...streetPt(F,0.3),look:LOOKS.charles,idle:'charles_greet'},
    {id:'margot', ...streetPt(F,0.4),look:LOOKS.margot, idle:'margot_greet',wander:true},
    {id:'antoine',...streetPt(F,0.52),look:LOOKS.antoine,idle:'antoine_greet'},
    {id:'oscar',  ...streetPt(L,0.3),look:LOOKS.oscar,  idle:'oscar_greet'},
    {id:'louis',  ...streetPt(L,0.6),look:LOOKS.louis,  idle:'louis_greet'},
    {id:'kupi',   ...streetPt(Hh,0.4),look:LOOKS.kupi,  idle:'kupi_greet'},
    {id:'paul',   ...streetPt(Hp,0.5),look:LOOKS.paul,  idle:'paul_greet'},
    {id:'greenkeeper',kind:'npc',name:'Marcel',x:gc.cx,y:gc.cy,look:LOOKS.marcel,
      idle:[{speaker:'Marcel',text:"Pas de vélo sur les greens, petit. C'est sacré."},
            {speaker:'Marcel',text:"Ce golf, c'est le plus beau du coin. Respecte-le."}]},
    {id:'dog1',kind:'dog',name:'le chien',...streetPt(F,0.7),color:'#8a6038',wander:true,range:44},
    {id:'dog2',kind:'dog',name:'le chien',...streetPt(Hh,0.65),color:'#2a2a2a',wander:true,range:44},
    {id:'passant1',kind:'passant',name:'Mme Lévêque',...streetPt(F,0.85),look:LOOKS.pA,wander:true,range:70,
      idle:[{speaker:'Mme Lévêque',text:"Ah, les jeunes ! Profitez-en, c'est le plus bel été."},
            {speaker:'Mme Lévêque',text:"Vous n'auriez pas vu mon chien ? Il file vers le golf."}]},
    {id:'passant2',kind:'passant',name:'M. Grémont',...streetPt(Hp,0.2),look:LOOKS.pB,wander:true,range:70,
      idle:[{speaker:'M. Grémont',text:"Belle journée pour marcher, n'est-ce pas ?"},
            {speaker:'M. Grémont',text:"De mon temps, on rentrait à la nuit tombée."}]},
  ];
}

export function buildWorld(makeCanvas){
  const grid=buildSolid();
  const occupied=new Set(); const key=(x,y)=>Math.floor(x/TILE)+','+Math.floor(y/TILE);
  function place(x,y){ const s=snap(grid,x,y); const c0=Math.floor(s.x/TILE),r0=Math.floor(s.y/TILE);
    for(let rad=0;rad<24;rad++)for(let dr=-rad;dr<=rad;dr++)for(let dc=-rad;dc<=rad;dc++){
      if(Math.max(Math.abs(dr),Math.abs(dc))!==rad)continue; const c=c0+dc,r=r0+dr;
      if(c<0||r<0||c>=grid.cols||r>=grid.rows||grid.solid[r*grid.cols+c])continue;
      const k=c+','+r; if(occupied.has(k))continue; occupied.add(k); return {x:c*TILE+TILE/2,y:r*TILE+TILE/2}; }
    return s; }
  const spawn=place(...Object.values(streetPt('Allée des Fougères',0.45)));
  const bike =place(...Object.values(streetPt('Allée des Hameaux',0.5)));
  const meta={ width:W,height:H,cols:grid.cols,rows:grid.rows,solid:grid.solid,
    label:'Golf du Prieuré', spawn, bike,
    npcs:npcDefs().map(n=>({...n,...place(n.x,n.y)})),
    golf:MAP.golf[0]?bbox(MAP.golf[0]):{x:W/2,y:H/2} };
  if(makeCanvas){ try{ const art=makeCanvas(W,H); const a=art.getContext('2d'); a.imageSmoothingEnabled=true; paint(a); meta.ground=art; }catch(e){ meta.ground=null; } }
  return meta;
}
export { W as WORLD_W, H as WORLD_H };
