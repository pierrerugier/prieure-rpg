// ═══════════════════════════════════════════════════════════════
// LE PRIEURÉ RPG — MONDE = carte image reconstruite en TUILES PixelLab
// Terrain classé depuis assets/map.png (src/map_data.js), rendu avec les
// tilesets PixelLab (rough/fairway/sable/eau/chemin). Collision = terrain.
// ═══════════════════════════════════════════════════════════════

import { MAPIMG } from './map_data.js';

export const TILE = MAPIMG.tile;
const W = MAPIMG.w, H = MAPIMG.h, COLS = MAPIMG.cols, ROWS = MAPIMG.rows;
export const TERRAIN = MAPIMG.terrain;
const SOLID = new Uint8Array(COLS * ROWS);
for (let i = 0; i < SOLID.length; i++) SOLID[i] = MAPIMG.solid.charCodeAt(i) === 49 ? 1 : 0;

function isSolidTile(c, r) {
  if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return true;
  return SOLID[r * COLS + c] === 1;
}
function snap(x, y) {
  const c0 = Math.floor(x / TILE), r0 = Math.floor(y / TILE);
  for (let rad = 0; rad < 50; rad++)
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
// Le hameau est en haut-gauche de la carte ; on y place la bande.
function npcDefs() {
  return [
    { id:'victor',  x:560, y:430, look:LOOKS.victor,  idle:'victor_greet' },
    { id:'charles', x:640, y:440, look:LOOKS.charles, idle:'charles_greet' },
    { id:'margot',  x:600, y:520, look:LOOKS.margot,  idle:'margot_greet', wander:true },
    { id:'antoine', x:700, y:470, look:LOOKS.antoine, idle:'antoine_greet' },
    { id:'oscar',   x:520, y:560, look:LOOKS.oscar,   idle:'oscar_greet' },
    { id:'louis',   x:760, y:520, look:LOOKS.louis,   idle:'louis_greet' },
    { id:'kupi',    x:840, y:470, look:LOOKS.kupi,    idle:'kupi_greet' },
    { id:'paul',    x:480, y:470, look:LOOKS.paul,    idle:'paul_greet' },
    { id:'dog1', kind:'dog', name:'le chien', x:680, y:600, color:'#8a6038', wander:true, range:48 },
    { id:'dog2', kind:'dog', name:'le chien', x:900, y:560, color:'#2a2a2a', wander:true, range:48 },
    { id:'passant1', kind:'passant', name:'Mme Lévêque', x:560, y:640, look:LOOKS.pA, wander:true, range:80,
      idle:[{speaker:'Mme Lévêque',text:"Ah, les jeunes ! Profitez-en, c'est le plus bel été."},
            {speaker:'Mme Lévêque',text:"Vous n'auriez pas vu mon chien ? Il file vers le golf."}]},
    { id:'passant2', kind:'passant', name:'M. Grémont', x:740, y:640, look:LOOKS.pB, wander:true, range:80,
      idle:[{speaker:'M. Grémont',text:"Belle journée pour marcher, n'est-ce pas ?"},
            {speaker:'M. Grémont',text:"De mon temps, on rentrait à la nuit tombée."}]},
  ];
}

export function buildWorld() {
  const occupied = new Set();
  function place(x, y) {
    const s = snap(x, y);
    const c0 = Math.floor(s.x/TILE), r0 = Math.floor(s.y/TILE);
    for (let rad = 0; rad < 30; rad++)
      for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
        if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
        const c = c0+dc, r = r0+dr;
        if (isSolidTile(c, r)) continue;
        const k = c + ',' + r; if (occupied.has(k)) continue;
        occupied.add(k); return { x: c*TILE+TILE/2, y: r*TILE+TILE/2 };
      }
    return s;
  }
  const spawn = place(620, 560);
  const bike  = place(560, 600);
  return {
    width: W, height: H, cols: COLS, rows: ROWS, solid: SOLID, terrain: TERRAIN,
    label: 'Golf du Prieuré', spawn, bike,
    npcs: npcDefs().map(n => ({ ...n, ...place(n.x, n.y) })),
    golf: { x: W*0.6, y: H*0.55 },
  };
}
export { W as WORLD_W, H as WORLD_H };
