# TILESET & ASSETS GUIDE — Le Prieuré RPG

## CONTEXTE

Tous les assets doivent être générés **en code Canvas 2D** dans un premier temps,
puis remplacés par de vrais sprites PNG si disponibles.
Style GBA strict : palette 32 couleurs, pixel art 16×16, pas d'antialiasing.

---

## TILESET PRINCIPAL (tileset_prieure.png)

### Dimensions
- Tile size : **16×16px**
- Tileset : **256×256px** = 16×16 tiles = 256 tiles numérotées

### Layout suggéré (16 tiles par rangée)

```
Rangée 0 (tiles 0-15)  : Terrain de base
  0: vide/transparent
  1: forêt profonde
  2: forêt (variation A)
  3: forêt (variation B)
  4: arbre (bas, walkable)
  5: arbre (haut, overlay)
  6: herbe prairie
  7: herbe prairie claire
  8: fairway (rayure A)
  9: fairway (rayure B)
  10: rough
  11: rough foncé
  12: green golf
  13: green golf brillant
  14: sable bunker
  15: sable bunker clair

Rangée 1 (tiles 16-31) : Eau & chemins
  16: eau (frame 1)
  17: eau (frame 2) — animation
  18: eau claire
  19: piscine carrelage
  20: route (horizontal)
  21: route (vertical)
  22: chemin terre
  23: gravier
  24: bord route N
  25: bord route S
  26: bord route E
  27: bord route O
  28: coin route NE
  29: coin route NO
  30: coin route SE
  31: coin route SO

Rangée 2 (tiles 32-47) : Abbaye
  32: mur pierre (bas)
  33: mur pierre (haut)
  34: arche (bas)
  35: arche (haut)
  36: toit tuile A
  37: toit tuile B
  38: fenêtre arche
  39: sol cour
  40: sol terrasse
  41: pierre claire
  42: pierre foncée
  43: porte abbaye
  44: clocher bas
  45: clocher haut
  46: croix
  47: topiaire

Rangée 3 (tiles 48-63) : Villas plain-pied
  48: mur villa (bas)
  49: mur villa (haut)
  50: toit villa A
  51: toit villa B
  52: fenêtre villa
  53: porte villa
  54: lambris (décoration)
  55: pelouse jardin
  56: haie villa
  57: haie coin
  58: allée entrée
  59: garage
  60: terrasse villa
  61: store
  62-63: (libre)

Rangée 4 (tiles 64-79) : Manoirs IDF
  64: mur manoir (bas RDC)
  65: mur manoir (étage)
  66: toit manoir A (violet)
  67: toit manoir B
  68: fenêtre RDC + volets
  69: fenêtre étage + volets
  70: porte manoir
  71: perron
  72: pelouse manoir (grande)
  73: haie taillée
  74: cheminée
  75: lucarne
  76-79: (libre)

Rangée 5 (tiles 80-95) : Golf spécial
  80: tee de départ (plaque)
  81: drapeau rouge
  82: drapeau bleu
  83: hole cup
  84: bunker edge N
  85: bunker edge S
  86: bunker edge E
  87: bunker edge O
  88: water hazard edge
  89: green edge
  90: panneau trou
  91: chariot de golf
  92: practice mat
  93: mât drapeau
  94: panneau distance
  95: score panel

Rangée 6-7 (tiles 96-127) : Décoratif
  96-103: variations d'arbres (différentes espèces)
  104-111: buissons, fougères
  112-119: fleurs, herbes hautes
  120-127: rochers, souches

Rangée 8-9 (tiles 128-159) : Bâtiments annexes
  128-135: piscine (bordures, plongeoir, transats)
  136-143: tennis (court, filet, lignes)
  144-151: parking (asphalte, lignes)
  152-159: divers (fontaine, banc, table, panneau)

Rangée 10-15 (tiles 160-255) : Sprites persos
  (séparés dans spritesheets individuels)
```

---

## SPRITESHEETS PERSONNAGES

### Format
- Chaque sprite : **16×20px** (légèrement plus grand que la tile pour le personnage)
- Spritesheet par personnage : **128×20px** (8 frames horizontales)
- Frame order : down_idle | down_walk_1 | down_walk_2 | up_idle | up_walk_1 | up_walk_2 | left_idle | left_walk_1
- Note : right = miroir de left (flip horizontal en code)

### Fichiers
```
assets/sprites/
├── player_pierre.png    (128×20)
├── npc_victor.png       (128×20) — polo kaki, look sportif
├── npc_charles.png      (128×20) — t-shirt DBZ, plus grand (né 89)
├── npc_margot.png       (128×20) — robe colorée, folle
├── npc_oscar.png        (128×20) — polo golf, légèrement plus gros
├── npc_antoine.png      (128×20) — lunettes rondes, sac à dos
├── npc_paul.png         (128×20) — t-shirt simple, regard dur
├── npc_kupi.png         (128×20) — t-shirt fripé, détendu
├── npc_arthur.png       (128×20) — hoodie large, style rappeur
├── npc_louis.png        (128×20) — polo classe, port altier
├── npc_kid_generic.png  (128×20) — enfant générique (Martin, Vincent, Alex)
├── npc_greenkeeper.png  (128×20) — combinaison verte, bonnet
└── npc_adult_generic.png (128×20) — adulte générique (parents)
```

### Couleurs Pierre Jungers (le joueur)
```
Peau :        #f0c888
Cheveux :     #8a5a28 (châtain)
Polo :        #e8dcc0 (écru/crème, habillé par sa mère)
Short :       #d4b870 (beige kaki)
Chaussures :  #604020 (marron)
Yeux :        #4a3020 (brun)
```

### Couleurs Victor Lutreau
```
Cheveux :     #1a1a1a (brun foncé)
T-shirt :     #4060a0 (bleu marine)
Bermuda :     #404040 (gris foncé)
Chaussures :  #202020 (noir)
Peau :        #e8b870
```

### Couleurs Oscar Webb
```
Cheveux :     #c8a060 (blond-roux)
Polo golf :   #e8e8e8 (blanc cassé)
Pantalon :    #d0c8a0 (khaki clair)
Visage :      légèrement plus large (1-2px)
```

---

## FACES (portraits dialogue)

Format : **48×48px** par portrait
Style : pixel art détaillé, expression visible

```
assets/sprites/faces/
├── victor_neutral.png
├── victor_smirk.png
├── victor_angry.png
├── charles_excited.png  (expression DBZ)
├── oscar_happy.png
├── oscar_confused.png   (fautes de français)
├── antoine_nervous.png
├── paul_silent.png
├── kupi_laugh.png
├── arthur_cool.png
├── louis_thoughtful.png
├── margot_silly.png
└── pierre_shy.png       (le joueur)
```

---

## SONS & MUSIQUE

### Format
- Musique : MIDI ou .mod tracker (authentique GBA)
- SFX : .wav 22050Hz mono 8bit

### Pistes musicales
```
assets/sounds/
├── music_title.mid          — écran titre, mélancolique et nostalgique
├── music_hamlet.mid         — thème hameau, calme, été
├── music_hamlet_night.mid   — version nocturne, mystérieuse
├── music_golf.mid           — thème golf, décontracté
├── music_golf_tension.mid   — jauge de puissance
├── music_victory.mid        — jingle birdie/eagle
├── music_defeat.mid         — jingle bogey/double bogey
├── music_abbey.mid          — intérieur abbaye, solennel
├── music_finale.mid         — fin de l'été, émouvant
├── sfx_step_grass.wav
├── sfx_step_path.wav
├── sfx_ball_hit.wav
├── sfx_ball_land.wav
├── sfx_ball_water.wav
├── sfx_dialogue.wav         — bip typewriter
├── sfx_item_found.wav
├── sfx_mission_complete.wav
└── sfx_menu_select.wav
```

---

## GÉNÉRATION ASSETS EN CODE (fallback)

Quand pas de vrais assets PNG, **tout doit être dessiné en Canvas 2D**.
L'engine_starter.js contient déjà `drawTile()` et `drawPlaceholder()` pour le joueur.

### Priorité de développement des assets
1. Player sprite (Pierre) — critique pour le prototype
2. Tileset terrain (forêt, prairie, route, fairway) — critique
3. Abbaye tiles — important
4. Villas tiles — important
5. NPCs sprites — phase 2
6. Faces dialogue — phase 2
7. Sons — phase 3
