# LE PRIEURÉ RPG — INSTRUCTIONS POUR CLAUDE CODE

## CONTEXTE DU PROJET

Tu prends en charge le développement d'un RPG de type Pokémon GBA, basé sur un lieu réel : le Golf du Prieuré (Bonnelles, Yvelines), et sur un groupe d'amis d'enfance réels. Le commanditaire s'appelle Pierre (personnage joueur : Pierre Jungers). C'est un projet personnel et affectif — chaque détail compte.

Le jeu doit être :
- **Jouable dans un navigateur** (HTML5 Canvas, JS vanilla ou Phaser 3)
- **Exportable en ROM GBA** (via GB Studio ou devkitARM dans un second temps)
- **Single file ou bundle simple** — pas de framework lourd, pas de bundler obligatoire

---

## VISION DU JEU

### Gameplay
- **Vue top-down** tile-based, style Pokémon GBA (Fire Red / Emerald)
- **Tile size : 16×16px** sur une map de ~300×200 tiles minimum (parcours entier)
- **Progression à la GTA** : pas de level-up classique. Déblocage de missions par rencontres, objets collectés, réputation dans la bande
- **Mini-jeu golf jouable** intégré (top-down, jauge de puissance, vent, parcours réel)
- **Objets cachés à collectionner** dans les roughs, les bois, les maisons
- **Missions principales + annexes** déclenchées par les PNJ
- **Dialogues contextuels** riches, humour de bande, références internes

### Univers
- Été des années 2000-2005, ados de 10-15 ans
- Ambiance : liberté totale, golf obligatoire (sinon parents en colère), vélos, forêt, piscine, barbecues, nuits dans les bois
- Ton : nostalgique, drôle, légèrement mélancolique. Jamais niais.

---

## GÉOGRAPHIE (source : vraies cartes fournies)

### Le Hameau
Hameau privé dans la forêt de Rambouillet, adjacent au golf.

**Allée des Fougères** (axe nord-sud principal) :
- Petites villas plain-pied, style californien années 70, lambris et pierre, ~120m²
- ~8-10 maisons de chaque côté, jardins boisés

**Allée des Hameaux** (ouest, parallèle) :
- Villas similaires, plus isolées, plus enfouies dans la forêt
- ~6-7 maisons

**Allée de la Lisière** (diagonale NE, donne sur le parcours Est) :
- **Grandes maisons à étage**, style Île-de-France, 200-300m²
- Vue directe sur le golf
- ~8-9 maisons

**Le Prieuré** (centre) :
- Ensemble de bâtiments groupés autour d'une clairière/cul-de-sac
- Point de convergence naturel de la bande

**Total maisons à représenter : ~45-55 bâtiments**, tous avec jardin, haie, allée d'accès.

### Le Golf
Deux parcours 18 trous :
- **Parcours Ouest** : forme organique, trous 1-18, serpentant dans la forêt
- **Parcours Est** : plus à droite, trous 1-18, avec étang (trou 2 Est), vues dégagées

**Éléments clés du golf :**
- Abbaye médiévale en pierre (XIIe s.) = Club-House. Arches romanes caractéristiques, toit tuiles brunes, grande terrasse.
- Piscine olympique (nord-est de l'abbaye)
- Practice (nord, longues bandes de tonte)
- Putting green (est de l'abbaye)
- Parking (gravier)
- 2 courts de tennis
- Route D130 (accès principal, sud)

---

## PERSONNAGES

### Pierre Jungers — LE JOUEUR (toi)
- Timide, habillé à l'ancienne par sa mère (polos, shorts beige)
- Doit jouer au golf sinon parents en colère
- Très proche d'Oscar
- Petite sœur jamais visible, parfois mentionnée
- Sprite : personnage discret, look années 90 anachronique

### NOYAU DUR DE LA BANDE

| Perso | Famille | Style | Rôle RPG | Position sur carte |
|-------|---------|-------|----------|-------------------|
| **Victor Lutreau** | Allée des Fougères (nord) | Leader charismatique, dur, agressif mais très drôle | PNJ déclencheur — donne la mission principale | Villa Allée des Fougères |
| **Charles Lutreau** | Même maison que Victor | Né en 89 (4 ans de plus), ado éternel, fan DBZ/Pokémon, fait le caïd | PNJ mentor/rival — donne accès à des zones avancées | Villa Allée des Fougères |
| **Margot Lutreau** | Même maison | Petite sœur fofolle et délurée, tout le monde l'adore | PNJ quêtes annexes improbables | Villa Allée des Fougères |
| **Oscar Webb** | Allée de la Lisière (grande maison) | Mère américaine, père anglais, fait des fautes de français, un peu gros, excellent golfeur | PNJ allié golf — tutoriel golf, défis parcours | Manor Allée de la Lisière |
| **Antoine Zirimirs** | Pas de maison sur carte (parents hors hameau) | Binoculard, un peu bègue, très gentil, intelligent et cultivé, dort chez tout le monde | PNJ encyclopédie — donne des infos en échange de rien | Chez les Lutreau / Jungers / partout |
| **Paul** | Hameau (villa) | Dur, peu de mots, quand il parle ça compte. A deux petits frères Martin et Vincent | PNJ tardif — sa quête se débloque quand on a prouvé sa valeur | Villa Allée des Hameaux |
| **Kupi (Victor Kuperfils)** | Grande maison isolée, plus bas dans le hameau | Charismatique, drôle, aime pas les douches (personne lui en veut), parents riches | PNJ hub — sa maison est le point de ralliement | Grande villa isolée |
| **Arthur Evenou** | Maison au bord du parcours Est (Rue des Bonnes Joies) | Petit rebelle, style rappeur, fume en cachette, un peu pyromane | PNJ missions nocturnes — missions dans les bois la nuit | Manor bord golf Est |
| **Louis Martin** | Grande maison Allée de la Lisière | Intello, ambiance bourgeois, grosse maison de famille | PNJ lore — connaît l'histoire du Prieuré, donne des indices | Manor Allée de la Lisière |

### PNJ SECONDAIRES
- **Alex Webb** (petit frère d'Oscar) — traîne dans les jambes
- **Martin** et **Vincent** (petits frères de Paul) — PNJ décor
- **Adultes / parents** — dans les maisons, donnent des missions corvées
- **Greenkeeper** — sur le golf, peut être un allié ou un ennemi selon les actions

---

## SYSTÈME DE JEU

### Progression (style GTA)
```
Réputation dans la bande → Accès à de nouvelles zones et missions
- 0 étoiles : nouveau, personne te connaît
- 1 étoile : Victor t'a validé
- 2 étoiles : t'as prouvé que tu joues au golf
- 3 étoiles : tu fais partie de la bande
- 4 étoiles : Paul te parle
- 5 étoiles : tu connais les secrets du Prieuré
```

### Missions principales (arc narratif)
1. **"Le Nouveau"** — Arriver dans le hameau, trouver Victor
2. **"Le Baptême du Golf"** — Terminer 9 trous avec Oscar (tutoriel golf)
3. **"La Nuit dans les Bois"** — Mission nocturne avec Arthur
4. **"Le Tournoi de Charles"** — Défi Pokémon / DBZ avec Charles
5. **"Le Secret du Prieuré"** — Découvrir pourquoi l'abbaye a une pièce interdite (Louis Martin sait)
6. **"La Fin de l'Été"** — Épilogue, BBQ général, tout le monde est là

### Missions annexes (exemples)
- Trouver les lunettes d'Antoine (cachées dans 5 endroits différents de la carte)
- Battre le record de score d'Oscar sur le trou 9
- Aider Margot à retrouver son chat dans les roughs
- Récupérer le caddie perdu du greenkeeper (dans le rough du 7)
- Surveiller le barbecue de Paul sans que ça brûle (mini-jeu timing)
- Trouver les 12 balles de golf vintage cachées sur toute la carte

### Collectibles
- **Balles de golf vintage** (12 total, cachées dans les roughs, sous les arbres)
- **Photos d'enfance** (8 total, débloquent des souvenirs/dialogues)
- **Capsules de bière** (6 total, monnaie d'échange avec certains PNJ)
- **Cartes Pokémon** (5 total, déblocable chez Charles contre services)

---

## MINI-JEU GOLF

### Mécanique (top-down)
```
1. Sélection du club (driver / fer / wedge / putter) → portée et précision différentes
2. Visée : rotation de la flèche de direction
3. Jauge de puissance : barre qui monte/descend, appuyer au bon moment
4. Modificateurs : vent (direction + force affichés), obstacles (arbres, bunkers, eau)
5. Score : par / bogey / birdie / eagle → affect la réputation
```

### Trous jouables
- Au minimum trous 1, 9, 18 du parcours Ouest pour la mission principale
- Tous les 18 trous du parcours Ouest déblocables progressivement
- Parcours Est débloqué après avoir fini l'arc Oscar

---

## STACK TECHNIQUE RECOMMANDÉE

### Option A — Navigateur pur (priorité)
```
- HTML5 Canvas (vanilla JS)
- Pas de dépendance externe obligatoire
- Tiled Map Editor pour les maps (.tmx → JSON)
- Spritesheet 16×16px style GBA
- LocalStorage pour la sauvegarde
```

### Option B — Phaser 3 (si besoin de plus de features)
```
- Phaser 3.60+
- Arcade Physics
- Tilemaps via Tiled
- Scene Manager pour les transitions
```

### Structure fichiers recommandée
```
prieure_rpg/
├── index.html          # Point d'entrée
├── src/
│   ├── main.js         # Init + game loop
│   ├── engine/
│   │   ├── tilemap.js  # Rendu tilemap
│   │   ├── camera.js   # Caméra + scroll
│   │   ├── player.js   # Déplacement joueur
│   │   ├── npc.js      # Système PNJ + dialogues
│   │   ├── collision.js
│   │   └── save.js     # LocalStorage
│   ├── scenes/
│   │   ├── world.js    # World map
│   │   ├── hamlet.js   # Zone hameau
│   │   ├── golf.js     # Zones golf
│   │   └── golf_minigame.js # Mini-jeu golf
│   ├── data/
│   │   ├── maps/       # JSON tilemaps
│   │   ├── dialogues.js
│   │   ├── missions.js
│   │   └── npcs.js
│   └── assets/
│       ├── sprites/    # Spritesheets 16×16
│       ├── tilesets/   # Tilesets GBA-style
│       └── sounds/     # Effets sonores
└── tools/
    ├── map_generator.html  # La world map SVG générée
    └── tileset_guide.md
```

---

## PALETTE COULEURS (GBA authentique)

```javascript
// Palette stricte 32 couleurs, style GBA
const GBA_PALETTE = {
  // Forêt
  forest_deep:    '#1e3810',
  forest_mid:     '#2e5020',
  forest_light:   '#3e6828',
  tree_top:       '#4e8c38',
  tree_bright:    '#60a848',
  // Terrain golf
  fairway:        '#78c045',
  fairway_light:  '#88d055',
  rough:          '#52902e',
  green_golf:     '#8ee450',
  sand:           '#e0d278',
  // Prairie hameau
  prairie:        '#a8d878',
  prairie_light:  '#bcea8c',
  lawn:           '#98cc68',
  // Eau
  water:          '#3080b8',
  water_light:    '#48a0d8',
  pool:           '#1868a0',
  // Chemins
  road:           '#ccc080',
  path:           '#b8a868',
  gravel:         '#b8b090',
  // Pierre (abbaye)
  stone:          '#c4a260',
  stone_dark:     '#8a6030',
  roof_brown:     '#722810',
  // Maisons
  villa_wall:     '#ddd0a5',
  villa_roof:     '#886038',
  manor_wall:     '#e8dcc0',
  manor_roof:     '#3a2858',
  // Divers
  skin:           '#f0c888',
  skin_dark:      '#d0a060',
  shirt_blue:     '#4060c0',
  pants_beige:    '#d0b878',
  black:          '#101010',
  white:          '#f8f8f8',
};
```

---

## SPRITES JOUEUR (Pierre Jungers)

### Style visuel
- Polo beige/écru (habillé à l'ancienne par sa mère)
- Short kaki ou beige
- Cheveux châtains, pas de style particulier
- Taille : sprite 16×20px (légèrement plus haut que large, style Pokémon)

### Animations requises
```
player_down_idle    (1 frame)
player_down_walk    (2 frames alternées)
player_up_idle      (1 frame)
player_up_walk      (2 frames)
player_left_idle    (1 frame)
player_left_walk    (2 frames)
player_right_idle   (1 frame — miroir du left)
player_right_walk   (2 frames — miroir)
player_golf_swing   (3 frames : adresse → backswing → impact)
```

---

## DIALOGUES — STYLE ET TON

### Règles absolues
- Pas de langage soutenu entre ados. Registre familier, naturel.
- Victor : direct, vacheries affectueuses, beaucoup d'ironie
- Charles : références DBZ/Pokémon intégrées dans toutes ses phrases
- Oscar : fautes de français systématiques ("j'ai pas comprendé", "c'est trop bon ce truc")
- Antoine : parle beaucoup, dit des choses intelligentes, s'excuse tout le temps
- Kupi : autodérision sur son manque d'hygiène, très drôle, jamais susceptible
- Paul : 1-2 mots max par réplique. "Ouais." "Nan." "Ch'sais pas."
- Louis : vocabulaire légèrement trop élaboré, conscient de son milieu social

### Format dialogues
```javascript
{
  npc: 'victor',
  trigger: 'first_meeting',
  lines: [
    { speaker: 'victor', text: "T'es qui toi ?" },
    { speaker: 'pierre', text: "..." },
    { speaker: 'victor', text: "T'es le nouveau de la maison Jungers ?" },
    { speaker: 'pierre', text: "Ouais." },
    { speaker: 'victor', text: "Tu joues au golf ?" },
    { speaker: 'pierre', text: "Mes parents m'obligent." },
    { speaker: 'victor', text: "Parfait. Viens avec nous demain matin. 8h au practice. T'es en retard, on part sans toi.", end: true }
  ]
}
```

---

## PRIORITÉS DE DÉVELOPPEMENT

### Phase 1 — Prototype jouable (MVP)
1. Engine tilemap avec camera follow
2. Déplacement joueur (4 directions, collisions)
3. Zone hameau complète (toutes les maisons, allées)
4. 3 PNJ avec dialogues (Victor, Oscar, Charles)
5. Transition vers zone golf

### Phase 2 — Cœur du jeu
6. Mini-jeu golf (trous 1, 9, 18)
7. Système de missions (3 missions principales)
8. Collectibles (balles de golf, 12 positions)
9. HUD (réputation, inventaire, carte)
10. Système de sauvegarde

### Phase 3 — Contenu complet
11. Tous les PNJ avec arcs complets
12. 18 trous jouables
13. Toutes les missions annexes
14. Sons et musique (style GBA, chip music)
15. Écran titre, crédits, épilogue

---

## NOTES IMPORTANTES POUR CLAUDE CODE

- **Ne jamais simplifier la géographie** : toutes les maisons du hameau doivent être représentées (~50 bâtiments)
- **Le golf doit être reconnaissable** : quelqu'un qui connaît le Prieuré doit reconnaître les trous
- **Les dialogues sont sacrés** : ils font le jeu. Prends le temps de les écrire avec le bon registre
- **La tilemap doit être gigantesque** : 10 minutes pour traverser la carte à pied = ~300×200 tiles min
- **Style pixel GBA strict** : pas de pixel sub-artisanal, pas d'antialiasing, palette limitée 32 couleurs
- **Tous les assets doivent être générés en code** (Canvas 2D) si pas de vrais sprites disponibles

---

## RESSOURCES FOURNIES DANS CE PACK

```
docs/
├── CLAUDE.md               # Ce fichier
├── game_design.md          # GDD complet
├── cast.md                 # Fiches personnages détaillées
├── map_notes.md            # Notes cartographie
└── dialogues_sample.md     # Exemples de dialogues

assets/
├── world_map.html          # Map SVG/Canvas interactive (reference)
├── cast_sheet.html         # Fiches persos interactives
└── palette_gba.json        # Palette couleurs

src/
├── engine_starter.js       # Moteur tilemap de base à compléter
└── data_starter.js         # Structures de données à remplir

tools/
└── tileset_builder.html    # Outil génération tileset en Canvas
```
