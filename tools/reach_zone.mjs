import { buildWorld, TILE } from '../src/world.js';
const w = buildWorld(); const COLS=w.cols,ROWS=w.rows,S=w.solid;
const sol=(c,r)=> c<0||r<0||c>=COLS||r>=ROWS||S[r*COLS+c]===1;
const sc=Math.floor(w.spawn.x/TILE), sr=Math.floor(w.spawn.y/TILE);
const seen=new Set([sc+','+sr]); const q=[[sc,sr]];
while(q.length){ const [c,r]=q.shift(); for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nc=c+dc,nr=r+dr,k=nc+','+nr; if(!seen.has(k)&&!sol(nc,nr)){ seen.add(k); q.push([nc,nr]); } } }
const abbeyOk = seen.has('64,55')||seen.has('70,60')||seen.has('72,64');
let minc=999,maxc=0,minr=999,maxr=0; for(const k of seen){const [c,r]=k.split(',').map(Number); minc=Math.min(minc,c);maxc=Math.max(maxc,c);minr=Math.min(minr,r);maxr=Math.max(maxr,r);}
console.log(`zone joignable: ${seen.size} cases, bbox cols ${minc}-${maxc} rows ${minr}-${maxr}; golf/abbaye joignable: ${abbeyOk}`);
