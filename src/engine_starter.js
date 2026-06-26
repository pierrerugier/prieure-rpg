// ═══════════════════════════════════════════════════════════════
// LE PRIEURÉ RPG — ENGINE
// Moteur de jeu HTML5 Canvas, style Pokémon GBA
// ═══════════════════════════════════════════════════════════════

import { NPCS, MISSIONS, DIALOGUES, COLLECTIBLES, GOLF_HOLES, MAP_ZONES }
  from './data_complete.js';

// ── CONFIG ──────────────────────────────────────────────────
const CONFIG = {
  TILE:         16,        // taille d'une tile en px
  SCREEN_W:     240,       // largeur écran GBA
  SCREEN_H:     160,       // hauteur écran GBA
  SCALE:        3,         // ×3 pour affichage desktop (720×480)
  PLAYER_SPEED: 1.5,       // tiles/frame
  FPS_TARGET:   60,
  MAP_W:        320,       // tiles (320×16 = 5120px)
  MAP_H:        220,       // tiles
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

// ── GÉOGRAPHIE DU HAMEAU (coordonnées en tiles) ────────────
// NB : on définit ici un repère tile cohérent pour la map moteur.
// (Les positions pixel de data_complete.js étaient des repères de
//  travail dans un autre référentiel — on les remplace par ceci.)
const HAMLET = {
  // Zone prairie jouable du hameau
  clearing: { x0: 70, y0: 56, x1: 176, y1: 178 },
  spawn:    { x: 104, y: 162 },              // devant la maison Jungers
  // Maisons : [x, y, largeur, hauteur, type]  type: 'villa' | 'manor'
  houses: {
    jungers: { x: 94,  y: 150, w: 9, h: 7, type: 'villa',  label: 'Maison Jungers' },
    lutreau: { x: 116, y: 72,  w: 12, h: 9, type: 'villa',  label: 'Villa Lutreau' },
    paul:    { x: 64,  y: 150, w: 9, h: 7, type: 'villa',  label: 'Maison de Paul' },
    kupi:    { x: 146, y: 158, w: 14, h: 11, type: 'manor', label: 'Le Manoir de Kupi' },
    oscar:   { x: 150, y: 96,  w: 12, h: 10, type: 'manor', label: 'Manoir Webb' },
    louis:   { x: 156, y: 118, w: 13, h: 10, type: 'manor', label: 'Manoir Martin' },
  },
  // PNJ présents dans le hameau : position en tiles + clé de dialogue
  npcs: [
    { id: 'victor',  x: 122, y: 84,  color: '#c83030', firstMeet: 'meet_victor_sequence', idle: 'victor_idle' },
    { id: 'charles', x: 128, y: 82,  color: '#d08020', idle: 'charles_idle' },
    { id: 'margot',  x: 119, y: 90,  color: '#e060a0', idle: 'margot_idle', wander: true },
    { id: 'antoine', x: 124, y: 90,  color: '#5090c0', idle: 'antoine_idle' },
    { id: 'oscar',   x: 156, y: 108, color: '#e8d040', idle: 'oscar_idle' },
    { id: 'louis',   x: 162, y: 130, color: '#7050a0', idle: 'louis_idle' },
    { id: 'kupi',    x: 152, y: 172, color: '#806040', idle: 'kupi_idle' },
    { id: 'paul',    x: 69,  y: 159, color: '#404858', idle: 'paul_idle' },
  ],
};

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

    this.currentScene = 'hamlet'; // 'hamlet' | 'golf_ouest' | 'golf_est' | 'golf_minigame' | 'dialogue'
  }

  async init() {
    await this.tilemap.loadMap(this.currentScene);
    this.player.x = HAMLET.spawn.x * CONFIG.TILE + 8;
    this.player.y = HAMLET.spawn.y * CONFIG.TILE + 8;
    this.camera.follow(this.player);
    this.npcMgr.loadNPCs(this.currentScene);
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
    if (this.dialogueMgr.active) {
      this.dialogueMgr.update(this.input);
      this.input.flush();
      return;
    }
    this.player.update(dt, this.input, this.tilemap);
    this.camera.update(this.player, this.tilemap);
    this.npcMgr.update(dt, this.player);
    this.checkTriggers();
    this.input.flush();
  }

  checkTriggers() {
    const tx = Math.floor(this.player.x / CONFIG.TILE);
    const ty = Math.floor(this.player.y / CONFIG.TILE);
    const trigger = this.tilemap.getTrigger(tx, ty);
    if (trigger) this.handleTrigger(trigger);

    // NPC interaction
    if (this.input.isJustPressed('A')) {
      const npc = this.npcMgr.getFacingNPC(this.player);
      if (npc) this.talkTo(npc);
    }
  }

  talkTo(npc) {
    npc.facePlayer(this.player);
    const state = this.saveData.npc_states[npc.id] || (this.saveData.npc_states[npc.id] = {});
    // Première rencontre vs dialogue d'ambiance
    const key = (npc.firstMeet && !state.met) ? npc.firstMeet : npc.idle;
    this.dialogueMgr.start(key, npc, this, () => {
      if (!state.met && npc.firstMeet) {
        state.met = true;
        this.onFirstMeet(npc);
      }
      this.save();
    });
  }

  onFirstMeet(npc) {
    // Mission "Le Nouveau" : rencontrer Victor
    if (npc.id === 'victor') {
      this.missionMgr.completeObjective('meet_victor', 'find_victor');
    }
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
    // Fade out
    this.running = false;
    await this.fade('out');
    this.currentScene = mapId;
    await this.tilemap.loadMap(mapId);
    this.npcMgr.loadNPCs(mapId);
    this.player.x = x * CONFIG.TILE;
    this.player.y = y * CONFIG.TILE;
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

    // 1. Draw floor tiles
    this.tilemap.renderLayer('floor', b, camX, camY);
    // 2. Draw NPCs (below player)
    this.npcMgr.render(b, camX, camY);
    // 3. Draw player
    this.player.render(b, camX, camY);
    // 4. Draw overlay (tree tops, roofs, etc.)
    this.tilemap.renderLayer('overlay', b, camX, camY);
    // 5. Draw UI (dialogue box, HUD)
    this.renderHUD(b);
    this.renderToast(b);
    if (this.dialogueMgr.active) this.dialogueMgr.render(b);

    // Upscale buffer → display canvas
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.buffer, 0, 0,
      CONFIG.SCREEN_W * CONFIG.SCALE,
      CONFIG.SCREEN_H * CONFIG.SCALE);
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
      missions: { active: ['meet_victor'], completed: [], failed: [] },
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

// ── PLAYER ─────────────────────────────────────────────────
class Player {
  constructor() {
    this.x     = 0;
    this.y     = 0;
    this.dir   = 'down';  // up / down / left / right
    this.frame = 0;
    this.moving = false;
    this.moveTimer = 0;
    this.sprite = null; // Spritesheet à charger
  }

  update(dt, input, tilemap) {
    let dx = 0, dy = 0;
    if (input.isDown('left'))  dx = -1;
    if (input.isDown('right')) dx =  1;
    if (input.isDown('up'))    dy = -1;
    if (input.isDown('down'))  dy =  1;

    // Diagonales : une seule direction à la fois (style Pokémon)
    if (dx && dy) dy = 0;

    if (dx || dy) {
      if      (dx < 0) this.dir = 'left';
      else if (dx > 0) this.dir = 'right';
      else if (dy < 0) this.dir = 'up';
      else             this.dir = 'down';

      const speed = CONFIG.PLAYER_SPEED * CONFIG.TILE * dt;
      const nx = this.x + dx * speed;
      const ny = this.y + dy * speed;

      if (this.canMoveTo(nx, this.y, tilemap)) this.x = nx;
      if (this.canMoveTo(this.x, ny, tilemap)) this.y = ny;

      this.moving = true;
      this.moveTimer += dt;
      if (this.moveTimer > 0.15) { this.frame ^= 1; this.moveTimer = 0; }
    } else {
      this.moving = false;
      this.frame = 0;
    }
  }

  canMoveTo(nx, ny, tilemap) {
    // Check 4 coins du sprite (12×14px hitbox centrée)
    const W = 8, H = 10;
    const offsets = [[-W/2, -H/2],[W/2, -H/2],[-W/2, H/2],[W/2, H/2]];
    return offsets.every(([ox, oy]) => {
      const tx = Math.floor((nx + ox) / CONFIG.TILE);
      const ty = Math.floor((ny + oy) / CONFIG.TILE);
      return WALKABLE.has(tilemap.get(tx, ty));
    });
  }

  render(ctx, camX, camY) {
    const sx = Math.round(this.x - camX) - 8;
    const sy = Math.round(this.y - camY) - 14;

    if (this.sprite) {
      // Spritesheet: chaque frame = 16×20px
      // Ordre: down_idle, down_1, down_2, up_idle, up_1, up_2, left_idle, left_1, left_2
      const dirIndex = { down:0, up:3, left:6, right:6 }[this.dir];
      const frameIdx = this.moving ? dirIndex + 1 + this.frame : dirIndex;
      const sx2 = (frameIdx % 8) * 16;
      ctx.save();
      if (this.dir === 'right') { ctx.scale(-1, 1); }
      ctx.drawImage(this.sprite, sx2, 0, 16, 20, sx, sy, 16, 20);
      ctx.restore();
    } else {
      // Placeholder sprite dessiné en code (GBA-style)
      this.drawPlaceholder(ctx, sx, sy);
    }
  }

  drawPlaceholder(ctx, sx, sy) {
    // Corps (polo beige, short beige, style "habillé par sa mère")
    // Tête
    ctx.fillStyle = '#f0c888';
    ctx.fillRect(sx+4, sy, 8, 7);
    // Cheveux châtains
    ctx.fillStyle = '#8a5a28';
    ctx.fillRect(sx+4, sy, 8, 3);
    ctx.fillRect(sx+4, sy+3, 2, 2);
    ctx.fillRect(sx+10, sy+3, 2, 2);
    // Yeux
    ctx.fillStyle = '#101010';
    ctx.fillRect(sx+5, sy+4, 1, 1);
    ctx.fillRect(sx+8, sy+4, 1, 1);
    // Corps (polo écru)
    ctx.fillStyle = '#e8dcc0';
    ctx.fillRect(sx+3, sy+7, 10, 7);
    // Col polo
    ctx.fillStyle = '#d0c8a8';
    ctx.fillRect(sx+6, sy+7, 4, 2);
    // Bras
    ctx.fillStyle = '#f0c888';
    ctx.fillRect(sx+2, sy+7, 2, 5);
    ctx.fillRect(sx+12, sy+7, 2, 5);
    // Short beige
    ctx.fillStyle = '#d4b870';
    ctx.fillRect(sx+3, sy+14, 10, 4);
    // Jambes
    ctx.fillStyle = '#f0c888';
    ctx.fillRect(sx+3, sy+18, 4, 2);
    ctx.fillRect(sx+9, sy+18, 4, 2);
    // Chaussures
    ctx.fillStyle = '#604020';
    ctx.fillRect(sx+2, sy+20, 5, 2);
    ctx.fillRect(sx+9, sy+20, 5, 2);

    // Direction indicator (ombre pour indiquer le sens)
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(sx+3, sy+22, 10, 3);
  }
}

// ── TILEMAP ─────────────────────────────────────────────────
class Tilemap {
  constructor() {
    this.floor   = null; // Uint8Array (MAP_W × MAP_H)
    this.overlay = null;
    this.triggers = {};
    this.widthPx  = 0;
    this.heightPx = 0;
    this.currentZoneLabel = '';

    // Tileset canvas (généré en code)
    this.tileset = this.generateTileset();
  }

  async loadMap(mapId) {
    // En attendant les vraies maps JSON issues de Tiled,
    // on génère la map procéduralement depuis la world_data
    // TODO: remplacer par fetch(`maps/${mapId}.json`)
    const data = await this.generateMap(mapId);
    this.floor   = data.floor;
    this.overlay = data.overlay;
    this.triggers = data.triggers;
    this.w = data.w;
    this.h = data.h;
    this.widthPx  = data.w * CONFIG.TILE;
    this.heightPx = data.h * CONFIG.TILE;
    this.currentZoneLabel = data.label;
  }

  get(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) return TILES.FOREST_DEEP;
    return this.floor[ty * this.w + tx];
  }

  getTrigger(tx, ty) {
    return this.triggers[`${tx},${ty}`] || null;
  }

  renderLayer(layer, ctx, camX, camY) {
    const data = layer === 'floor' ? this.floor : this.overlay;
    if (!data) return;

    const startX = Math.floor(camX / CONFIG.TILE);
    const startY = Math.floor(camY / CONFIG.TILE);
    const endX   = Math.ceil((camX + CONFIG.SCREEN_W) / CONFIG.TILE);
    const endY   = Math.ceil((camY + CONFIG.SCREEN_H) / CONFIG.TILE);

    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        const tile = layer === 'floor'
          ? this.get(tx, ty)
          : (this.overlay[ty * this.w + tx] || 0);
        if (!tile) continue;

        const px = tx * CONFIG.TILE - Math.round(camX);
        const py = ty * CONFIG.TILE - Math.round(camY);

        this.drawTile(ctx, tile, px, py, tx, ty);
      }
    }
  }

  drawTile(ctx, tileId, px, py, tx, ty) {
    // Dessin direct en code jusqu'à ce que les vrais assets soient faits
    const T = CONFIG.TILE;

    // Variation légère basée sur position (évite le pattern répétitif)
    const v = ((tx * 7 + ty * 13) & 0xf) / 15;

    switch(tileId) {
      case TILES.FOREST_DEEP:
        ctx.fillStyle = v < 0.3 ? '#1e3810' : v < 0.7 ? '#243e14' : '#1a3010';
        ctx.fillRect(px,py,T,T);
        break;
      case TILES.FOREST:
        ctx.fillStyle = v < 0.4 ? '#2e5020' : '#344a24';
        ctx.fillRect(px,py,T,T);
        break;
      case TILES.TREE:
      case TILES.FOREST_LIGHT:
        ctx.fillStyle = '#3e6828';
        ctx.fillRect(px,py,T,T);
        // Arbre simplifié 4×4 avec feuillage
        ctx.fillStyle = '#4e8c38';
        ctx.fillRect(px+4,py+2,8,8);
        ctx.fillStyle = '#60a848';
        ctx.fillRect(px+5,py+1,6,6);
        ctx.fillStyle = '#3a6820';
        ctx.fillRect(px+7,py+10,2,4); // tronc
        break;
      case TILES.FAIRWAY:
        ctx.fillStyle = Math.floor(ty/2)%2===0 ? '#78c045' : '#70b840';
        ctx.fillRect(px,py,T,T);
        break;
      case TILES.FAIRWAY_LIGHT:
        ctx.fillStyle = Math.floor(ty/2)%2===0 ? '#88d055' : '#80c84c';
        ctx.fillRect(px,py,T,T);
        break;
      case TILES.ROUGH:
        ctx.fillStyle = v < 0.4 ? '#52902e' : '#4a8428';
        ctx.fillRect(px,py,T,T);
        // Brins d'herbe haute
        ctx.fillStyle = '#3e6e20';
        if ((tx+ty)%3===0) ctx.fillRect(px+3,py+2,1,4);
        if ((tx+ty)%4===0) ctx.fillRect(px+10,py+4,1,4);
        break;
      case TILES.GREEN:
        ctx.fillStyle = v < 0.5 ? '#8ee450' : '#98ec58';
        ctx.fillRect(px,py,T,T);
        break;
      case TILES.HOLE_CUP:
        ctx.fillStyle = '#8ee450';
        ctx.fillRect(px,py,T,T);
        ctx.fillStyle = '#101010';
        ctx.beginPath(); ctx.arc(px+8,py+8,4,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath(); ctx.arc(px+8,py+8,3,0,Math.PI*2); ctx.fill();
        break;
      case TILES.SAND:
        ctx.fillStyle = v < 0.5 ? '#e0d278' : '#d8ca68';
        ctx.fillRect(px,py,T,T);
        ctx.fillStyle = '#ece890';
        ctx.fillRect(px+3,py+3,4,4);
        break;
      case TILES.PRAIRIE:
        ctx.fillStyle = v < 0.5 ? '#a8d878' : '#a0d070';
        ctx.fillRect(px,py,T,T);
        break;
      case TILES.PRAIRIE_LIGHT:
        ctx.fillStyle = v < 0.5 ? '#bcea8c' : '#b4e284';
        ctx.fillRect(px,py,T,T);
        break;
      case TILES.WATER:
        ctx.fillStyle = Math.floor(Date.now()/500)%2===0 ? '#3080b8' : '#3888c4';
        ctx.fillRect(px,py,T,T);
        ctx.fillStyle = 'rgba(120,210,255,0.3)';
        ctx.fillRect(px,py+2,T,3);
        break;
      case TILES.POOL:
        ctx.fillStyle = '#1868a0';
        ctx.fillRect(px,py,T,T);
        ctx.fillStyle = '#2080c0';
        ctx.fillRect(px+1,py+1,T-2,T-2);
        ctx.fillStyle = 'rgba(80,180,255,0.25)';
        ctx.fillRect(px+1,py+1,T-2,5);
        break;
      case TILES.ROAD:
        ctx.fillStyle = '#ccc080';
        ctx.fillRect(px,py,T,T);
        ctx.fillStyle = '#bab070';
        ctx.fillRect(px,py,1,T); ctx.fillRect(px+T-1,py,1,T);
        break;
      case TILES.PATH:
        ctx.fillStyle = v < 0.5 ? '#b8a868' : '#b0a060';
        ctx.fillRect(px,py,T,T);
        break;
      case TILES.GRAVEL:
        ctx.fillStyle = v < 0.5 ? '#b8b090' : '#b0a888';
        ctx.fillRect(px,py,T,T);
        ctx.fillStyle = '#a8a078';
        if ((tx+ty)%5<2) ctx.fillRect(px+(tx*3)%10,py+(ty*7)%10,2,2);
        break;
      case TILES.STONE_WALL:
        ctx.fillStyle = '#c4a260';
        ctx.fillRect(px,py,T,T);
        ctx.fillStyle = '#b09040';
        ctx.fillRect(px,py,T,3);
        ctx.fillStyle = '#d0b070';
        ctx.fillRect(px+2,py+4,5,3); ctx.fillRect(px+9,py+8,5,3);
        break;
      case TILES.STONE_FLOOR:
        ctx.fillStyle = '#d0b878';
        ctx.fillRect(px,py,T,T);
        ctx.fillStyle = '#c0a868';
        ctx.fillRect(px,py,T,1); ctx.fillRect(px,py,1,T);
        break;
      case TILES.BUILDING:
        ctx.fillStyle = '#ddd0a5';
        ctx.fillRect(px,py,T,T);
        break;
      case TILES.ROOF:
        ctx.fillStyle = '#886038';
        ctx.fillRect(px,py,T,T);
        ctx.fillStyle = '#6a4820';
        ctx.fillRect(px,py,T,3);
        ctx.fillStyle = '#9a7048';
        ctx.fillRect(px,py+4,T,2);
        break;
      case TILES.DOOR:
        ctx.fillStyle = '#ddd0a5';
        ctx.fillRect(px,py,T,T);
        ctx.fillStyle = '#4e2c10';
        ctx.fillRect(px+4,py+4,8,12);
        ctx.fillStyle = '#c89030';
        ctx.fillRect(px+10,py+10,2,2);
        break;
      case TILES.FENCE:
        ctx.fillStyle = '#a8d878';
        ctx.fillRect(px,py,T,T);
        ctx.fillStyle = '#c8b870';
        ctx.fillRect(px,py+6,T,2);
        ctx.fillRect(px+T/2,py,2,T);
        break;
      case TILES.HEDGE:
        ctx.fillStyle = '#2a5018';
        ctx.fillRect(px,py,T,T);
        ctx.fillStyle = '#3a6828';
        ctx.fillRect(px+2,py+2,T-4,T-4);
        ctx.fillStyle = '#2e5820';
        ctx.fillRect(px+4,py+4,T-8,T-8);
        break;
      case TILES.FLAG:
        ctx.fillStyle = '#8ee450'; // fond green
        ctx.fillRect(px,py,T,T);
        ctx.fillStyle = '#d0d0d0'; // mât
        ctx.fillRect(px+8,py+2,2,13);
        ctx.fillStyle = '#c82020'; // drapeau
        ctx.fillRect(px+10,py+2,5,5);
        break;
      default:
        ctx.fillStyle = '#2e5020';
        ctx.fillRect(px,py,T,T);
    }
  }

  generateTileset() {
    // Génération du tileset en Canvas (sera remplacé par assets PNG)
    const ts = document.createElement('canvas');
    ts.width  = 256;
    ts.height = 256;
    return ts;
  }

  // ── Helpers de construction de map ────────────────────────
  _set(buf, x, y, tile) {
    if (x < 0 || y < 0 || x >= this._bw || y >= this._bh) return;
    buf[y * this._bw + x] = tile;
  }
  _fillRect(buf, x0, y0, x1, y1, tileFn) {
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++)
        this._set(buf, x, y, typeof tileFn === 'function' ? tileFn(x, y) : tileFn);
  }
  // Une allée (route) en ligne, épaisseur donnée
  _road(buf, x0, y0, x1, y1, thick = 2) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= steps; i++) {
      const cx = Math.round(x0 + (x1 - x0) * i / steps);
      const cy = Math.round(y0 + (y1 - y0) * i / steps);
      for (let dx = 0; dx < thick; dx++)
        for (let dy = 0; dy < thick; dy++)
          this._set(buf, cx + dx, cy + dy, TILES.ROAD);
    }
  }
  // Une maison : jardin + haie + bâtiment + toit (overlay) + porte
  _house(floor, overlay, triggers, h) {
    const { x, y, w, h: hh, type } = h;
    const roof  = TILES.ROOF;
    // Jardin (pelouse claire) + haie autour, avec une ouverture devant
    this._fillRect(floor, x - 2, y - 2, x + w + 1, y + hh + 2, TILES.PRAIRIE_LIGHT);
    // Haie périmètre
    for (let gx = x - 2; gx <= x + w + 1; gx++) {
      this._set(floor, gx, y - 2, TILES.HEDGE);
      this._set(floor, gx, y + hh + 2, TILES.HEDGE);
    }
    for (let gy = y - 2; gy <= y + hh + 2; gy++) {
      this._set(floor, x - 2, gy, TILES.HEDGE);
      this._set(floor, x + w + 1, gy, TILES.HEDGE);
    }
    // Ouverture dans la haie (entrée du jardin, en bas-centre)
    const gate = x + (w >> 1);
    this._set(floor, gate,     y + hh + 2, TILES.PATH);
    this._set(floor, gate + 1, y + hh + 2, TILES.PATH);
    // Bâtiment
    this._fillRect(floor, x, y, x + w - 1, y + hh - 1, TILES.BUILDING);
    // Toit en overlay (moitié haute) — dessiné par-dessus le joueur
    this._fillRect(overlay, x, y, x + w - 1, y + Math.ceil(hh / 2) - 1, roof);
    // Porte (bas-centre du bâtiment)
    const door = x + (w >> 1);
    this._set(floor, door, y + hh - 1, TILES.DOOR);
    // Allée entre la porte et l'ouverture de la haie
    for (let py = y + hh; py <= y + hh + 1; py++) this._set(floor, door, py, TILES.PATH);
  }

  async generateMap(mapId) {
    const w = CONFIG.MAP_W, h = CONFIG.MAP_H;
    this._bw = w; this._bh = h;
    const floor    = new Uint8Array(w * h);
    const overlay  = new Uint8Array(w * h);
    const triggers = {};

    if (mapId === 'hamlet') {
      // 1. Tout en forêt
      this._fillRect(floor, 0, 0, w - 1, h - 1,
        (x, y) => (((x * 7 + y * 13) & 0xf) < 5 ? TILES.FOREST_DEEP : TILES.FOREST));
      // Quelques arbres denses en lisière
      this._fillRect(floor, 0, 0, w - 1, h - 1, (x, y) => {
        const cur = floor[y * w + x];
        return ((x * 31 + y * 17) % 23 === 0) ? TILES.TREE : cur;
      });

      // 2. Clairière prairie du hameau
      const c = HAMLET.clearing;
      this._fillRect(floor, c.x0, c.y0, c.x1, c.y1,
        (x, y) => (((x * 5 + y * 11) & 0xf) < 6 ? TILES.PRAIRIE_LIGHT : TILES.PRAIRIE));

      // 3. Les trois allées
      // Allée des Fougères (axe nord-sud principal)
      this._road(floor, 110, c.y0, 110, c.y1, 3);
      // Allée des Hameaux (ouest, parallèle)
      this._road(floor, 76, 96, 76, c.y1, 2);
      this._road(floor, 76, 162, 110, 162, 2);   // raccord vers Fougères
      // Allée de la Lisière (diagonale NE, donne sur le parcours Est)
      this._road(floor, 112, 150, 168, 100, 2);
      // Place du Prieuré (cul-de-sac central, gravier)
      this._fillRect(floor, 104, 158, 118, 170, TILES.GRAVEL);

      // 4. Les maisons
      for (const key in HAMLET.houses) {
        this._house(floor, overlay, triggers, HAMLET.houses[key]);
      }

      // 5. Triggers : sortie vers le golf (bout est de l'allée de la Lisière)
      for (let ty = 99; ty <= 102; ty++) {
        triggers[`169,${ty}`] = { type: 'transition', map: 'golf_ouest', x: 20, y: 60 };
        triggers[`170,${ty}`] = { type: 'transition', map: 'golf_ouest', x: 20, y: 60 };
      }

      // S'assurer que le spawn est bien marchable
      this._set(floor, HAMLET.spawn.x, HAMLET.spawn.y, TILES.PRAIRIE);

      return { floor, overlay, triggers, w, h, label: 'Hameau du Prieuré' };
    }

    // ── Golf (placeholder jouable en attendant la vraie géo) ──
    this._fillRect(floor, 0, 0, w - 1, h - 1,
      (x, y) => (((x * 7 + y * 13) & 0xf) < 5 ? TILES.FOREST_DEEP : TILES.FOREST));
    // Un fairway central + green
    this._fillRect(floor, 14, 30, 90, 90, TILES.FAIRWAY);
    this._fillRect(floor, 18, 40, 40, 80, TILES.ROUGH);
    this._fillRect(floor, 70, 50, 86, 70, TILES.GREEN);
    this._set(floor, 78, 60, TILES.HOLE_CUP);
    this._set(floor, 79, 59, TILES.FLAG);
    // Retour vers le hameau
    for (let ty = 58; ty <= 62; ty++) {
      triggers[`14,${ty}`] = { type: 'transition', map: 'hamlet', x: 167, y: 100 };
      triggers[`15,${ty}`] = { type: 'transition', map: 'hamlet', x: 167, y: 100 };
    }
    return { floor, overlay, triggers, w, h, label: 'Parcours Ouest' };
  }
}

// ── NPC ─────────────────────────────────────────────────────
class NPC {
  constructor(def) {
    const data = NPCS[def.id] || {};
    this.id    = def.id;
    this.name  = data.name || def.id;
    this.x     = def.x * CONFIG.TILE + 8;   // centre de la tile
    this.y     = def.y * CONFIG.TILE + 8;
    this.homeX = this.x;
    this.homeY = this.y;
    this.dir   = 'down';
    this.color = def.color || '#c0c0c0';
    this.firstMeet = def.firstMeet || null;
    this.idle      = def.idle || null;
    this.wander    = !!def.wander;
    this.frame     = 0;
    this._t        = Math.random() * 2;
    this._bob      = 0;
  }

  facePlayer(player) {
    const dx = player.x - this.x, dy = player.y - this.y;
    if (Math.abs(dx) > Math.abs(dy)) this.dir = dx > 0 ? 'right' : 'left';
    else                             this.dir = dy > 0 ? 'down'  : 'up';
  }

  update(dt, player) {
    // Petite animation d'idle (respiration) ; errance légère si wander
    this._t += dt;
    this._bob = Math.sin(this._t * 3) < 0 ? 0 : 1;
    if (this.wander) {
      this._wt = (this._wt || 0) - dt;
      if (this._wt <= 0) {
        this._wt = 1 + Math.random() * 2;
        const dirs = ['up','down','left','right'];
        this.dir = dirs[(Math.random() * 4) | 0];
        const d = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] }[this.dir];
        const nx = this.x + d[0] * CONFIG.TILE;
        const ny = this.y + d[1] * CONFIG.TILE;
        // reste près de chez soi
        if (Math.hypot(nx - this.homeX, ny - this.homeY) < CONFIG.TILE * 4) {
          this.x = nx; this.y = ny;
        }
      }
    }
  }

  render(ctx, camX, camY) {
    const sx = Math.round(this.x - camX) - 8;
    const sy = Math.round(this.y - camY) - 14 + this._bob;
    // Ombre
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(sx + 3, sy + 21, 10, 3);
    // Tête
    ctx.fillStyle = '#f0c888';
    ctx.fillRect(sx + 4, sy, 8, 7);
    ctx.fillStyle = '#101010';
    if (this.dir !== 'up') {
      ctx.fillRect(sx + 5, sy + 4, 1, 1);
      ctx.fillRect(sx + 9, sy + 4, 1, 1);
    }
    // Corps (couleur distinctive du perso)
    ctx.fillStyle = this.color;
    ctx.fillRect(sx + 3, sy + 7, 10, 8);
    // Bras
    ctx.fillStyle = '#f0c888';
    ctx.fillRect(sx + 2, sy + 7, 2, 5);
    ctx.fillRect(sx + 12, sy + 7, 2, 5);
    // Jambes
    ctx.fillStyle = '#3a3a40';
    ctx.fillRect(sx + 3, sy + 15, 4, 5);
    ctx.fillRect(sx + 9, sy + 15, 4, 5);
  }
}

// ── NPC MANAGER ─────────────────────────────────────────────
class NPCManager {
  constructor() { this.npcs = []; }

  loadNPCs(mapId) {
    this.npcs = [];
    if (mapId === 'hamlet') {
      this.npcs = HAMLET.npcs.map(def => new NPC(def));
    }
    // (Golf : PNJ à ajouter quand la map golf sera construite)
  }

  update(dt, player) {
    this.npcs.forEach(n => n.update(dt, player));
  }

  getFacingNPC(player) {
    const facing = {
      left:  [player.x - CONFIG.TILE, player.y],
      right: [player.x + CONFIG.TILE, player.y],
      up:    [player.x, player.y - CONFIG.TILE],
      down:  [player.x, player.y + CONFIG.TILE],
    }[player.dir];
    return this.npcs.find(n =>
      Math.abs(n.x - facing[0]) < CONFIG.TILE &&
      Math.abs(n.y - facing[1]) < CONFIG.TILE
    ) || null;
  }

  render(ctx, camX, camY) {
    this.npcs.forEach(n => n.render(ctx, camX, camY));
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

  start(dialogueKey, npc, game, onEnd) {
    this.npc   = npc;
    this.game  = game;
    this.onEnd = onEnd || null;
    this.pendingTransition = null;

    const raw = DIALOGUES[dialogueKey];
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
      Enter:'A', ' ':'A', x:'B', Escape:'Start',
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
