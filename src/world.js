// ═══════════════════════════════════════════════════════════════
// MONDE — adossé au niveau dessiné à la main (src/level.js).
// Collision = level.solid ; placement des entités sur cases libres.
// ═══════════════════════════════════════════════════════════════
import { getLevel, TILE as LTILE } from './level.js';

export const TILE = LTILE;
const L = getLevel();
const W = L.width, H = L.height, COLS = L.cols, ROWS = L.rows;
const SOLID = L.solid;

function isSolidTile(c, r) {
  if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return true;
  return SOLID[r * COLS + c] === 1;
}
function snap(x, y) {
  const c0 = Math.floor(x / TILE), r0 = Math.floor(y / TILE);
  for (let rad = 0; rad < 60; rad++)
    for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
      if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
      const c = c0 + dc, r = r0 + dr;
      if (!isSolidTile(c, r)) return { x: c * TILE + TILE/2, y: r * TILE + TILE/2 };
    }
  return { x, y };
}

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
};
// PNJ dans le hameau (allée centrale) — coords en px
const P = (cx, cy) => ({ x: cx*TILE+TILE/2, y: cy*TILE+TILE/2 });
function npcDefs() {
  return [
    { id:'victor',  ...P(20,28), look:LOOKS.victor,  idle:'victor_greet' },
    { id:'charles', ...P(34,28), look:LOOKS.charles, idle:'charles_greet' },
    { id:'margot',  ...P(27,35), look:LOOKS.margot,  idle:'margot_greet', wander:true },
    { id:'antoine', ...P(44,28), look:LOOKS.antoine, idle:'antoine_greet' },
    { id:'oscar',   ...P(14,35), look:LOOKS.oscar,   idle:'oscar_greet' },
    { id:'louis',   ...P(40,42), look:LOOKS.louis,   idle:'louis_greet' },
    { id:'kupi',    ...P(48,30), look:LOOKS.kupi,    idle:'kupi_greet' },
    { id:'paul',    ...P(14,42), look:LOOKS.paul,    idle:'paul_greet' },
    { id:'greenkeeper', kind:'npc', name:'Marcel', ...P(72,64),
      look:{hair:'#9a9a9a',skin:'#d8b48a',shirt:'#2e6a3a',pants:'#3a3a2a',shoes:'#2a2a1a'},
      idle:[["Pas de vélo sur les greens, petit. C'est sacré, un green."],
            ["Ce golf, c'est le plus beau du coin. Respecte-le."],
            ["Les balles dans le rough, c'est pour moi. C'est la règle."],
            ["J'ai perdu un caddie quelque part dans le 7. Si tu le vois..."],
            ["Quarante ans que je tonds ce parcours. Il me connaît mieux que ma femme."]] },
    { id:'dog1', kind:'dog', name:'le chien', ...P(30,33), color:'#8a6038', wander:true, range:48 },
    { id:'passant1', kind:'passant', name:'Mme Lévêque', ...P(24,38), look:LOOKS.pA, wander:true, range:64,
      idle:[{speaker:'Mme Lévêque',text:"Ah, les jeunes ! Profitez-en, c'est le plus bel été."},
            {speaker:'Mme Lévêque',text:"Vous n'auriez pas vu mon chien ? Il file vers le golf."}]},
    { id:'passant2', kind:'passant', name:'M. Grémont', ...P(40,35), look:LOOKS.pB, wander:true, range:64,
      idle:[{speaker:'M. Grémont',text:"Belle journée pour marcher, n'est-ce pas ?"},
            {speaker:'M. Grémont',text:"De mon temps, on rentrait à la nuit tombée."}]},
  ];
}

export function buildWorld() {
  const occupied = new Set();
  function place(x, y) {
    const s = snap(x, y); const c0 = Math.floor(s.x/TILE), r0 = Math.floor(s.y/TILE);
    for (let rad = 0; rad < 24; rad++)
      for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
        if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
        const c = c0+dc, r = r0+dr; if (isSolidTile(c, r)) continue;
        const k = c+','+r; if (occupied.has(k)) continue; occupied.add(k);
        return { x: c*TILE+TILE/2, y: r*TILE+TILE/2 };
      }
    return s;
  }
  const spawn = place(28*TILE, 33*TILE);  // place du hameau (coords px)
  const bike  = place(34*TILE, 35*TILE);
  return {
    width: W, height: H, cols: COLS, rows: ROWS, solid: SOLID, level: L,
    label: 'Le Prieuré', spawn, bike,
    npcs: npcDefs().map(n => ({ ...n, ...place(n.x, n.y) })),
    golf: { x: W*0.6, y: H*0.6 },
  };
}
export { W as WORLD_W, H as WORLD_H };
