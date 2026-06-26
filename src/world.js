// ═══════════════════════════════════════════════════════════════
// LE PRIEURÉ RPG — MONDE = image (Nano Banana, style Pokémon GBA)
// Le sol est l'image assets/map_world.png. La collision est pré-calculée
// par tools/build_image_map.py (src/map_data.js). L'image est chargée
// par le moteur ; ici on fournit collision + placement des entités.
// ═══════════════════════════════════════════════════════════════

import { MAPIMG } from './map_data.js';

export const TILE = MAPIMG.tile;
const W = MAPIMG.w, H = MAPIMG.h, COLS = MAPIMG.cols, ROWS = MAPIMG.rows;

// Décodage de la grille de collision ("0"/"1" -> Uint8Array)
const SOLID = new Uint8Array(COLS * ROWS);
for (let i = 0; i < SOLID.length; i++) SOLID[i] = MAPIMG.solid.charCodeAt(i) === 49 ? 1 : 0;

function isSolidTile(c, r) {
  if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return true;
  return SOLID[r * COLS + c] === 1;
}
function snapWalkable(x, y) {
  const c0 = Math.floor(x / TILE), r0 = Math.floor(y / TILE);
  for (let rad = 0; rad < 40; rad++)
    for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
      if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
      const c = c0 + dc, r = r0 + dr;
      if (!isSolidTile(c, r)) return { x: c * TILE + TILE/2, y: r * TILE + TILE/2 };
    }
  return { x, y };
}

// ── LOOKS des persos (cf. brief) ───────────────────────────────
const LOOKS = {
  victor:  { hair:'#241608', skin:'#c39a5e', shirt:'#c83030', pants:'#39414f', shoes:'#2a2a30' },
  charles: { hair:'#3a2410', skin:'#e8c49a', shirt:'#d07820', pants:'#39414f', shoes:'#2a2a30', hat:'#2c5aa0' },
  margot:  { hair:'#e8c84a', skin:'#f4d8b8', shirt:'#e060a0', pants:'#8a4a8a', shoes:'#6a3a6a', hairStyle:'curly' },
  antoine: { hair:'#3a2a18', skin:'#eed0a8', shirt:'#5090c0', pants:'#39414f', shoes:'#2a2a30', glasses:true },
  oscar:   { hair:'#e8d24a', skin:'#f6dcc0', shirt:'#e8c83a', pants:'#5a6a3a', shoes:'#3a3a30', build:'chubby' },
  louis:   { hair:'#3a2410', skin:'#f2dcc4', shirt:'#7050a0', pants:'#39414f', shoes:'#2a2a30' },
  kupi:    { hair:'#4a3018', skin:'#dcb488', shirt:'#806040', pants:'#39414f', shoes:'#2a2a30' },
  paul:    { hair:'#1a1a1a', skin:'#e8c49a', shirt:'#404858', pants:'#2a2a30', shoes:'#1a1a1a' },
  passantA:{ hair:'#bcbcbc', skin:'#e6c8a2', shirt:'#7a8a6a', pants:'#56564e', shoes:'#3a3a30' },
  passantB:{ hair:'#cfcfcf', skin:'#dcbc94', shirt:'#9a7a6a', pants:'#4a4a4a', shoes:'#2a2a2a' },
  marcel:  { hair:'#9a9a9a', skin:'#d8b48a', shirt:'#2e6a3a', pants:'#3a3a2a', shoes:'#2a2a1a' },
};

// Cibles de placement (en px monde 2048²). Le hameau est en bas-droite,
// le club-house au centre, l'entrée/panneau en bas-centre.
function npcDefs() {
  return [
    // La bande, près des maisons du hameau (bas-droite)
    { id:'victor',  x:1560, y:1360, look:LOOKS.victor,  idle:'victor_greet' },
    { id:'charles', x:1632, y:1372, look:LOOKS.charles, idle:'charles_greet' },
    { id:'margot',  x:1556, y:1452, look:LOOKS.margot,  idle:'margot_greet', wander:true },
    { id:'antoine', x:1700, y:1420, look:LOOKS.antoine, idle:'antoine_greet' },
    { id:'oscar',   x:1500, y:1540, look:LOOKS.oscar,   idle:'oscar_greet' },
    { id:'louis',   x:1724, y:1512, look:LOOKS.louis,   idle:'louis_greet' },
    { id:'kupi',    x:1840, y:1576, look:LOOKS.kupi,    idle:'kupi_greet' },
    { id:'paul',    x:1600, y:1632, look:LOOKS.paul,    idle:'paul_greet' },
    // Greenkeeper près du club-house / practice (centre)
    { id:'greenkeeper', kind:'npc', name:'Marcel', x:1120, y:1080, look:LOOKS.marcel,
      idle:[ {speaker:'Marcel', text:"Pas de vélo sur les greens, petit. C'est sacré."},
             {speaker:'Marcel', text:"Ce golf, c'est le plus beau du coin. Respecte-le."} ] },
    // Chiens errants
    { id:'dog1', kind:'dog', name:'le chien', x:1320, y:1700, color:'#8a6038', wander:true, range:48 },
    { id:'dog2', kind:'dog', name:'le chien', x:1760, y:1660, color:'#2a2a2a', wander:true, range:48 },
    { id:'dog3', kind:'dog', name:'le chien', x:1080, y:1360, color:'#e6ddcb', wander:true, range:48 },
    // Passants (petits vieux)
    { id:'passant1', kind:'passant', name:'Mme Lévêque', x:1300, y:1800, look:LOOKS.passantA, wander:true, range:80,
      idle:[ {speaker:'Mme Lévêque', text:"Ah, les jeunes ! Profitez-en, c'est le plus bel été."},
             {speaker:'Mme Lévêque', text:"Vous n'auriez pas vu mon chien ? Il file toujours vers le golf."} ] },
    { id:'passant2', kind:'passant', name:'M. Grémont', x:1480, y:1720, look:LOOKS.passantB, wander:true, range:80,
      idle:[ {speaker:'M. Grémont', text:"Belle journée pour marcher, n'est-ce pas ?"},
             {speaker:'M. Grémont', text:"De mon temps, on rentrait à la nuit tombée."} ] },
  ];
}

// ── API ────────────────────────────────────────────────────────
export function buildWorld(/* makeCanvas (ignoré : le sol est une image) */) {
  const occupied = new Set();
  const key = (x, y) => Math.floor(x/TILE) + ',' + Math.floor(y/TILE);
  function place(x, y) {
    const s = snapWalkable(x, y);
    const c0 = Math.floor(s.x/TILE), r0 = Math.floor(s.y/TILE);
    for (let rad = 0; rad < 24; rad++)
      for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
        if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
        const c = c0+dc, r = r0+dr;
        if (isSolidTile(c, r)) continue;
        const k = c + ',' + r; if (occupied.has(k)) continue;
        occupied.add(k); return { x: c*TILE+TILE/2, y: r*TILE+TILE/2 };
      }
    return s;
  }
  const spawn = place(1290, 1860);        // entrée (bas-centre, près du panneau)
  const bike  = place(1180, 1770);
  return {
    width: W, height: H, cols: COLS, rows: ROWS, solid: SOLID,
    label: 'Golf du Prieuré',
    spawn, bike,
    npcs: npcDefs().map(n => ({ ...n, ...place(n.x, n.y) })),
    golf: { x: W/2, y: H/2 },
    groundSrc: MAPIMG.src,                 // le moteur charge cette image
  };
}

export { W as WORLD_W, H as WORLD_H };
