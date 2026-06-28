import { getLevel, TILE } from '../src/level.js';
const L = getLevel();
const C0=0,C1=66, R0=4,R1=52, S=10;            // zone hameau, 10px/tuile
const cols=C1-C0, rows=R1-R0, W=cols*S, H=rows*S;
const col = { g:[120,180,90], v:[200,190,150], f:[130,200,80], d:[225,210,130], w:[60,130,200], F:[40,70,40] };
const img = Buffer.alloc(W*H*3);
function px(x,y,c){ if(x<0||y<0||x>=W||y>=H)return; const i=(y*W+x)*3; img[i]=c[0];img[i+1]=c[1];img[i+2]=c[2]; }
function cell(cx,cy,c){ const x0=(cx-C0)*S,y0=(cy-R0)*S; for(let y=0;y<S;y++)for(let x=0;x<S;x++)px(x0+x,y0+y,c); }
// terrain
for(let r=R0;r<R1;r++)for(let c=C0;c<C1;c++){ const t=L.terrain[r*L.cols+c]; cell(c,r,col[t]||[120,180,90]); }
// objets : haies vert foncé, maisons brun/rouge, arbres vert sombre
for(const o of L.objects){ const cx=Math.floor(o.x/TILE), cy=Math.floor((o.y-1)/TILE);
  let c=null;
  if(o.t==='hedge') c=[30,90,40];
  else if(o.t.startsWith('villa')||o.t.startsWith('manor')) c=[170,60,40];
  else if(o.t==='pine'||o.t==='oak') c=[25,60,25];
  else if(o.t==='abbey') c=[150,140,120];
  else if(o.t==='lamp'||o.t==='bench'||o.t==='car') c=[90,90,90];
  if(c){ const w=o.w||1,h=o.h||1; for(let dr=0;dr<h;dr++)for(let dc=0;dc<w;dc++) cell(cx+dc,cy-(h-1)+dr,c); }
}
// deco fleurs = points magenta
for(const d of L.deco){ const cx=Math.floor(d.x/TILE),cy=Math.floor(d.y/TILE); const x0=(cx-C0)*S+3,y0=(cy-R0)*S+3; for(let y=0;y<4;y++)for(let x=0;x<4;x++)px(x0+x,y0+y,[230,80,180]); }
import { writeFileSync } from 'fs';
const head=Buffer.from(`P6\n${W} ${H}\n255\n`);
writeFileSync('/tmp/hamlet.ppm', Buffer.concat([head,img]));
console.log('PPM', W,'x',H);
