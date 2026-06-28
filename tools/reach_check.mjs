import { buildWorld, TILE } from '../src/world.js';
const w = buildWorld();
const COLS=w.cols, ROWS=w.rows, S=w.solid;
const sol=(c,r)=> c<0||r<0||c>=COLS||r>=ROWS||S[r*COLS+c]===1;
const sc=Math.floor(w.spawn.x/TILE), sr=Math.floor(w.spawn.y/TILE);
const seen=new Set([sc+','+sr]); const q=[[sc,sr]];
while(q.length){ const [c,r]=q.shift(); for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nc=c+dc,nr=r+dr,k=nc+','+nr; if(!seen.has(k)&&!sol(nc,nr)){ seen.add(k); q.push([nc,nr]); } } }
let bad=0;
for(const n of w.npcs){ const c=Math.floor(n.x/TILE),r=Math.floor(n.y/TILE); const ok=seen.has(c+','+r); if(!ok){ console.log('❌ INJOIGNABLE:', n.id||n.name, c,r); bad++; } }
const bc=Math.floor(w.bike.x/TILE),br=Math.floor(w.bike.y/TILE);
if(!seen.has(bc+','+br)){ console.log('❌ vélo injoignable',bc,br); bad++; }
console.log(bad? `${bad} entité(s) injoignable(s)` : `✅ spawn + ${w.npcs.length} PNJ + vélo tous joignables (zone ${seen.size} cases)`);
process.exit(bad?1:0);
