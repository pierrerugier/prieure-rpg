// Smoke test headless : simule juste assez de DOM/Canvas pour exécuter le moteur.
// Lance : node tools/smoketest.mjs

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

const listeners = {};
globalThis.window = globalThis;
globalThis.requestAnimationFrame = () => 0;
globalThis.localStorage = { _d:{}, getItem(k){return this._d[k]??null;}, setItem(k,v){this._d[k]=String(v);} };
globalThis.document = {
  getElementById: () => makeCanvas(),
  createElement: () => makeCanvas(),
  addEventListener: (ev, fn) => { (listeners[ev] ||= []).push(fn); },
};
globalThis.addEventListener = (ev, fn) => { (listeners[ev] ||= []).push(fn); };

const { CONFIG } = await import('../src/engine_starter.js');
for (const fn of (listeners['DOMContentLoaded'] || [])) await fn();
await new Promise(r => setTimeout(r, 50));

const game = globalThis.GAME;
if (!game) { console.error('❌ window.GAME absent — le boot a échoué'); process.exit(1); }

const checks = [];
const ok = (label, cond) => checks.push([label, !!cond]);

ok('jeu démarré', game.running);
ok('monde construit (grille de collision)', game.tilemap.cols > 0 && game.tilemap.solid);
ok('8 amis présents', game.npcMgr.npcs.filter(n => n.kind === 'npc' && n.id !== 'greenkeeper').length === 8);
ok('chiens présents', game.npcMgr.npcs.filter(n => n.kind === 'dog').length >= 1);
ok('passants présents', game.npcMgr.npcs.filter(n => n.kind === 'passant').length >= 1);
ok('spawn sur case marchable', !game.tilemap.isSolidPx(game.player.x, game.player.y));
ok('vélo placé sur le monde', game.tilemap.bike && !game.tilemap.isSolidPx(game.tilemap.bike.x, game.tilemap.bike.y));
ok('tous les personnages sur cases marchables',
   game.npcMgr.npcs.every(n => !game.tilemap.isSolidPx(n.x, n.y)));

// 30 frames sans crash
let err = null;
try { for (let i=0;i<30;i++){ game.update(0.016); game.render(); } } catch(e){ err = e; }
ok('30 frames update+render sans crash', !err);
if (err) console.error('   ↳', err.message);

// Déplacement : on tente les 4 directions, au moins une doit bouger
const x0=game.player.x, y0=game.player.y;
let moved=false;
for (const d of ['right','left','down','up']) {
  game.player.x=x0; game.player.y=y0;
  game.input.keys[d]=true;
  for (let i=0;i<25;i++) game.update(0.016);
  game.input.keys[d]=false;
  if (Math.hypot(game.player.x-x0, game.player.y-y0) > 4) { moved=true; break; }
}
ok('le joueur se déplace', moved);

// Vitesse vélo > marche : meilleure distance sur 4 directions depuis le spawn
function runDir(flag, key){
  game.player.x=x0; game.player.y=y0; game.player.ownsBike=true; game.player.hasBike=flag;
  game.input.keys={}; game.input.keys[key]=true;
  let d=0; for(let i=0;i<8;i++){ const px=game.player.x,py=game.player.y; game.update(0.05); d+=Math.hypot(game.player.x-px,game.player.y-py);}
  game.input.keys={}; return d;
}
function bestDist(flag){ return Math.max(...['down','right','up','left'].map(k=>runDir(flag,k))); }
const dWalk=bestDist(false), dBike=bestDist(true);
game.player.x=x0; game.player.y=y0; game.player.ownsBike=false; game.player.hasBike=false;
ok('le vélo va plus vite que la marche', dBike > dWalk * 1.4);
game.player.hasBike=false; game.player.x=x0; game.player.y=y0;

// Ramassage du vélo
game.player.x = game.tilemap.bike.x;
game.player.y = game.tilemap.bike.y;
game.update(0.016);
ok('vélo ramassé au contact', game.saveData.player.flags.bike === true && game.player.hasBike);

// Chaque PNJ : on lui parle → dialogue de 2 à 3 lignes (pas de mission)
function talkLines(npc) {
  game.dialogueMgr.active = false;
  game.player.x = npc.x; game.player.y = npc.y + 16; game.player.dir = 'up';
  game.input.justDown['A'] = true;
  game.update(0.016);
  return game.dialogueMgr.active ? game.dialogueMgr.lines.length : 0;
}
const victor = game.npcMgr.npcs.find(n => n.id === 'victor');
talkLines(victor);
ok('dialogue de Victor déclenché', game.dialogueMgr.active);
ok('1re réplique de Victor', /nouveau/i.test(game.dialogueMgr.lines[0]?.text || ''));
const everyHas23 = game.npcMgr.npcs.every(n => { const l = talkLines(n); return l >= 2 && l <= 3; });
ok('chaque personnage a 2-3 lignes de dialogue', everyHas23);
ok('aucune mission active (mises de côté)', game.saveData.missions.active.length === 0);

// Chien → « Ouaf ouaf ! »
const dog = game.npcMgr.npcs.find(n => n.kind === 'dog');
talkLines(dog);
ok('le chien fait « Ouaf »', /ouaf/i.test((game.dialogueMgr.lines.find(l => /ouaf/i.test(l.text)) || {}).text || ''));
game.dialogueMgr.active = false;

// Vélo activable / désactivable (B)
game.player.ownsBike = true; game.player.hasBike = false;
game.input.justDown['Bike'] = true; game.update(0.016);
const rodeOn = game.player.hasBike;
game.input.justDown['Bike'] = true; game.update(0.016);
ok('vélo on/off avec B', rodeOn === true && game.player.hasBike === false);

// Menu pause (Échap)
game.input.justDown['Start'] = true; game.update(0.016);
const wasPaused = game.paused;
game.input.justDown['Start'] = true; game.update(0.016);
ok('menu pause s\'ouvre/ferme (Échap)', wasPaused === true && game.paused === false);

console.log('\n── RÉSULTATS DU SMOKE TEST ──');
let pass=0;
for (const [l,g] of checks){ console.log(`${g?'✅':'❌'} ${l}`); if(g)pass++; }
console.log(`\n${pass}/${checks.length} vérifications OK`);
process.exit(pass===checks.length?0:1);
