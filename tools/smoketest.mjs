// Smoke test headless : simule juste assez de DOM/Canvas pour exécuter le moteur.
// Lance : node tools/smoketest.mjs

// ── Stub Canvas 2D context (toute méthode = no-op, measureText renvoie une largeur)
function makeCtx() {
  return new Proxy({}, {
    get(t, p) {
      if (p === 'measureText') return () => ({ width: 10 });
      if (p in t) return t[p];
      return () => {};
    },
    set(t, p, v) { t[p] = v; return true; },
  });
}
function makeCanvas() {
  return { width: 0, height: 0, getContext: () => makeCtx() };
}

// ── Stubs globaux
const listeners = {};
globalThis.window = globalThis;
globalThis.requestAnimationFrame = () => 0; // on pilote la boucle à la main
globalThis.localStorage = {
  _d: {},
  getItem(k) { return this._d[k] ?? null; },
  setItem(k, v) { this._d[k] = String(v); },
};
globalThis.document = {
  getElementById: () => makeCanvas(),
  createElement: () => makeCanvas(),
  addEventListener: (ev, fn) => { (listeners[ev] ||= []).push(fn); },
};
globalThis.addEventListener = (ev, fn) => { (listeners[ev] ||= []).push(fn); };

// ── Import du moteur
const mod = await import('../src/engine_starter.js');
const { CONFIG } = mod;

// Déclenche le boot
for (const fn of (listeners['DOMContentLoaded'] || [])) await fn();
// Laisse l'init async se terminer
await new Promise(r => setTimeout(r, 50));

const game = globalThis.GAME;
if (!game) { console.error('❌ window.GAME absent — le boot a échoué'); process.exit(1); }

const checks = [];
const ok = (label, cond) => { checks.push([label, !!cond]); };

ok('jeu démarré (running)', game.running);
ok('map hameau chargée', game.tilemap && game.tilemap.w === CONFIG.MAP_W);
ok('PNJ chargés (>0)', game.npcMgr.npcs.length > 0);
ok('8 PNJ dans le hameau', game.npcMgr.npcs.length === 8);

// Spawn marchable ?
const spawnWalkable = game.player.canMoveTo(game.player.x, game.player.y, game.tilemap);
ok('spawn sur tile marchable', spawnWalkable);

// Tourne 30 frames de simulation (update + render) sans crash
let frameError = null;
try {
  for (let i = 0; i < 30; i++) { game.update(0.016); game.render(); }
} catch (e) { frameError = e; }
ok('30 frames sans crash', !frameError);
if (frameError) console.error('   ↳', frameError.message);

// Le joueur peut-il bouger vers la droite ? (vers la place du Prieuré)
const x0 = game.player.x;
game.input.keys['right'] = true;
for (let i = 0; i < 20; i++) { game.update(0.016); }
game.input.keys['right'] = false;
ok('le joueur se déplace', game.player.x !== x0);

// ── Test dialogue : rencontre de Victor
const victor = game.npcMgr.npcs.find(n => n.id === 'victor');
ok('Victor présent', !!victor);
if (victor) {
  // Place le joueur juste en dessous de Victor, tourné vers lui
  game.player.x = victor.x;
  game.player.y = victor.y + CONFIG.TILE;
  game.player.dir = 'up';
  game.input.justDown['A'] = true;
  game.update(0.016);
  ok('dialogue déclenché', game.dialogueMgr.active);
  const first = game.dialogueMgr.lines[0];
  ok('1re réplique = celle de Victor ("T\'es qui toi ?")',
     first && /qui toi/i.test(first.text));

  // Déroule tout le dialogue
  let guard = 0;
  while (game.dialogueMgr.active && guard++ < 100) {
    game.dialogueMgr.text = game.dialogueMgr.lines[game.dialogueMgr.current]?.text || '';
    game.dialogueMgr.textPos = 9999;
    game.input.justDown['A'] = true;
    game.dialogueMgr.update(game.input);
    game.input.flush();
  }
  ok('dialogue terminé proprement', !game.dialogueMgr.active);
  ok('Victor marqué comme rencontré', game.saveData.npc_states.victor?.met === true);
  ok('mission "meet_victor" complétée',
     game.saveData.missions.completed.includes('meet_victor'));
  ok('réputation passée à 1', game.saveData.player.reputation >= 1);
}

// ── Rapport
console.log('\n── RÉSULTATS DU SMOKE TEST ──');
let pass = 0;
for (const [label, good] of checks) {
  console.log(`${good ? '✅' : '❌'} ${label}`);
  if (good) pass++;
}
console.log(`\n${pass}/${checks.length} vérifications OK`);
process.exit(pass === checks.length ? 0 : 1);
