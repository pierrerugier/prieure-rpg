// ═══════════════════════════════════════════════════════════════
// LE PRIEURÉ RPG — ENGINE
// Moteur de jeu HTML5 Canvas, style Pokémon GBA
// ═══════════════════════════════════════════════════════════════

import { NPCS, MISSIONS, DIALOGUES, COLLECTIBLES, GOLF_HOLES, MAP_ZONES }
  from './data_complete.js';
import { buildWorld } from './world.js';

// ── CONFIG ──────────────────────────────────────────────────
const CONFIG = {
  TILE:         16,        // taille d'une tile en px
  SCREEN_W:     240,       // largeur écran GBA
  SCREEN_H:     160,       // hauteur écran GBA
  SCALE:        3,         // ×3 pour affichage desktop (720×480)
  WALK_SPEED:   78,        // px/seconde (marche)
  BIKE_SPEED:   150,       // px/seconde (vélo)
  FPS_TARGET:   60,
  // Couleur de fond (hors carte)
  BG_COLOR:     '#0a0a14',
};

// ── PALETTE GBA (32 couleurs) ──────────────────────────────
const PAL = {
  0:  '#000000', // transparent
  1:  '#1e3810', // forêt profonde
  2:  '#2e5020', // forêt
  3:  '#3e6828', // forêt claire
  4:  '#4e8c38', // arbre top
  5:  '#60a848', // arbre bright
  6:  '#78c045', // fairway
  7:  '#88d055', // fairway clair
  8:  '#52902e', // rough
  9:  '#8ee450', // green golf
  10: '#e0d278', // sable bunker
  11: '#a8d878', // prairie hameau
  12: '#bcea8c', // prairie claire
  13: '#3080b8', // eau
  14: '#48a0d8', // eau claire
  15: '#1868a0', // piscine
  16: '#ccc080', // route
  17: '#b8a868', // chemin
  18: '#b8b090', // gravier
  19: '#c4a260', // pierre abbaye
  20: '#8a6030', // pierre foncée
  21: '#722810', // toit abbaye
  22: '#ddd0a5', // mur villa
  23: '#886038', // toit villa
  24: '#e8dcc0', // mur manoir
  25: '#3a2858', // toit manoir
  26: '#f0c888', // peau
  27: '#4060c0', // bleu vêtement
  28: '#d0b878', // beige pantalon
  29: '#101010', // noir
  30: '#f8f8f8', // blanc
  31: '#c82020', // rouge (drapeaux, marqueurs)
};

// ── TILE TYPES ─────────────────────────────────────────────
const TILES = {
  VOID:          0,
  FOREST_DEEP:   1,
  FOREST:        2,
  FOREST_LIGHT:  3,
  TREE:          4,   // non-walkable
  TREE_TOP:      5,   // non-walkable, dessiné en overlay
  GRASS:         6,
  FAIRWAY:       7,
  FAIRWAY_LIGHT: 8,
  ROUGH:         9,
  GREEN:         10,
  SAND:          11,
  PRAIRIE:       12,
  PRAIRIE_LIGHT: 13,
  WATER:         14,  // non-walkable
  POOL:          15,  // non-walkable
  ROAD:          16,
  PATH:          17,
  GRAVEL:        18,
  STONE_WALL:    19,  // non-walkable
  STONE_FLOOR:   20,
  BUILDING:      21,  // non-walkable
  ROOF:          22,  // overlay
  DOOR:          23,  // transition
  FENCE:         24,  // non-walkable
  HEDGE:         25,  // non-walkable
  FLAG:          26,  // décoratif
  BUNKER:        27,
  HOLE_CUP:      28,
  NPC_SPAWN:     29,  // meta
  ITEM_SPAWN:    30,  // meta
  TRIGGER:       31,  // meta (dialogue, mission)
};

// Walkable tiles
const WALKABLE = new Set([
  TILES.GRASS, TILES.FAIRWAY, TILES.FAIRWAY_LIGHT, TILES.ROUGH,
  TILES.GREEN, TILES.SAND, TILES.PRAIRIE, TILES.PRAIRIE_LIGHT,
  TILES.ROAD, TILES.PATH, TILES.GRAVEL, TILES.STONE_FLOOR,
  TILES.BUNKER, TILES.HOLE_CUP, TILES.NPC_SPAWN, TILES.ITEM_SPAWN, TILES.TRIGGER,
]);

// ── SPRITES PERSONNAGES (vue de dessus, animés) ─────────────
// Look du joueur (Pierre : polo écru, short beige — « habillé par sa mère »)
const PLAYER_LOOK = { hair:'#7a4a20', skin:'#f0c888', shirt:'#e8dcc0', pants:'#cdb074', shoes:'#5a3a18', hairStyle:'short' };

// Dessine un personnage 16×22 centré en (cx,cy) (cy ≈ torse).
// look : {hair,skin,shirt,pants,shoes, hairStyle:'short'|'long'|'curly',
//         hat:couleur|null, glasses:bool, build:'normal'|'chubby'}
function drawCharacter(ctx, cx, cy, dir, frame, look, onBike) {
  const x = cx - 8, y = cy - 14;
  const s = [0, 1, 0, -1][frame & 3];
  const skin = look.skin || '#f0c888', hair = look.hair || '#3a2a18';
  const shirt = look.shirt || '#c0c0c0', pants = look.pants || '#39414f', shoes = look.shoes || '#2a2a30';
  const chubby = look.build === 'chubby';
  // Ombre
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(x + 3, y + 20, 10, 3);

  const mir = dir === 'right';
  ctx.save();
  if (mir) { ctx.translate(x * 2 + 16, 0); ctx.scale(-1, 1); }
  const d = mir ? 'left' : dir;

  // Jambes + chaussures (marche)
  const llh = 4 + Math.max(0, s), rlh = 4 + Math.max(0, -s);
  ctx.fillStyle = pants;
  ctx.fillRect(x + 4, y + 15, 3, llh);
  ctx.fillRect(x + 9, y + 15, 3, rlh);
  ctx.fillStyle = shoes;
  ctx.fillRect(x + 4, y + 15 + llh, 3, 2);
  ctx.fillRect(x + 9, y + 15 + rlh, 3, 2);

  // Corps (plus large si enrobé)
  const bx = chubby ? x + 2 : x + 3, bw = chubby ? 12 : 10;
  ctx.fillStyle = shirt;
  ctx.fillRect(bx, y + 8, bw, 7);
  // Bras
  ctx.fillStyle = skin;
  ctx.fillRect(bx - 1, y + 9 - s, 2, 5);
  ctx.fillRect(bx + bw - 1, y + 9 + s, 2, 5);

  // Tête
  ctx.fillStyle = skin;
  ctx.fillRect(x + 4, y + 3, 8, 5);
  // Cheveux
  ctx.fillStyle = hair;
  if (d === 'up') {
    ctx.fillRect(x + 3, y, 10, 8);
    if (look.hairStyle === 'long' || look.hairStyle === 'curly') { ctx.fillRect(x + 2, y + 6, 2, 6); ctx.fillRect(x + 12, y + 6, 2, 6); }
  } else {
    ctx.fillRect(x + 3, y, 10, 4);
    ctx.fillRect(x + 3, y + 3, 2, 2); ctx.fillRect(x + 11, y + 3, 2, 2);
    if (look.hairStyle === 'long')  { ctx.fillRect(x + 2, y + 3, 2, 8); ctx.fillRect(x + 12, y + 3, 2, 8); }
    if (look.hairStyle === 'curly') { ctx.fillRect(x + 2, y, 2, 2); ctx.fillRect(x + 12, y, 2, 2);
                                      ctx.fillRect(x + 1, y + 3, 2, 6); ctx.fillRect(x + 13, y + 3, 2, 6); }
    // Yeux
    ctx.fillStyle = '#101010';
    if (d === 'down') { ctx.fillRect(x + 5, y + 5, 1, 1); ctx.fillRect(x + 10, y + 5, 1, 1); }
    else              { ctx.fillRect(x + 5, y + 5, 1, 1); }
  }
  // Lunettes (Antoine)
  if (look.glasses && d !== 'up') {
    ctx.fillStyle = '#283038';
    if (d === 'down') { ctx.fillRect(x + 4, y + 5, 3, 2); ctx.fillRect(x + 9, y + 5, 3, 2); ctx.fillRect(x + 7, y + 5, 2, 1); }
    else              { ctx.fillRect(x + 4, y + 5, 4, 2); }
  }
  // Casquette (Charles)
  if (look.hat) {
    ctx.fillStyle = look.hat;
    ctx.fillRect(x + 3, y - 1, 10, 3);
    ctx.fillRect(x + 4, y - 3, 8, 2);
    if (d !== 'up') ctx.fillRect(x + 10, y + 1, 4, 2);   // visière vers l'avant
  }

  // Vélo
  if (onBike) {
    ctx.fillStyle = '#202020';
    ctx.fillRect(x + 1, y + 18, 4, 4);
    ctx.fillRect(x + 11, y + 18, 4, 4);
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(x + 2, y + 19, 2, 2);
    ctx.fillRect(x + 12, y + 19, 2, 2);
    ctx.fillStyle = '#d02020';
    ctx.fillRect(x + 4, y + 18, 8, 2);
  }
  ctx.restore();
}

// Chien vu de dessus (~14×10), animation de pattes
function drawDog(ctx, cx, cy, dir, frame, col) {
  const x = cx - 7, y = cy - 6;
  const s = [0, 1, 0, -1][frame & 3];
  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x + 2, y + 9, 11, 2);
  const c = col || '#8a6038', cd = '#5e3e20';
  // corps
  ctx.fillStyle = c; ctx.fillRect(x + 2, y + 3, 10, 5);
  ctx.fillStyle = cd; ctx.fillRect(x + 2, y + 7, 10, 1);
  // pattes
  ctx.fillStyle = cd;
  ctx.fillRect(x + 3, y + 8, 2, 1 + Math.max(0, s));
  ctx.fillRect(x + 9, y + 8, 2, 1 + Math.max(0, -s));
  // tête selon dir
  ctx.fillStyle = c;
  const hx = dir === 'left' ? x : dir === 'right' ? x + 10 : x + 9;
  ctx.fillRect(hx, y + 1, 5, 5);
  ctx.fillStyle = cd; ctx.fillRect(hx + (dir === 'left' ? 0 : 4), y, 1, 2); // oreille
  ctx.fillStyle = '#101010'; ctx.fillRect(hx + (dir === 'left' ? 1 : 3), y + 3, 1, 1); // œil
  // queue
  ctx.fillStyle = c; ctx.fillRect(dir === 'left' ? x + 11 : x + 1, y + 2, 1, 3);
}

// Voiture vue de dessus (garée), ~26×14, en (x,y) coin haut-gauche
function drawCar(ctx, x, y, col, vertical) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x + 2, y + (vertical ? 2 : 12), vertical ? 12 : 26, vertical ? 26 : 4);
  ctx.save();
  if (vertical) { ctx.translate(x + 14, y); ctx.rotate(Math.PI / 2); }
  // carrosserie
  ctx.fillStyle = col; ctx.fillRect(x, y, 26, 12);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x, y, 26, 3);
  // vitres
  ctx.fillStyle = '#9cc8e0';
  ctx.fillRect(x + 4, y + 3, 6, 6); ctx.fillRect(x + 16, y + 3, 6, 6);
  // pare-chocs / phares
  ctx.fillStyle = '#e8e8e8'; ctx.fillRect(x + 24, y + 2, 2, 2); ctx.fillRect(x + 24, y + 8, 2, 2);
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x + 1, y - 1, 4, 2); ctx.fillRect(x + 21, y - 1, 4, 2);
  ctx.fillRect(x + 1, y + 11, 4, 2); ctx.fillRect(x + 21, y + 11, 4, 2);
  ctx.restore();
}

// Petite icône de vélo posé (au sol / HUD), ~16×11 en (x,y) coin haut-gauche
function drawBicycle(ctx, x, y) {
  ctx.fillStyle = '#202020';
  ctx.fillRect(x + 1, y + 5, 5, 5);     // roue gauche
  ctx.fillRect(x + 9, y + 5, 5, 5);     // roue droite
  ctx.fillStyle = '#80c8ff';
  ctx.fillRect(x + 2, y + 6, 3, 3);
  ctx.fillRect(x + 10, y + 6, 3, 3);
  ctx.fillStyle = '#d02020';            // cadre
  ctx.fillRect(x + 3, y + 4, 9, 2);
  ctx.fillRect(x + 6, y + 1, 2, 5);
  ctx.fillStyle = '#303030';            // guidon
  ctx.fillRect(x + 10, y + 1, 3, 1);
}

// ── CANVAS SETUP ────────────────────────────────────────────
class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx    = this.canvas.getContext('2d');
    this.canvas.width  = CONFIG.SCREEN_W * CONFIG.SCALE;
    this.canvas.height = CONFIG.SCREEN_H * CONFIG.SCALE;
    this.ctx.imageSmoothingEnabled = false;

    // Offscreen buffer (native GBA res)
    this.buffer = document.createElement('canvas');
    this.buffer.width  = CONFIG.SCREEN_W;
    this.buffer.height = CONFIG.SCREEN_H;
    this.buf = this.buffer.getContext('2d');
    this.buf.imageSmoothingEnabled = false;

    this.camera   = new Camera();
    this.player   = new Player();
    this.tilemap  = new Tilemap();
    this.npcMgr   = new NPCManager();
    this.missionMgr = new MissionManager();
    this.dialogueMgr = new DialogueManager();
    this.input    = new InputManager();
    this.saveData = this.loadSave();

    this.lastTime = 0;
    this.running  = false;
    this.paused   = false;

    this.currentScene = 'hamlet'; // 'hamlet' | 'golf_ouest' | 'golf_est' | 'golf_minigame' | 'dialogue'
  }

  async init() {
    await this.tilemap.loadMap(this.currentScene);
    this.player.x = this.tilemap.spawn.x;
    this.player.y = this.tilemap.spawn.y;
    this.player.ownsBike = !!this.saveData.player.flags.bike;
    this.player.hasBike  = false;  // on démarre à pied (B pour monter)
    this.camera.follow(this.player);
    this.camera.snap(this.player, this.tilemap);
    this.npcMgr.loadNPCs(this.tilemap);
    this.missionMgr.init(this.saveData, this);
    this.running = true;
    requestAnimationFrame(t => this.loop(t));
  }

  loop(timestamp) {
    if (!this.running) return;
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;
    this.update(dt);
    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  update(dt) {
    this.updateToast(dt);

    // Menu pause (Échap) — prioritaire
    if (this.input.isJustPressed('Start')) this.paused = !this.paused;
    if (this.paused) { this.input.flush(); return; }

    if (this.dialogueMgr.active) {
      this.dialogueMgr.update(this.input);
      this.input.flush();
      return;
    }

    // Vélo : activer / désactiver (une fois ramassé)
    if (this.input.isJustPressed('Bike') && this.player.ownsBike) {
      this.player.hasBike = !this.player.hasBike;
      this.showMessage(this.player.hasBike ? 'Vélo : EN SELLE' : 'Vélo : à pied');
    }

    this.player.update(dt, this.input, this.tilemap);
    this.camera.update(this.player, this.tilemap);
    this.npcMgr.update(dt, this.player, this.tilemap);
    this.checkTriggers();
    this.input.flush();
  }

  checkTriggers() {
    // Ramassage du vélo
    const bike = this.tilemap.bike;
    if (bike && !this.saveData.player.flags.bike &&
        Math.hypot(this.player.x - bike.x, this.player.y - bike.y) < 14) {
      this.saveData.player.flags.bike = true;
      this.player.ownsBike = true;
      this.player.hasBike = true;
      if (!this.saveData.player.inventory.includes('velo')) this.saveData.player.inventory.push('velo');
      this.showMessage('Vélo récupéré !  (B pour monter/descendre)');
      this.save();
    }

    // Interaction PNJ / chien
    if (this.input.isJustPressed('A')) {
      const npc = this.npcMgr.getFacingNPC(this.player);
      if (npc) this.talkTo(npc);
    }
  }

  talkTo(npc) {
    npc.facePlayer(this.player);
    if (npc.kind === 'dog') {
      this.dialogueMgr.start([
        { speaker: 'pierre', text: 'Comment tu vas, toi ?' },
        { speaker: npc.name || 'chien', text: 'Ouaf ouaf !' },
      ], npc, this);
      return;
    }
    // PNJ : 2-3 lignes de salutation (clé de dialogue ou lignes inline)
    this.dialogueMgr.start(npc.idle, npc, this);
  }

  handleTrigger(trigger) {
    if (trigger.type === 'transition') {
      this.transitionTo(trigger.map, trigger.x, trigger.y);
    } else if (trigger.type === 'item') {
      this.collectItem(trigger.item);
    } else if (trigger.type === 'mission') {
      this.missionMgr.trigger(trigger.mission);
    }
  }

  async transitionTo(mapId, x, y) {
    // (réservé pour les futures scènes : golf, intérieurs…)
    this.running = false;
    await this.fade('out');
    this.currentScene = mapId;
    await this.tilemap.loadMap(mapId);
    this.npcMgr.loadNPCs(this.tilemap);
    this.player.x = x ?? this.tilemap.spawn.x;
    this.player.y = y ?? this.tilemap.spawn.y;
    this.camera.snap(this.player, this.tilemap);
    await this.fade('in');
    this.running = true;
  }

  render() {
    const b = this.buf;
    b.fillStyle = CONFIG.BG_COLOR;
    b.fillRect(0, 0, CONFIG.SCREEN_W, CONFIG.SCREEN_H);

    const camX = this.camera.x;
    const camY = this.camera.y;

    // 1. Sol pré-rendu (aérien pixel-art)
    this.tilemap.renderGround(b, camX, camY);
    // 2. Vélo à ramasser (au sol)
    this.renderBike(b, camX, camY);
    // 3. PNJ (triés par Y pour la profondeur), puis joueur
    this.npcMgr.render(b, camX, camY, this.player);
    // 4. UI (dialogue box, HUD)
    this.renderHUD(b);
    this.renderToast(b);
    if (this.dialogueMgr.active) this.dialogueMgr.render(b);
    if (this.paused) this.renderPause(b);

    // Upscale buffer → display canvas
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.buffer, 0, 0,
      CONFIG.SCREEN_W * CONFIG.SCALE,
      CONFIG.SCREEN_H * CONFIG.SCALE);
  }

  // Le vélo posé au sol (tant que pas ramassé)
  renderBike(b, camX, camY) {
    const bike = this.tilemap.bike;
    if (!bike || this.saveData.player.flags.bike) return;
    const x = Math.round(bike.x - camX), y = Math.round(bike.y - camY);
    if (x < -16 || y < -16 || x > CONFIG.SCREEN_W + 16 || y > CONFIG.SCREEN_H + 16) return;
    drawBicycle(b, x - 8, y - 5);
  }

  renderHUD(b) {
    // Reputation meter (top-right)
    const rep = this.saveData.player.reputation;
    b.fillStyle = 'rgba(0,0,0,0.7)';
    b.fillRect(CONFIG.SCREEN_W - 60, 4, 56, 12);
    b.fillStyle = '#f8f8f8';
    b.font = '6px monospace';
    b.fillText(`REP:`, CONFIG.SCREEN_W - 58, 13);
    for (let i = 0; i < 5; i++) {
      b.fillStyle = i < rep ? '#f8c020' : '#404040';
      b.fillRect(CONFIG.SCREEN_W - 38 + i * 8, 6, 6, 6);
    }

    // Zone label (top-center, small)
    b.fillStyle = 'rgba(0,0,0,0.6)';
    b.fillRect(60, 4, 120, 10);
    b.fillStyle = '#c0f080';
    b.font = '6px monospace';
    b.textAlign = 'center';
    b.fillText(this.tilemap.currentZoneLabel, 120, 12);
    b.textAlign = 'left';

    // Indicateur vélo (bas-gauche) — visible dès qu'on le possède
    if (this.player.ownsBike) {
      const on = this.player.hasBike;
      b.fillStyle = on ? 'rgba(40,120,40,0.75)' : 'rgba(0,0,0,0.6)';
      b.fillRect(4, CONFIG.SCREEN_H - 16, 34, 12);
      drawBicycle(b, 6, CONFIG.SCREEN_H - 14);
      b.fillStyle = on ? '#b8ffb8' : '#88aabb';
      b.font = '6px monospace';
      b.fillText(on ? 'VÉLO ✓' : 'VÉLO (B)', 18, CONFIG.SCREEN_H - 6);
    }
  }

  // ── MENU PAUSE ────────────────────────────────────────────
  renderPause(b) {
    const W = CONFIG.SCREEN_W, H = CONFIG.SCREEN_H;
    b.fillStyle = 'rgba(8,16,12,0.82)';
    b.fillRect(0, 0, W, H);
    b.fillStyle = '#c0f080';
    b.font = 'bold 9px monospace';
    b.textAlign = 'center';
    b.fillText('— PAUSE —', W / 2, 16);
    b.textAlign = 'left';

    // Carte (mini-carte du monde) à gauche
    const mx = 8, my = 24, mw = 120, mh = 120;
    b.fillStyle = '#0c160c'; b.fillRect(mx - 1, my - 1, mw + 2, mh + 2);
    if (this.tilemap.ground) {
      const sc = Math.min(mw / this.tilemap.widthPx, mh / this.tilemap.heightPx);
      const dw = this.tilemap.widthPx * sc, dh = this.tilemap.heightPx * sc;
      b.drawImage(this.tilemap.ground, mx, my, dw, dh);
      // position du joueur
      b.fillStyle = '#ff3030';
      b.fillRect(mx + this.player.x * sc - 1, my + this.player.y * sc - 1, 3, 3);
    }
    b.fillStyle = '#6a8a6a'; b.font = '6px monospace';
    b.fillText('CARTE', mx + 2, my + mh + 8);

    // Objets (inventaire) à droite
    const ix = 138;
    b.fillStyle = '#c0f080'; b.font = 'bold 7px monospace';
    b.fillText('OBJETS', ix, 30);
    b.font = '6px monospace'; b.fillStyle = '#e8e8e8';
    const inv = this.saveData.player.inventory;
    if (inv.length === 0) { b.fillStyle = '#6a8a6a'; b.fillText('(rien pour l\'instant)', ix, 42); }
    else inv.forEach((it, i) => {
      const label = it === 'velo' ? 'Vélo' : it;
      b.fillText('• ' + label, ix, 42 + i * 9);
    });

    // Contrôles
    b.fillStyle = '#6a8a6a'; b.font = '6px monospace';
    b.fillText('ZQSD: bouger', ix, H - 40);
    b.fillText('Entrée/X: parler', ix, H - 31);
    b.fillText('B: vélo on/off', ix, H - 22);
    b.fillText('Échap: fermer', ix, H - 13);
  }

  loadSave() {
    try {
      const raw = localStorage.getItem('prieure_rpg_save');
      return raw ? JSON.parse(raw) : this.defaultSave();
    } catch {
      return this.defaultSave();
    }
  }

  defaultSave() {
    return {
      version: '1.0',
      player: { name: 'Pierre', reputation: 0, inventory: [], flags: {} },
      missions: { active: [], completed: [], failed: [] },
      collectibles: { golf_balls: [], old_photos: [], beer_caps: [], pokemon_cards: [] },
      npc_states: {},
      world: { time: 'morning', day: 1 },
      golf: { scores: {}, best_scores: {} },
    };
  }

  save() {
    localStorage.setItem('prieure_rpg_save', JSON.stringify(this.saveData));
  }

  collectItem(itemId) {
    if (!this.saveData.player.inventory.includes(itemId)) {
      this.saveData.player.inventory.push(itemId);
      this.showMessage(`Objet trouvé : ${itemId}`);
      this.missionMgr.checkItemCollected(itemId);
      this.save();
    }
  }

  async fade(direction) {
    return new Promise(resolve => {
      let alpha = direction === 'out' ? 0 : 1;
      const step = direction === 'out' ? 0.08 : -0.08;
      const id = setInterval(() => {
        alpha += step;
        this.ctx.fillStyle = `rgba(0,0,0,${Math.max(0, Math.min(1, alpha))})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if ((direction === 'out' && alpha >= 1) || (direction === 'in' && alpha <= 0)) {
          clearInterval(id);
          resolve();
        }
      }, 16);
    });
  }

  showMessage(text, duration = 2.4) {
    this._toast = { text, t: duration };
  }

  updateToast(dt) {
    if (this._toast) {
      this._toast.t -= dt;
      if (this._toast.t <= 0) this._toast = null;
    }
  }

  renderToast(b) {
    if (!this._toast) return;
    const W = CONFIG.SCREEN_W;
    const tw = b.measureText ? Math.min(W - 20, this._toast.text.length * 4 + 12) : 120;
    const x = (W - tw) / 2;
    b.fillStyle = 'rgba(0,0,0,0.82)';
    b.fillRect(x, 22, tw, 14);
    b.strokeStyle = '#f8c020';
    b.lineWidth = 1;
    b.strokeRect(x, 22, tw, 14);
    b.fillStyle = '#f8e060';
    b.font = '6px monospace';
    b.textAlign = 'center';
    b.fillText(this._toast.text, W / 2, 31);
    b.textAlign = 'left';
  }
}

// ── CAMERA ─────────────────────────────────────────────────
class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }
  follow(player) { this._target = player; }
  update(player, tilemap) {
    const hw = CONFIG.SCREEN_W / 2;
    const hh = CONFIG.SCREEN_H / 2;
    const maxX = tilemap.widthPx  - CONFIG.SCREEN_W;
    const maxY = tilemap.heightPx - CONFIG.SCREEN_H;
    this.x = Math.max(0, Math.min(player.x - hw, maxX));
    this.y = Math.max(0, Math.min(player.y - hh, maxY));
  }
  snap(player, tilemap) { this.update(player, tilemap); }
}

// ── PLAYER (vue de dessus, marche/vélo) ─────────────────────
class Player {
  constructor() {
    this.x = 0; this.y = 0;
    this.dir = 'down';
    this.frame = 0;        // 0..3 cycle de marche
    this.animT = 0;
    this.moving = false;
    this.ownsBike = false;   // possède le vélo (ramassé)
    this.hasBike = false;    // est en selle
  }

  update(dt, input, tilemap) {
    let dx = 0, dy = 0;
    if (input.isDown('left'))  dx = -1;
    if (input.isDown('right')) dx =  1;
    if (input.isDown('up'))    dy = -1;
    if (input.isDown('down'))  dy =  1;
    if (dx && dy) dy = 0;   // une direction à la fois (style Pokémon)

    if (dx || dy) {
      this.dir = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down';
      const speed = (this.hasBike ? CONFIG.BIKE_SPEED : CONFIG.WALK_SPEED) * dt;
      const nx = this.x + dx * speed;
      const ny = this.y + dy * speed;
      if (this.canMoveTo(nx, this.y, tilemap)) this.x = nx;
      if (this.canMoveTo(this.x, ny, tilemap)) this.y = ny;

      this.moving = true;
      this.animT += dt * (this.hasBike ? 2.6 : 1.7);
      this.frame = Math.floor(this.animT * 8) % 4;
    } else {
      this.moving = false;
      this.frame = 0;
      this.animT = 0;
    }
  }

  // Collision : hitbox basse (les pieds), contre la grille du monde
  canMoveTo(nx, ny, tilemap) {
    const pts = [[-5, 1], [5, 1], [-5, 7], [5, 7]];
    return pts.every(([ox, oy]) => !tilemap.isSolidPx(nx + ox, ny + oy));
  }

  render(ctx, camX, camY) {
    const sx = Math.round(this.x - camX);
    const sy = Math.round(this.y - camY);
    drawCharacter(ctx, sx, sy, this.dir, this.moving ? this.frame : 0, PLAYER_LOOK, this.hasBike);
  }
}

// ── TILEMAP (monde pixel-art aérien) ────────────────────────
class Tilemap {
  constructor() {
    this.world = null;
    this.ground = null;      // canvas du sol pré-rendu (pixellisé)
    this.solid = null;       // grille de collision
    this.cols = 0; this.rows = 0;
    this.widthPx = 0; this.heightPx = 0;
    this.currentZoneLabel = '';
    this.spawn = { x: 0, y: 0 };
    this.bike = null;
    this.npcDefs = [];
    this.golf = null;
  }

  async loadMap(/* mapId */) {
    const make = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const world = buildWorld(make);
    this.world    = world;
    this.solid    = world.solid;
    this.cols     = world.cols;
    this.rows     = world.rows;
    this.widthPx  = world.width;
    this.heightPx = world.height;
    this.currentZoneLabel = world.label;
    this.spawn    = world.spawn;
    this.bike     = world.bike;
    this.npcDefs  = world.npcs;
    this.golf     = world.golf;
    // Sol : canvas peint (clean) ou image optionnelle
    this.ground = world.ground || (world.groundSrc ? await this.loadGround(world.groundSrc) : null);
  }

  loadGround(src) {
    if (typeof Image === 'undefined' || !src) return Promise.resolve(null);
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  isSolidPx(x, y) {
    const c = Math.floor(x / CONFIG.TILE), r = Math.floor(y / CONFIG.TILE);
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return true;
    return this.solid[r * this.cols + c] === 1;
  }

  // Blit de la fenetre camera depuis le sol pre-rendu
  renderGround(ctx, camX, camY) {
    if (!this.ground) return;
    const sx = Math.max(0, Math.round(camX));
    const sy = Math.max(0, Math.round(camY));
    const w = Math.min(CONFIG.SCREEN_W, this.widthPx - sx);
    const h = Math.min(CONFIG.SCREEN_H, this.heightPx - sy);
    if (w <= 0 || h <= 0) return;
    ctx.drawImage(this.ground, sx, sy, w, h, 0, 0, w, h);
  }
}

// ── NPC ─────────────────────────────────────────────────────
class NPC {
  constructor(def) {
    const data = NPCS[def.id] || {};
    this.id    = def.id;
    this.kind  = def.kind || 'npc';   // 'npc' | 'passant' | 'dog'
    this.name  = def.name || data.name || def.id;
    this.x     = def.x;     // déjà en px monde (fourni par world.js)
    this.y     = def.y;
    this.homeX = this.x;
    this.homeY = this.y;
    this.dir   = 'down';
    this.idle      = def.idle || null;    // clé OU lignes inline
    this.wander    = !!def.wander;
    this.range     = def.range || 40;     // rayon d'errance
    this.color     = def.color || '#8a6038';
    this.frame     = 0;
    this._t        = Math.random() * 2;
    this.look = def.look || {
      hair:'#3a2a18', skin:'#f0c888', shirt:def.color || '#c0c0c0',
      pants:'#39414f', shoes:'#2a2a30',
    };
  }

  facePlayer(player) {
    const dx = player.x - this.x, dy = player.y - this.y;
    if (Math.abs(dx) > Math.abs(dy)) this.dir = dx > 0 ? 'right' : 'left';
    else                             this.dir = dy > 0 ? 'down'  : 'up';
  }

  update(dt, player, tilemap) {
    this._t += dt;
    this.frame = Math.sin(this._t * 2.2) > 0 ? 1 : 0;
    if (this.wander) {
      this._wt = (this._wt || 1) - dt;
      if (this._wt <= 0) {
        this._wt = (this.kind === 'dog' ? 0.4 : 0.9) + Math.random() * 1.6;
        const dirs = ['up','down','left','right'];
        this.dir = dirs[(Math.random() * 4) | 0];
        const d = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] }[this.dir];
        const step = this.kind === 'dog' ? 10 : 8;
        const nx = this.x + d[0] * step, ny = this.y + d[1] * step;
        if (Math.hypot(nx - this.homeX, ny - this.homeY) < this.range &&
            (!tilemap || !tilemap.isSolidPx(nx, ny + 6))) {
          this.x = nx; this.y = ny;
          this.frame = 1;
        }
      }
    }
  }

  render(ctx, camX, camY) {
    const sx = Math.round(this.x - camX), sy = Math.round(this.y - camY);
    if (this.kind === 'dog') drawDog(ctx, sx, sy, this.dir, this.frame, this.color);
    else drawCharacter(ctx, sx, sy, this.dir, this.frame, this.look, false);
  }
}

// ── NPC MANAGER ─────────────────────────────────────────────
class NPCManager {
  constructor() { this.npcs = []; }

  loadNPCs(tilemap) {
    this.npcs = (tilemap.npcDefs || []).map(def => new NPC(def));
  }

  update(dt, player, tilemap) {
    this.npcs.forEach(n => n.update(dt, player, tilemap));
  }

  getFacingNPC(player) {
    const reach = 16;
    const facing = {
      left:  [player.x - reach, player.y],
      right: [player.x + reach, player.y],
      up:    [player.x, player.y - reach],
      down:  [player.x, player.y + reach],
    }[player.dir];
    let best = null, bestD = 1e9;
    for (const n of this.npcs) {
      const d = Math.hypot(n.x - facing[0], n.y - facing[1]);
      if (d < 16 && d < bestD) { best = n; bestD = d; }
    }
    return best;
  }

  // Rendu trié par Y (profondeur) en incluant le joueur
  render(ctx, camX, camY, player) {
    const ents = this.npcs.map(n => ({ y: n.y, draw: () => n.render(ctx, camX, camY) }));
    ents.push({ y: player.y, draw: () => player.render(ctx, camX, camY) });
    ents.sort((a, b) => a.y - b.y);
    ents.forEach(e => e.draw());
  }
}

// ── DIALOGUE MANAGER ────────────────────────────────────────
class DialogueManager {
  constructor() {
    this.active   = false;
    this.lines    = [];
    this.current  = 0;
    this.text     = '';
    this.textPos  = 0;
    this.timer    = 0;
    this.speed    = 2; // chars/frame
  }

  start(dialogueRef, npc, game, onEnd) {
    this.npc   = npc;
    this.game  = game;
    this.onEnd = onEnd || null;
    this.pendingTransition = null;

    // dialogueRef peut être une clé (string) OU des lignes inline (array)
    const raw = Array.isArray(dialogueRef) ? dialogueRef : DIALOGUES[dialogueRef];
    let lines;
    if (!raw) {
      // Pas de dialogue défini : repli générique avec le bon ton
      lines = [{ speaker: npc?.name || '???', text: '...' }];
    } else if (Array.isArray(raw[0])) {
      // Pool d'ambiance : tableau de répliques, on en pioche une au hasard
      const pool = raw[(Math.random() * raw.length) | 0];
      lines = pool.map(t => ({ speaker: npc?.name || '???', text: t }));
    } else {
      // Séquence scénarisée : on sépare l'affichage des actions (transition…)
      lines = [];
      for (const l of raw) {
        if (l.type === 'transition') this.pendingTransition = l;
        else lines.push(l);
      }
    }

    this.lines   = lines;
    this.current = 0;
    this.text    = '';
    this.textPos = 0;
    this.active  = true;
  }

  finish() {
    this.active = false;
    if (this.onEnd) { const cb = this.onEnd; this.onEnd = null; cb(); }
    if (this.pendingTransition && this.game) {
      const t = this.pendingTransition;
      this.pendingTransition = null;
      // Transition vers un mini-jeu/scène si supportée (sinon ignorée proprement)
      if (t.to && this.game.transitionTo) this.game.transitionTo(t.to, t.x || 0, t.y || 0);
    }
  }

  update(input) {
    const line = this.lines[this.current];
    if (!line) { this.finish(); return; }

    // Typewriter effect
    if (this.textPos < line.text.length) {
      this.textPos += this.speed;
      this.text = line.text.slice(0, Math.floor(this.textPos));
    }

    if (input.isJustPressed('A')) {
      if (this.textPos < line.text.length) {
        // Skip typewriter
        this.textPos = line.text.length;
        this.text = line.text;
      } else {
        this.current++;
        if (this.current >= this.lines.length) {
          this.finish();
        } else {
          this.text    = '';
          this.textPos = 0;
        }
      }
    }
  }

  render(ctx) {
    const T  = CONFIG.TILE;
    const W  = CONFIG.SCREEN_W;
    const H  = CONFIG.SCREEN_H;
    const bH = 48;
    const y0 = H - bH - 2;

    // Box
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(4, y0, W-8, bH);
    ctx.strokeStyle = '#c0f080';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, y0, W-8, bH);

    // Speaker name
    const line = this.lines[this.current] || {};
    ctx.fillStyle = '#c0f080';
    ctx.font = 'bold 7px monospace';
    ctx.fillText((line.speaker || '').toUpperCase(), 10, y0 + 10);

    // Text (wrap à 50 chars)
    ctx.fillStyle = '#f8f8f8';
    ctx.font = '7px monospace';
    const words = (this.text || '').split(' ');
    let lineStr = '', lineY = y0 + 20;
    for (const word of words) {
      const test = lineStr + (lineStr ? ' ' : '') + word;
      if (ctx.measureText(test).width > W - 20) {
        ctx.fillText(lineStr, 10, lineY);
        lineStr = word; lineY += 10;
      } else {
        lineStr = test;
      }
    }
    if (lineStr) ctx.fillText(lineStr, 10, lineY);

    // Prompt (clignotant)
    if (this.textPos >= (line.text||'').length && Math.floor(Date.now()/500)%2===0) {
      ctx.fillStyle = '#c0f080';
      ctx.fillText('▼', W-14, y0 + bH - 6);
    }
  }
}

// ── MISSION MANAGER ─────────────────────────────────────────
class MissionManager {
  constructor() {
    this.saveData = null;
    this.listeners = [];
  }

  init(saveData, game) {
    this.saveData = saveData;
    this.game = game || null;
  }

  completeObjective(missionId, objectiveId) {
    const mission = MISSIONS[missionId];
    if (!mission) return;
    if (this.saveData.missions.completed.includes(missionId)) return;
    const obj = mission.objectives?.find(o => o.id === objectiveId);
    if (obj) obj._done = true;
    this.checkAllObjectives(missionId);
  }

  trigger(missionId) {
    if (this.saveData.missions.completed.includes(missionId)) return;
    if (!this.saveData.missions.active.includes(missionId)) {
      this.saveData.missions.active.push(missionId);
    }
    // TODO: déclencher cutscene / notification
  }

  complete(missionId, rewards) {
    if (this.saveData.missions.completed.includes(missionId)) return;
    this.saveData.missions.completed.push(missionId);
    this.saveData.missions.active = this.saveData.missions.active.filter(m => m !== missionId);
    if (rewards?.reputation) this.saveData.player.reputation += rewards.reputation;
    if (rewards?.unlocks) rewards.unlocks.forEach(u => this.trigger(u));
    const title = MISSIONS[missionId]?.title || missionId;
    this.game?.showMessage(`Mission accomplie : ${title}`);
    this.game?.save();
  }

  checkItemCollected(itemId) {
    // Vérifier si l'item complète un objectif de mission
    const active = this.saveData.missions.active;
    active.forEach(mId => {
      const mission = MISSIONS[mId];
      if (!mission) return;
      mission.objectives?.forEach(obj => {
        if (obj.type === 'find_item' && obj.item === itemId) {
          obj._done = true;
          this.checkAllObjectives(mId);
        }
      });
    });
  }

  checkAllObjectives(missionId) {
    const mission = MISSIONS[missionId];
    if (!mission) return;
    const allDone = mission.objectives.every(o => o._done);
    if (allDone) this.complete(missionId, mission.rewards);
  }
}

// ── INPUT MANAGER ───────────────────────────────────────────
class InputManager {
  constructor() {
    this.keys     = {};
    this.justDown = {};
    this.map = {
      ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down',
      z:'up', s:'down', q:'left', d:'right',
      Z:'up', S:'down', Q:'left', D:'right',
      Enter:'A', ' ':'A', x:'B', X:'B', Escape:'Start',
      b:'Bike', B:'Bike',
    };
    document.addEventListener('keydown', e => {
      const k = this.map[e.key] || e.key;
      if (!this.keys[k]) this.justDown[k] = true;
      this.keys[k] = true;
      e.preventDefault();
    });
    document.addEventListener('keyup', e => {
      const k = this.map[e.key] || e.key;
      this.keys[k] = false;
    });

    // Gamepad support
    this._gpPrev = {};
    this._setupGamepad();
  }

  isDown(k) { return !!this.keys[k]; }
  isJustPressed(k) { return !!this.justDown[k]; }
  flush() { this.justDown = {}; }

  _setupGamepad() {
    window.addEventListener('gamepadconnected', () => console.log('Gamepad détecté'));
  }
}

// ── GOLF MINIGAME ───────────────────────────────────────────
// (Fichier séparé recommandé : src/scenes/golf_minigame.js)
class GolfMinigame {
  constructor(game, holeData) {
    this.game     = game;
    this.hole     = holeData;
    this.phase    = 'aim';     // aim → power → flight → result
    this.ballX    = 0;
    this.ballY    = 0;
    this.angle    = 0;
    this.power    = 0;
    this.powerDir = 1;
    this.shots    = 0;
    this.club     = 'driver'; // driver / iron / wedge / putter
    this.wind     = { speed: Math.random() * 15, dir: Math.random() * Math.PI * 2 };
  }

  update(dt, input) {
    switch(this.phase) {
      case 'aim':
        if (input.isDown('left'))  this.angle -= 1.5 * dt;
        if (input.isDown('right')) this.angle += 1.5 * dt;
        if (input.isJustPressed('A')) this.phase = 'power';
        if (input.isJustPressed('B')) this.changeClub();
        break;

      case 'power':
        this.power += this.powerDir * 120 * dt;
        if (this.power >= 100) { this.power = 100; this.powerDir = -1; }
        if (this.power <= 0)   { this.power = 0;   this.powerDir = 1;  }
        if (input.isJustPressed('A')) this.shoot();
        break;

      case 'flight':
        this.updateBallFlight(dt);
        break;

      case 'result':
        if (input.isJustPressed('A')) this.nextShot();
        break;
    }
  }

  shoot() {
    this.shots++;
    // Calcul de la trajectoire
    const clubData = {
      driver: { range: 250, accuracy: 0.85 },
      iron:   { range: 160, accuracy: 0.92 },
      wedge:  { range: 80,  accuracy: 0.96 },
      putter: { range: 30,  accuracy: 0.99 },
    }[this.club];

    const dist = clubData.range * (this.power / 100);
    const acc  = clubData.accuracy + (1 - clubData.accuracy) * (this.power / 100 < 0.7 ? 1 : 0.5);
    const spread = (1 - acc) * 30;

    this.ballVX = Math.cos(this.angle + (Math.random()-0.5)*spread*Math.PI/180) * dist;
    this.ballVY = Math.sin(this.angle + (Math.random()-0.5)*spread*Math.PI/180) * dist;
    this.flightTime = 0;
    this.flightMax  = 1.5;
    this.phase = 'flight';
  }

  updateBallFlight(dt) {
    this.flightTime += dt;
    const t = this.flightTime / this.flightMax;
    // Arc parabolique
    this.ballX += this.ballVX * dt + this.wind.speed * Math.cos(this.wind.dir) * dt * 2;
    this.ballY += this.ballVY * dt + this.wind.speed * Math.sin(this.wind.dir) * dt * 2;
    if (t >= 1) {
      this.phase = 'result';
      this.evaluateLanding();
    }
  }

  evaluateLanding() {
    // TODO: vérifier si la balle est sur le green, dans le bunker, dans l'eau, OB...
    const distToHole = Math.hypot(this.ballX - this.hole.greenX, this.ballY - this.hole.greenY);
    if (distToHole < 5) this.puttable = true;
  }

  changeClub() {
    const clubs = ['driver','iron','wedge','putter'];
    const i = clubs.indexOf(this.club);
    this.club = clubs[(i+1) % clubs.length];
  }

  nextShot() {
    this.phase = 'aim';
    this.power = 0;
    this.powerDir = 1;
  }

  render(ctx) {
    const W = CONFIG.SCREEN_W, H = CONFIG.SCREEN_H;

    // Fond (vue top-down du trou)
    ctx.fillStyle = '#52902e';
    ctx.fillRect(0, 0, W, H);

    // TODO: render le trou en vue top-down
    // (fairway, green, bunkers, eau, arbres)

    // HUD Golf
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(2, 2, 100, 24);
    ctx.fillStyle = '#c0f080';
    ctx.font = '6px monospace';
    ctx.fillText(`TROU ${this.hole.n} — PAR ${this.hole.par}`, 6, 10);
    ctx.fillText(`COUPS: ${this.shots}  CLUB: ${this.club.toUpperCase()}`, 6, 18);

    // Vent
    ctx.fillStyle = '#80c8ff';
    ctx.fillText(`VENT: ${Math.round(this.wind.speed)}km/h`, W-70, 10);

    // Jauge de puissance
    if (this.phase === 'power') {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(W/2-40, H-20, 80, 14);
      ctx.fillStyle = this.power > 85 ? '#f04040' : this.power > 60 ? '#f0c040' : '#40c040';
      ctx.fillRect(W/2-38, H-18, (76 * this.power / 100), 10);
      ctx.strokeStyle = '#f8f8f8';
      ctx.lineWidth = 1;
      ctx.strokeRect(W/2-40, H-20, 80, 14);
    }

    // Mire de visée
    if (this.phase === 'aim') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      const cx = W/2, cy = H*0.6;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(this.angle)*60, cy + Math.sin(this.angle)*60);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

// ── BOOT ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  const game = new Game();
  await game.init();
  window.GAME = game; // debug
});

// Export pour modules
export { Game, Player, Tilemap, NPCManager, DialogueManager, MissionManager, GolfMinigame, CONFIG, TILES, WALKABLE, PAL };
