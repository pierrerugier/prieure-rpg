// ═══════════════════════════════════════════════════════════════
// LE PRIEURÉ RPG — DATA LAYER
// Toutes les données du jeu : PNJ, missions, dialogues, collectibles
// ═══════════════════════════════════════════════════════════════

// ── PERSONNAGES ──────────────────────────────────────────────
export const NPCS = {

  victor: {
    id: 'victor',
    name: 'Victor',
    fullname: 'Victor Lutreau',
    born: 1992,
    location: { map: 'hamlet', x: 145, y: 155 }, // allée des Fougères
    home: { map: 'hamlet', x: 145, y: 155 },
    sprite: 'npc_victor',
    // Victor est charismatique, agressif, drôle, meneur
    // Cherche toujours à dominer mais protège les siens
    personality: ['leader', 'aggressive', 'funny', 'loyal'],
    unlocksAt: 0, // disponible dès le début
    arcMissions: ['meet_victor', 'golf_baptism', 'prove_yourself'],
    defaultDialogue: 'victor_idle',
    roamingPattern: 'golf_morning_hamlet_afternoon',
  },

  charles: {
    id: 'charles',
    name: 'Charles',
    fullname: 'Charles Lutreau',
    born: 1989, // 4 ans de plus
    location: { map: 'hamlet', x: 148, y: 148 },
    home: { map: 'hamlet', x: 145, y: 155 }, // même maison que Victor
    sprite: 'npc_charles',
    personality: ['eternal_teen', 'dbz_fan', 'caïd', 'nostalgic'],
    unlocksAt: 1, // après avoir rencontré Victor
    arcMissions: ['charles_tournament', 'dbz_quiz', 'vintage_cards'],
    defaultDialogue: 'charles_idle',
    roamingPattern: 'lazy_hameau',
  },

  margot: {
    id: 'margot',
    name: 'Margot',
    fullname: 'Margot Lutreau',
    born: 1996,
    location: { map: 'hamlet', x: 142, y: 162 },
    home: { map: 'hamlet', x: 145, y: 155 },
    sprite: 'npc_margot',
    personality: ['bubbly', 'unpredictable', 'beloved', 'chaotic'],
    unlocksAt: 0,
    arcMissions: ['find_margots_cat', 'margot_treasure_hunt'],
    defaultDialogue: 'margot_idle',
    roamingPattern: 'everywhere_random',
  },

  oscar: {
    id: 'oscar',
    name: 'Oscar',
    fullname: 'Oscar Webb',
    born: 1993,
    location: { map: 'hamlet', x: 352, y: 82 }, // allée de la Lisière
    home: { map: 'hamlet', x: 352, y: 82 },
    sprite: 'npc_oscar',
    personality: ['bad_french', 'golf_pro', 'gentle', 'pierre_bestfriend'],
    flags: {
      mother_american: true,
      father_english: true,
      little_brother_alex: true,
      slightly_chubby: true,
    },
    unlocksAt: 0,
    arcMissions: ['golf_tutorial', 'beat_oscar_record', 'oscar_family_bbq'],
    defaultDialogue: 'oscar_idle',
    roamingPattern: 'golf_morning_pool_afternoon',
    // Oscar parle avec fautes de français systématiques
    speechPattern: 'bad_french',
  },

  antoine: {
    id: 'antoine',
    name: 'Antoine',
    fullname: 'Antoine Zirimirs',
    born: 1993,
    location: { map: 'hamlet', x: 148, y: 160 }, // chez les Lutreau par défaut
    home: null, // pas de maison sur la carte
    sprite: 'npc_antoine',
    personality: ['bespectacled', 'slightly_begging', 'very_kind', 'cultured', 'squatter'],
    flags: {
      glasses: true,
      sleeps_everywhere: true,
      parents_far_away: true,
    },
    unlocksAt: 1,
    arcMissions: ['find_antoine_glasses', 'antoine_night_sleepover'],
    defaultDialogue: 'antoine_idle',
    roamingPattern: 'follows_group',
    // Antoine dort dans différentes maisons — sa position change chaque jour in-game
    dynamicLocation: true,
  },

  paul: {
    id: 'paul',
    name: 'Paul',
    fullname: 'Paul',
    born: 1993,
    location: { map: 'hamlet', x: 80, y: 548 }, // allée des Hameaux
    home: { map: 'hamlet', x: 80, y: 548 },
    sprite: 'npc_paul',
    personality: ['tough', 'silent', 'trustworthy', 'protective'],
    flags: {
      brothers: ['martin', 'vincent'],
    },
    unlocksAt: 3, // se débloque tard — il faut mériter sa confiance
    arcMissions: ['earn_paul_trust', 'paul_woods_secret'],
    defaultDialogue: 'paul_idle',
    roamingPattern: 'local_hamlet',
  },

  kupi: {
    id: 'kupi',
    name: 'Kupi',
    fullname: 'Victor Kuperfils',
    born: 1992,
    location: { map: 'hamlet', x: 200, y: 555 },
    home: { map: 'hamlet', x: 200, y: 555 }, // grande maison isolée
    sprite: 'npc_kupi',
    personality: ['charismatic', 'funny', 'no_shower', 'rich', 'generous'],
    flags: {
      big_house: true,
      rich_parents: true,
      hygiene_issues: true, // running gag
    },
    unlocksAt: 1,
    arcMissions: ['kupis_house_party', 'kupi_dare'],
    defaultDialogue: 'kupi_idle',
    roamingPattern: 'mostly_home_and_pool',
    // La maison de Kupi est le hub de la bande
    isHangoutHub: true,
  },

  arthur: {
    id: 'arthur',
    name: 'Arthur',
    fullname: 'Arthur Evenou',
    born: 1993,
    location: { map: 'lisiere_est', x: 1660, y: 55 }, // bord parcours Est
    home: { map: 'lisiere_est', x: 1660, y: 55 },
    sprite: 'npc_arthur',
    personality: ['rebel', 'rapper_style', 'smoker', 'pyromaniac_light', 'brave'],
    flags: {
      smokes: true,
      has_lighter: true,
      knows_woods: true,
    },
    unlocksAt: 2,
    arcMissions: ['night_in_woods', 'arthurs_fire', 'secret_smoking_spot'],
    defaultDialogue: 'arthur_idle',
    roamingPattern: 'golf_edge_woods_night',
  },

  louis: {
    id: 'louis',
    name: 'Louis',
    fullname: 'Louis Martin',
    born: 1993,
    location: { map: 'hamlet', x: 368, y: 415 }, // grande maison lisière
    home: { map: 'hamlet', x: 368, y: 415 },
    sprite: 'npc_louis',
    personality: ['intellectual', 'bourgeois', 'knowledgeable', 'slightly_condescending', 'kind'],
    flags: {
      big_family_house: true,
      knows_history: true,
    },
    unlocksAt: 2,
    arcMissions: ['prieure_history', 'abbey_secret', 'louis_library'],
    defaultDialogue: 'louis_idle',
    roamingPattern: 'home_and_clubhouse',
  },

  // PNJ secondaires
  alex_webb: {
    id: 'alex_webb',
    name: 'Alex',
    fullname: 'Alex Webb',
    born: 1998,
    location: { map: 'hamlet', x: 358, y: 92 },
    sprite: 'npc_kid_generic',
    personality: ['little_brother', 'annoying_cute'],
    unlocksAt: 0,
    arcMissions: [],
    defaultDialogue: 'alex_idle',
  },

  martin_paul: {
    id: 'martin_paul', name: 'Martin', born: 1996,
    location: { map: 'hamlet', x: 44, y: 570 },
    sprite: 'npc_kid_generic', unlocksAt: 0, arcMissions: [],
    defaultDialogue: 'kid_generic',
  },

  vincent_paul: {
    id: 'vincent_paul', name: 'Vincent', born: 1998,
    location: { map: 'hamlet', x: 64, y: 598 },
    sprite: 'npc_kid_generic', unlocksAt: 0, arcMissions: [],
    defaultDialogue: 'kid_generic',
  },

  greenkeeper: {
    id: 'greenkeeper', name: 'Marcel', fullname: 'Marcel (greenkeeper)',
    born: 1958,
    location: { map: 'golf_ouest', x: 440, y: 548 },
    sprite: 'npc_greenkeeper',
    personality: ['grumpy', 'fair', 'passionate_about_grass'],
    unlocksAt: 1,
    arcMissions: ['find_lost_caddie', 'dont_walk_on_green'],
    defaultDialogue: 'greenkeeper_idle',
    roamingPattern: 'golf_all_day',
  },
};

// ── MISSIONS ─────────────────────────────────────────────────
export const MISSIONS = {

  // ── MISSIONS PRINCIPALES ──
  meet_victor: {
    id: 'meet_victor',
    type: 'main',
    title: 'Le Nouveau',
    description: 'Tu viens d\'arriver dans le hameau. Trouve Victor Lutreau.',
    chapter: 1,
    trigger: 'game_start',
    objectives: [
      { id: 'find_victor', text: 'Trouver Victor', type: 'talk_to', target: 'victor' },
    ],
    rewards: { reputation: 1, unlocks: ['golf_baptism', 'hamlet_free_roam'] },
    dialogue_key: 'meet_victor_sequence',
  },

  golf_baptism: {
    id: 'golf_baptism',
    type: 'main',
    title: 'Le Baptême du Golf',
    description: 'Victor t\'envoie jouer 9 trous avec Oscar. Survive.',
    chapter: 1,
    trigger: 'after:meet_victor',
    prerequisites: ['meet_victor'],
    objectives: [
      { id: 'find_oscar', text: 'Rejoindre Oscar au practice', type: 'reach', target: 'practice_zone' },
      { id: 'play_3holes', text: 'Jouer 3 trous (1, 2, 9)', type: 'golf_minigame', holes: [1,2,9], maxScore: 'bogey' },
      { id: 'talk_oscar_after', text: 'Parler à Oscar', type: 'talk_to', target: 'oscar' },
    ],
    rewards: { reputation: 1, unlocks: ['golf_ouest_full', 'oscar_missions'], item: 'golf_ball_vintage_1' },
    dialogue_key: 'golf_baptism_sequence',
  },

  night_in_woods: {
    id: 'night_in_woods',
    type: 'main',
    title: 'La Nuit dans les Bois',
    description: 'Arthur organise une expédition nocturne dans les bois derrière le trou 7. Rejoins-le à minuit.',
    chapter: 2,
    trigger: 'after:golf_baptism, reputation>=2',
    prerequisites: ['golf_baptism'],
    objectives: [
      { id: 'meet_arthur_night', text: 'Rejoindre Arthur derrière le trou 7 (la nuit)', type: 'reach', target: 'woods_secret_spot', timeConstraint: 'night' },
      { id: 'find_item_woods', text: 'Trouver l\'objet caché dans les bois', type: 'find_item', item: 'old_photo_3' },
      { id: 'dont_get_caught', text: 'Rentrer sans se faire attraper', type: 'stealth', failCondition: 'adult_sees_you' },
    ],
    rewards: { reputation: 1, unlocks: ['arthur_missions', 'woods_zone'], item: 'capsule_biere_1' },
    dialogue_key: 'night_woods_sequence',
  },

  charles_tournament: {
    id: 'charles_tournament',
    type: 'main',
    title: 'Le Tournoi de Charles',
    description: 'Charles organise un "championnat du monde" Pokémon dans sa chambre. Il faut participer.',
    chapter: 2,
    prerequisites: ['meet_victor'],
    objectives: [
      { id: 'find_pokemon_card', text: 'Trouver au moins une carte Pokémon', type: 'have_item', item: 'pokemon_card' },
      { id: 'beat_charles', text: 'Affronter Charles (jeu de cartes simplifié)', type: 'minigame', minigame: 'card_battle' },
    ],
    rewards: { reputation: 1, unlocks: ['charles_full_arc'], item: 'pokemon_card_rare' },
    dialogue_key: 'charles_tournament_sequence',
  },

  abbey_secret: {
    id: 'abbey_secret',
    type: 'main',
    title: 'Le Secret du Prieuré',
    description: 'Louis dit qu\'il y a une pièce de l\'abbaye que personne n\'a le droit de visiter. Découvre pourquoi.',
    chapter: 3,
    prerequisites: ['earn_paul_trust', 'louis_library'],
    objectives: [
      { id: 'get_info_louis', text: 'Obtenir les informations de Louis', type: 'talk_to', target: 'louis', dialogueState: 'reveal' },
      { id: 'find_key', text: 'Trouver la clé de la pièce interdite', type: 'find_item', item: 'old_key', hint: 'Quelqu\'un sait où elle est...' },
      { id: 'enter_room', text: 'Entrer dans la pièce (sans se faire voir)', type: 'reach', target: 'abbey_secret_room', stealth: true },
      { id: 'discover_secret', text: 'Découvrir le secret', type: 'cutscene', key: 'abbey_revelation' },
    ],
    rewards: { reputation: 2, unlocks: ['final_chapter'], item: 'prieure_photo_rare' },
    dialogue_key: 'abbey_secret_sequence',
  },

  final_bbq: {
    id: 'final_bbq',
    type: 'main',
    title: 'La Fin de l\'Été',
    description: 'Tout le monde se retrouve pour le grand barbecue de fin d\'été chez Kupi.',
    chapter: 4,
    prerequisites: ['abbey_secret'],
    objectives: [
      { id: 'invite_everyone', text: 'Prévenir toute la bande (8 personnes)', type: 'talk_to_all', targets: ['victor','charles','margot','oscar','antoine','paul','arthur','louis'] },
      { id: 'bbq_minigame', text: 'Gérer le barbecue sans tout brûler', type: 'minigame', minigame: 'bbq' },
      { id: 'final_scene', text: 'Profiter de la soirée', type: 'cutscene', key: 'final_summer' },
    ],
    rewards: { ending: true },
    dialogue_key: 'final_bbq_sequence',
  },

  // ── MISSIONS ANNEXES ──
  find_antoine_glasses: {
    id: 'find_antoine_glasses',
    type: 'side',
    title: 'Les Lunettes d\'Antoine',
    description: 'Antoine a encore perdu ses lunettes. Elles peuvent être n\'importe où dans le hameau.',
    trigger: 'talk_to:antoine, reputation>=1',
    objectives: [
      { id: 'find_glasses', text: 'Retrouver les lunettes d\'Antoine', type: 'find_item', item: 'antoine_glasses', randomLocation: true, possibleLocations: ['lutreau_garden', 'pool_edge', 'rough_7', 'abbey_terrace', 'kupi_garden'] },
    ],
    rewards: { item: 'merci_antoine_info', unlocks: ['antoine_encyclopedia'] },
    repeatable: true,
  },

  beat_oscar_golf: {
    id: 'beat_oscar_golf',
    type: 'side',
    title: 'Battre le Record d\'Oscar',
    description: 'Oscar détient le record du trou 9 parmi la bande : -1 (birdie). Fais mieux.',
    trigger: 'reputation>=2',
    objectives: [
      { id: 'birdie_hole9', text: 'Faire birdie ou eagle au trou 9', type: 'golf_score', hole: 9, maxScore: -1 },
    ],
    rewards: { reputation: 1, item: 'balle_golf_vintage_9', dialogue: 'oscar_impressed' },
  },

  find_margots_cat: {
    id: 'find_margots_cat',
    type: 'side',
    title: 'Le Chat de Margot',
    description: 'Margot a perdu Bisou dans les roughs. Il faudra fouiller.',
    trigger: 'talk_to:margot, after:meet_victor',
    objectives: [
      { id: 'find_cat', text: 'Trouver Bisou le chat (dans les roughs)', type: 'find_item', item: 'margot_cat', location: 'rough_zone' },
      { id: 'return_cat', text: 'Ramener Bisou à Margot', type: 'return_item', target: 'margot' },
    ],
    rewards: { reputation: 0.5, dialogue: 'margot_grateful' },
  },

  lost_caddie: {
    id: 'lost_caddie',
    type: 'side',
    title: 'Le Caddie de Marcel',
    description: 'Marcel le greenkeeper a perdu un caddie dans le rough du trou 7. Il propose une récompense.',
    trigger: 'talk_to:greenkeeper',
    objectives: [
      { id: 'find_caddie', text: 'Trouver le caddie dans le rough 7', type: 'find_item', item: 'golf_caddie', location: 'rough_7' },
      { id: 'return_caddie', text: 'Rapporter le caddie à Marcel', type: 'return_item', target: 'greenkeeper' },
    ],
    rewards: { item: 'golf_pass_practice', dialogue: 'greenkeeper_softened' },
  },

  earn_paul_trust: {
    id: 'earn_paul_trust',
    type: 'side',
    title: 'La Confiance de Paul',
    description: 'Paul ne parle pas aux inconnus. Pour qu\'il t\'accepte, il faut d\'abord prouver quelque chose.',
    trigger: 'reputation>=3',
    objectives: [
      { id: 'par_on_hard_hole', text: 'Faire par ou mieux sur le trou 6 (le plus dur)', type: 'golf_score', hole: 6, maxScore: 0 },
      { id: 'paul_nods', text: 'Paul acquiesce', type: 'cutscene', key: 'paul_nod' },
    ],
    rewards: { unlocks: ['paul_arc', 'woods_secret'], reputation: 1 },
  },
};

// ── COLLECTIBLES ─────────────────────────────────────────────
export const COLLECTIBLES = {

  golf_balls: {
    type: 'golf_ball_vintage',
    total: 12,
    description: 'Balles de golf vintage des années 80-90, perdues dans les roughs depuis des lustres.',
    reward_all: 'charles_special_card',
    items: [
      { id: 'ball_1',  location: 'rough_hole_3',      hint: 'Dans les fougères derrière le green du 3' },
      { id: 'ball_2',  location: 'rough_hole_7_deep', hint: 'Très loin dans le rough gauche du 7' },
      { id: 'ball_3',  location: 'pool_edge',         hint: 'Tombée dans les plantes autour de la piscine' },
      { id: 'ball_4',  location: 'abbey_garden',      hint: 'Dans le jardin de l\'abbaye, sous un buisson' },
      { id: 'ball_5',  location: 'woods_secret',      hint: 'Dans les bois derrière le trou 7 (zone nuit)' },
      { id: 'ball_6',  location: 'lutreau_garden',    hint: 'Dans le jardin des Lutreau' },
      { id: 'ball_7',  location: 'rough_hole_12',     hint: 'Parcours Est, rough profond du 12' },
      { id: 'ball_8',  location: 'rough_hole_15_est', hint: 'Derrière les arbres du 15 Est' },
      { id: 'ball_9',  location: 'practice_edge',     hint: 'À côté du practice, dans les herbes' },
      { id: 'ball_10', location: 'road_d130_edge',    hint: 'Près du portail d\'entrée, côté route' },
      { id: 'ball_11', location: 'kupi_hedge',        hint: 'Coincée dans la haie de Kupi' },
      { id: 'ball_12', location: 'abbey_clocher',     hint: 'Impossible. Ou peut-être pas.' },
    ],
  },

  old_photos: {
    type: 'photo_souvenir',
    total: 8,
    description: 'Photos d\'été trouvées dans le hameau. Chacune débloque un souvenir.',
    items: [
      { id: 'photo_1', location: 'lutreau_attic',   memory: 'L\'été 2001, Victor et Charles ont essayé de construire une cabane. Elle a tenu 3 heures.' },
      { id: 'photo_2', location: 'pool_storage',    memory: 'Oscar a sauté du plongeoir les yeux fermés. Il a pas raté la piscine, mais c\'était moins une.' },
      { id: 'photo_3', location: 'woods_secret',    memory: 'La photo d\'une nuit dans les bois. Tout le monde a l\'air épuisé mais souriant.' },
      { id: 'photo_4', location: 'abbey_corridor',  memory: 'L\'abbaye la nuit, vue depuis le jardin. Prise en douce.' },
      { id: 'photo_5', location: 'kupi_cellar',     memory: 'Un barbecue chez Kupi. On compte au moins 12 personnes.' },
      { id: 'photo_6', location: 'martin_library',  memory: 'Louis devant sa bibliothèque. Il tient un livre de l\'histoire du Prieuré.' },
      { id: 'photo_7', location: 'rough_hole_18',   memory: 'Quelqu\'un a pris la photo depuis le green du 18. Vue magnifique sur l\'abbaye.' },
      { id: 'photo_8', location: 'jungers_garden',  memory: 'Ta maison. L\'été de ton arrivée. Tu as l\'air perdu mais tu souris quand même.' },
    ],
  },

  beer_caps: {
    type: 'capsule_biere',
    total: 6,
    description: 'Capsules de bière ramassées par la bande. Monnaie d\'échange.',
    items: [
      { id: 'cap_1', location: 'woods_secret' },
      { id: 'cap_2', location: 'abbaye_terrace' },
      { id: 'cap_3', location: 'rough_hole_6' },
      { id: 'cap_4', location: 'kupi_garden' },
      { id: 'cap_5', location: 'tennis_edge' },
      { id: 'cap_6', location: 'pond_est_edge' },
    ],
  },

  pokemon_cards: {
    type: 'pokemon_card',
    total: 5,
    description: 'Cartes Pokémon que Charles a semées partout. Il est prêt à tout pour les récupérer.',
    items: [
      { id: 'card_1', name: 'Dracaufeu',  location: 'charles_room',   value: 'high' },
      { id: 'card_2', name: 'Mewtwo',    location: 'abbey_cloister',  value: 'highest' },
      { id: 'card_3', name: 'Pikachu',   location: 'pool_changing',   value: 'medium' },
      { id: 'card_4', name: 'Ronflex',   location: 'kupi_sofa',       value: 'medium' },
      { id: 'card_5', name: 'Magicarpe', location: 'pond_est',        value: 'low', joke: true },
    ],
  },
};

// ── DIALOGUES ────────────────────────────────────────────────
export const DIALOGUES = {

  meet_victor_sequence: [
    { speaker: 'victor', face: 'neutral', text: "T'es qui toi ?" },
    { speaker: 'pierre', face: 'shy',     text: "..." },
    { speaker: 'victor', face: 'squint',  text: "T'es le nouveau de la maison Jungers ?" },
    { speaker: 'pierre', face: 'nod',     text: "Ouais." },
    { speaker: 'victor', face: 'assess',  text: "Tu joues au golf ?" },
    { speaker: 'pierre', face: 'grimace', text: "Mes parents m'obligent." },
    { speaker: 'victor', face: 'smirk',   text: "Parfait. Demain matin 8h au practice. T'es en retard, on part sans toi." },
    { speaker: 'pierre', face: 'question',text: "C'est qui «on» ?" },
    { speaker: 'victor', face: 'shrug',   text: "Tu verras.", end: true },
  ],

  victor_idle: [
    ["Toujours là à traîner ?", "Le golf c'est tôt le matin ou ça compte pas."],
    ["T'as vu Charles ? Il est encore en train de lire ses mangas au lieu de jouer."],
    ["Oscar dit que t'es pas trop mauvais au golf. C'est un compliment de sa part."],
    ["Margot cherche encore son chat. N'y pense même pas, ça finit toujours bien."],
  ],

  charles_idle: [
    ["Moi j'ai rien à prouver, j'ai déjà l'âge adulte."],
    ["T'as déjà vu Dragon Ball Z ? Non ? Ça explique beaucoup de choses."],
    ["Victor m'a dit que t'étais correct. Pour lui c'est un compliment."],
    ["J'ai encore toutes mes cartes. Enfin... presque toutes."],
  ],

  oscar_idle: [
    // Oscar avec fautes de français systématiques
    ["Ah salut ! J'ai joué le trou neuf ce matin, j'ai faisé birdie !"],
    ["Tu savais que en anglais on dit 'rough' pour le rough ? C'est pareil !"],
    ["Ma mère elle comprendait pas pourquoi les greens sont verts. Je lui ai expliqué mais je crois qu'elle a pas comprendé."],
    ["Alex m'a suivé jusqu'au trou 12 ce matin. J'ai perdu deux balles à cause de lui."],
  ],

  antoine_idle: [
    // Antoine parle beaucoup, s'excuse tout le temps
    ["Euh, excuse-moi, c'est peut-être pas la bonne question, mais... t'as pas vu mes lunettes ?"],
    ["Hier soir j'ai dormi chez les Lutreau, enfin dans leur couloir en fait, mais c'était très bien, très confortable."],
    ["Je pensais à quelque chose d'intéressant. Enfin peut-être pas intéressant pour tout le monde, mais pour moi..."],
    ["Figurez-vous que l'abbaye a été fondée au XIIe siècle. Enfin ça a l'air évident avec l'architecture, mais quand même."],
  ],

  paul_idle: [
    // Paul : 1-2 mots max
    ["Ouais."],
    ["Nan."],
    ["Ch'sais pas."],
    ["..."],
    ["Bien."],
  ],

  kupi_idle: [
    ["Viens ! J'ai demandé à ma mère de faire des pizzas pour tout le monde."],
    ["Ouais j'ai pas pris de douche depuis trois jours. Et alors ?"],
    ["Ma maison c'est la maison de tout le monde. Enfin sauf les adultes."],
    ["J'ai trouvé une balle de golf derrière ma haie. C'est la vôtre ?"],
  ],

  arthur_idle: [
    ["Ce soir, bois derrière le 7. T'as le droit de pas venir."],
    ["J'ai un briquet. Juste pour allumer des trucs légaux."],
    ["Les adultes ils croient qu'on fait rien dans les bois. C'est bien."],
    ["Le rough du 6 de nuit c'est une autre planète."],
  ],

  louis_idle: [
    ["L'abbaye date du XIIe siècle. La plupart des gens ne savent pas que les bâtiments actuels..."],
    ["Je t'expliquerai un jour pourquoi il y a une aile de l'abbaye qui n'est jamais ouverte."],
    ["Victor est quelqu'un de bien. Il le montre juste pas."],
    ["J'ai une théorie sur le trou 12 Est. Architecturalement, il est impossible à faire en par."],
  ],

  greenkeeper_idle: [
    ["Si je vous attrape sur le green avec vos vélos, je vous embête jusqu'à la fin de l'été."],
    ["Ce golf c'est le plus beau des Yvelines. Traitez-le bien."],
    ["Vous avez vu un caddie avec une roue cassée quelque part ?"],
    ["Les balles dans le rough c'est pour moi. C'est la règle."],
  ],

  // ── DIALOGUES D'AMBIANCE (pools : une réplique au hasard à chaque fois) ──
  victor_greet: [
    ["Tiens, le nouveau. T'es encore là, toi ?"],
    ["Le hameau, c'est à nous. Mais on partage. Un peu."],
    ["T'as joué au golf ce matin ? Non ? Alors t'as rien fait de ta journée."],
    ["Charles dit qu'il est adulte. Charles dit beaucoup de bêtises."],
    ["Si tu veux traîner avec nous, faut pas être une chochotte. C'est la seule règle."],
    ["Mon père veut que je sois ingénieur. Moi je veux être tranquille."],
    ["T'as vu Paul ? Quand il te parle, c'est que t'as fait tes preuves."],
    ["L'été dernier on a construit une cabane. Elle a tenu trois heures. Record."],
    ["Oscar joue mieux que nous tous. Ça m'énerve, mais c'est comme ça."],
    ["Arrête de me suivre comme un caneton. Enfin... reste pas trop loin non plus."],
    ["Ce soir, feu de camp dans les bois. T'es pas obligé de venir. Mais viens."],
    ["Kupi a encore oublié de se laver. On fait avec. On l'aime quand même."],
    ["Tu trouves que je suis dur ? Attends de connaître mon frère."],
    ["Le greenkeeper me déteste. C'est réciproque et c'est très sain."],
    ["Margot a perdu son chat. Encore. Ne t'en mêle pas, ça finit toujours en catastrophe."],
    ["On est les rois de ce golf. Les adultes croient que c'est à eux. Mignons."],
    ["T'es de quelle maison déjà ? Ah ouais, les Jungers. Ça peut aller."],
    ["Si tu fais un birdie au 9, je te paie une glace. J'ai dit SI."],
    ["Les vacances, c'est pas fait pour dormir. Debout à 8h, comme tout le monde."],
    ["Antoine a encore dormi dans notre couloir. Un jour il dormira dans le frigo."],
    ["T'inquiète, je fais le dur, mais je laisse personne de la bande tout seul."],
  ],
  charles_greet: [
    ["Moi j'ai déjà l'âge adulte, je te signale. 89, mon pote."],
    ["Tu connais Dragon Ball Z ? Non ? Ça explique beaucoup de choses sur toi."],
    ["J'ai toutes les cartes Pokémon. Enfin... presque. Il m'en manque une. Une seule."],
    ["Un vrai guerrier ne pleure pas quand il perd au golf. Il s'entraîne en secret."],
    ["Victor croit qu'il est le chef. Mais c'est moi le plus vieux. Donc le plus sage."],
    ["Mon niveau de puissance ? Tu pourrais pas comprendre, c'est OVER 9000."],
    ["J'ai un Dracaufeu première édition. Je le montre à personne. Sauf si t'insistes."],
    ["Le secret pour gagner, c'est la concentration. Et un peu de triche."],
    ["Je fais le caïd, mais en vrai j'ai peur des guêpes. Dis-le à personne."],
    ["Quand je serai grand, j'ouvre un magasin de mangas. Ou je dors. On verra."],
    ["T'as déjà fait une fusion ? Avec Antoine on a essayé. Ça a pas marché."],
    ["Margot m'a battu aux cartes. Une fois. On n'en parle plus jamais."],
    ["Les adultes comprennent rien à la stratégie. Moi je pense en trois coups d'avance."],
    ["Si tu trouves une carte Pokémon sur le golf, elle est à moi. Présomption de propriété."],
    ["Mon frère a 4 ans de moins, mais des fois je me demande qui est le plus mûr."],
    ["J'ai vu tous les épisodes. TOUS. Demande-moi n'importe quoi."],
    ["Le golf c'est comme un combat de tournoi : faut sentir l'énergie du parcours."],
    ["Un jour j'aurai une collection si grande qu'on viendra de Rambouillet la voir."],
    ["T'es niveau débutant. Pas de honte. Moi aussi j'ai commencé. En 89."],
    ["On organise un championnat dans ma chambre. Règles maison. C'est-à-dire mes règles."],
  ],
  margot_greet: [
    ["T'as pas vu Bisou ? Mon chat ! Il est ENCORE parti !"],
    ["Tu veux jouer ? Allez on joue ! À quoi ? On verra après !"],
    ["J'ai trouvé un trèfle à quatre feuilles. Puis je l'ai mangé. C'était pas bon."],
    ["Mes frères disent que je suis chaotique. Je sais même pas ce que ça veut dire. Cool non ?"],
    ["On fait une cabane ? Une mare ? Un spectacle ? LES TROIS ?"],
    ["Bisou se cache toujours dans les roughs. C'est un chat de golf, lui."],
    ["J'ai mis des paillettes partout dans la chambre de Charles. Il le sait pas encore."],
    ["Tu cours vite ? Moi super vite ! Enfin sauf quand je tombe. Je tombe souvent."],
    ["Le greenkeeper m'a fait un clin d'œil une fois. Je crois qu'on est meilleurs amis."],
    ["J'ai donné des noms à tous les arbres de l'allée. Lui c'est Gérard."],
    ["Si tu trouves Bisou, tu auras une récompense. Genre un câlin. Ou un caillou. Au choix."],
    ["Maman dit que j'ai trop d'énergie. Je crois que les autres en ont pas assez."],
    ["On a le droit d'aller dans l'étang ? Non ? Bon. ... On y va ?"],
    ["J'ai vu un écureuil. Je l'ai suivi. Je me suis perdue. C'était une super journée."],
    ["Victor fait le méchant mais il m'a porté sur ses épaules au feu de camp."],
    ["Tu sais siffler ? Apprends-moi ! Non attends, apprends-moi à faire des bulles d'abord."],
    ["J'ai caché un trésor quelque part. J'ai oublié où. C'est ça le mystère !"],
    ["Antoine connaît plein de trucs. Moi je connais où sont les meilleures flaques."],
    ["On fait la course jusqu'à l'abbaye ? Le dernier est une chaussette !"],
    ["Bisou ! BISOU ! ... Pardon. Tu disais ?"],
  ],
  antoine_greet: [
    ["Oh, euh, salut ! Désolé, je squatte chez les Lutreau en ce moment."],
    ["Tu savais que l'abbaye date du XIIᵉ siècle ? Enfin, ça se voit, mais bon."],
    ["Excuse-moi de te déranger... ou c'est toi qui... enfin, bonjour."],
    ["J'ai lu que les greens étaient inventés en Écosse. Fascinant, non ? Non ? D'accord."],
    ["Hier j'ai dormi chez Kupi. Enfin, sur le canapé. Enfin, par terre. C'était très bien."],
    ["Je peux te raconter l'histoire du Prieuré ? Ça prend juste... deux ou trois heures."],
    ["Pardon, j'ai encore perdu mes lunettes. Tu es bien... toi, non ? Tant mieux."],
    ["Les arbres ici sont des chênes pédonculés, je crois. Ou des charmes. Je m'excuse."],
    ["Victor dit que je parle trop. Il a raison. Désolé. Je continue ?"],
    ["Saviez-vous que le golf compte 18 trous pour une raison purement historique ? Enfin..."],
    ["Je dors un peu partout, oui. Mes parents habitent loin. C'est pas grave, hein."],
    ["J'ai calculé le périmètre du parcours. Approximativement. Ça m'a détendu."],
    ["Oscar fait des fautes adorables. Je n'ose pas le corriger. Ce serait malpoli."],
    ["L'étang abrite des tritons, je pense. Ne le répète pas, ils sont protégés."],
    ["Si tu as une question sur n'importe quoi, demande. Vraiment. J'adore ça. Désolé."],
    ["Le mot 'prieuré' vient du latin 'prior'. Le supérieur. Voilà. Pardon."],
    ["Je crois que j'ai oublié mon cartable. Et mon pull. Et l'heure. Mais ça va !"],
    ["Margot m'a nommé 'ministre du savoir'. C'est le plus beau jour de ma vie."],
    ["Paul ne parle pas beaucoup. Du coup je parle pour deux. C'est un bon arrangement."],
    ["Je m'excuse d'avance, mais je vais probablement te resaluer dans cinq minutes."],
  ],
  oscar_greet: [
    ["Ah salut ! Ce matin j'ai faisé un birdie, c'était trop bien !"],
    ["Ma mère elle a pas comprendé le golf. Moi si."],
    ["Tu veux que je t'apprende ? Je suis très bon professeur, normalement."],
    ["En Angleterre mon père il dit 'fore'. Ici je dis 'attention' mais personne écoute."],
    ["J'ai mangé trois croissants. Pour le golf il faut de l'énergie, c'est scientifique."],
    ["La première fois j'ai tapé trois fois dans l'herbe. Maintenant regarde-moi !"],
    ["Victor il dit que je joue bien. De lui, c'est un très gros compliment, je crois."],
    ["Mon petit frère Alex il me suit partout. C'est mignon mais je perds des balles."],
    ["Le trou 9 c'est mon préféré. J'ai le record. Personne peut le battre. Toi non plus."],
    ["Comment on dit 'rough' en français ? ... 'rough'. C'est pareil ! Trop pratique."],
    ["Je suis un peu gros mais je cours vite quand il y a un goûter."],
    ["Ma mère elle est américaine, mon père anglais, et moi je suis... du golf."],
    ["Si tu rates, c'est pas grave. Moi je rate aussi. Mais moins que toi pour l'instant."],
    ["J'ai bien dormé cette nuit, donc aujourd'hui je vais faire un eagle, tu vas voir."],
    ["Le secret du putting ? Tu regardes le trou et tu y crois très fort. Magie."],
    ["Antoine il me corrige jamais. C'est mon ami préféré pour ça."],
    ["Quand je gagne, je fais pas le malin. Bon, un petit peu. Mais gentiment."],
    ["Tu sens le vent ? Non ? Moi je le sens. C'est un don, ma mère dit."],
    ["On va jouer ensemble ? Je te laisse gagner un trou. Un seul. Pour t'encourager."],
    ["J'ai perdu deux balles dans l'étang. Elles nagent maintenant, je suppose."],
  ],
  louis_greet: [
    ["Bonjour. Cette demeure appartient à ma famille depuis trois générations."],
    ["Si l'histoire du Prieuré t'intéresse, sache que je suis intarissable."],
    ["L'abbaye possède une aile que l'on n'ouvre jamais. Cela m'a toujours intrigué."],
    ["Le mobilier de notre salon date du Second Empire. Mon père y tient énormément."],
    ["J'ai une théorie : le trou 12 du parcours Est est architecturalement impossible en par."],
    ["Victor est un garçon estimable. Il le dissimule sous une rudesse de façade."],
    ["On me dit condescendant. Je préfère 'précis dans mon vocabulaire'."],
    ["Ma bibliothèque compte un ouvrage du XVIIᵉ sur l'ordre qui fonda ce prieuré."],
    ["Le greenkeeper, Marcel, connaît ce parcours mieux que quiconque. Respecte-le."],
    ["Mon arrière-grand-père a joué ici avec un ministre. Une anecdote familiale, certes."],
    ["Je ne joue pas particulièrement bien. Mais je comprends le jeu, ce qui est supérieur."],
    ["Le terme 'links' désigne à l'origine un golf en bord de mer. Nous, hélas, sommes en forêt."],
    ["Antoine et moi pourrions débattre des heures. Nous le faisons, d'ailleurs."],
    ["Cette région recèle des vestiges médiévaux insoupçonnés. J'enquête, modestement."],
    ["Père dit que la noblesse oblige. Je trouve surtout qu'elle ennuie, parfois."],
    ["Si tu cherches la pièce interdite de l'abbaye, commence par me poser les bonnes questions."],
    ["Kupi est d'une compagnie rafraîchissante. Et olfactivement mémorable."],
    ["Je collectionne les cartes anciennes du domaine. La cartographie est un art."],
    ["On hérite d'une maison, d'un nom, et d'une certaine solitude. Mais passons."],
    ["Reviens me voir quand tu auras prouvé ta valeur. Je te confierai un secret du Prieuré."],
  ],
  kupi_greet: [
    ["Viens chez moi ! Ma mère fait des pizzas pour tout le monde."],
    ["Ouais, j'ai pas pris de douche depuis trois jours. Et alors ?"],
    ["Ma maison c'est la maison de tout le monde. Sauf les adultes. Eux ils sonnent."],
    ["J'ai trouvé une balle de golf dans ma haie. Si c'est la tienne... bah c'est la mienne maintenant."],
    ["On dit que je sens pas bon. C'est faux. Je sens l'aventure."],
    ["Mes parents sont riches mais moi je suis surtout généreux. Nuance importante."],
    ["Tu veux dormir chez moi ? Y a de la place. Antoine a déjà réservé le couloir."],
    ["J'ai une console, un baby-foot, et zéro règle. C'est le paradis, viens."],
    ["Le secret d'une bonne bande, c'est un bon QG. Et mon QG est imbattable."],
    ["Je me lave les dents. Des fois. Quand j'y pense. Donc rarement. Mais quand même."],
    ["Victor râle que je tâche le canapé. Le canapé est à moi, je tâche ce que je veux."],
    ["Si t'as faim, viens. Si t'as soif, viens. Si t'as rien, viens quand même."],
    ["J'ai un chien imaginaire. Il s'appelle Pizza. Il est très propre, lui."],
    ["Margot a mis des paillettes chez moi. Maintenant je brille. Je trouve ça classe."],
    ["On fait une fête ? Chez moi, évidemment. C'est toujours chez moi. J'adore ça."],
    ["Les gens me trouvent drôle. Je trouve ça normal, je fais des efforts zéro."],
    ["J'ai jamais perdu une partie de cache-cache. Astuce : je sens fort, on me trouve... ah."],
    ["Tu veux une capsule de bière pour ta collection ? J'en ai un saladier."],
    ["Paul vient chez moi en silence, mange, et repart. Le client idéal."],
    ["Bienvenue dans la bande. Premier réflexe : viens manger chez moi."],
  ],
  paul_greet: [
    ["Ouais."],
    ["Nan."],
    ["Ch'ais pas."],
    ["..."],
    ["Bien."],
    ["Hm."],
    ["Plus tard."],
    ["Ça va."],
    ["Mes frères. Là-bas."],
    ["Occupé."],
    ["Si tu veux."],
    ["Pas mal."],
    ["Le 6 est dur."],
    ["On verra."],
    ["Fais voir."],
    ["Correct."],
    ["Suis-moi."],
    ["Plus fort que ça."],
    ["T'es prêt ?"],
    ["...Pas mal, le nouveau."],
  ],

  // Séquence tutoriel golf avec Oscar
  golf_baptism_sequence: [
    { speaker: 'oscar',  text: "Bon, je t'explique. C'est très simple." },
    { speaker: 'pierre', text: "Ça a l'air compliqué." },
    { speaker: 'oscar',  text: "Non mais vraiment. Tu vises, tu tappes, la balle elle vole. Comme ça !" },
    { speaker: 'pierre', text: "Et si je la rate ?" },
    { speaker: 'oscar',  text: "T'inquiète. La première fois que j'ai joué, j'ai tapé trois fois dans le gazon avant de toucher la balle. Et maintenant regarde-moi." },
    { speaker: 'pierre', text: "Victor t'a dit comment je joue ?" },
    { speaker: 'oscar',  text: "Il a dit : «Il sait pas jouer.» Mais il a dit ça de tout le monde au début.", end: true },
    { type: 'transition', to: 'golf_minigame', hole: 1 },
  ],
};

// ── WORLD MAP — POSITIONS DES ZONES ─────────────────────────
export const MAP_ZONES = {
  hamlet:         { x: 20,   y: 20,   w: 430,  h: 640,  label: 'Hameau du Prieuré' },
  golf_ouest:     { x: 490,  y: 20,   w: 860,  h: 1680, label: 'Parcours Ouest' },
  golf_est:       { x: 1420, y: 20,   w: 860,  h: 1680, label: 'Parcours Est' },
  clubhouse:      { x: 1000, y: 800,  w: 450,  h: 400,  label: 'Club-House — Abbaye' },
  pool_area:      { x: 1260, y: 690,  w: 280,  h: 200,  label: 'Piscine' },
  practice:       { x: 1000, y: 620,  w: 280,  h: 100,  label: 'Practice' },
  tennis:         { x: 1000, y: 1060, w: 140,  h: 100,  label: 'Tennis' },
  parking:        { x: 1268, y: 912,  w: 210,  h: 150,  label: 'Parking' },
  woods_secret:   { x: 680,  y: 780,  w: 120,  h: 120,  label: 'Les Bois Secrets', hidden: true },
  abbey_secret:   { x: 1080, y: 920,  w: 80,   h: 80,   label: 'Pièce Interdite', hidden: true, locked: true },
  road_d130:      { x: 0,    y: 1700, w: 2560, h: 80,   label: 'Route D130' },
};

// ── GOLF — DONNÉES DES TROUS ─────────────────────────────────
export const GOLF_HOLES = {
  ouest: [
    { n:1,  par:4, yards:385, difficulty:'medium', bunkers:2, water:false },
    { n:2,  par:3, yards:165, difficulty:'easy',   bunkers:2, water:false },
    { n:3,  par:4, yards:355, difficulty:'medium', bunkers:2, water:false },
    { n:4,  par:5, yards:510, difficulty:'hard',   bunkers:2, water:false, signature:true, note:'Long dogleg gauche, signature du parcours Ouest' },
    { n:5,  par:3, yards:145, difficulty:'easy',   bunkers:1, water:false },
    { n:6,  par:5, yards:490, difficulty:'hard',   bunkers:2, water:false },
    { n:7,  par:4, yards:400, difficulty:'hard',   bunkers:2, water:false, note:'Extrême gauche, bois des deux côtés' },
    { n:8,  par:4, yards:360, difficulty:'medium', bunkers:2, water:false },
    { n:9,  par:4, yards:375, difficulty:'medium', bunkers:2, water:false },
    { n:10, par:4, yards:380, difficulty:'medium', bunkers:1, water:false },
    { n:11, par:3, yards:175, difficulty:'medium', bunkers:2, water:false },
    { n:12, par:4, yards:365, difficulty:'medium', bunkers:1, water:false },
    { n:13, par:5, yards:520, difficulty:'hard',   bunkers:2, water:false },
    { n:14, par:4, yards:370, difficulty:'easy',   bunkers:2, water:false },
    { n:15, par:3, yards:155, difficulty:'easy',   bunkers:1, water:false },
    { n:16, par:5, yards:495, difficulty:'medium', bunkers:1, water:false },
    { n:17, par:4, yards:345, difficulty:'medium', bunkers:1, water:false },
    { n:18, par:4, yards:410, difficulty:'medium', bunkers:2, water:false, note:'Retour vers l\'abbaye, vue magnifique' },
  ],
  est: [
    { n:1,  par:4, yards:380, difficulty:'medium', bunkers:2, water:false },
    { n:2,  par:5, yards:500, difficulty:'medium', bunkers:1, water:true, note:'Étang visible depuis le tee' },
    { n:3,  par:4, yards:395, difficulty:'hard',   bunkers:2, water:false },
    { n:4,  par:3, yards:180, difficulty:'medium', bunkers:1, water:false },
    { n:5,  par:4, yards:360, difficulty:'easy',   bunkers:2, water:false },
    { n:6,  par:3, yards:150, difficulty:'easy',   bunkers:1, water:false },
    { n:7,  par:5, yards:505, difficulty:'hard',   bunkers:2, water:false },
    { n:8,  par:4, yards:375, difficulty:'medium', bunkers:2, water:false },
    { n:9,  par:4, yards:385, difficulty:'medium', bunkers:1, water:false },
    { n:10, par:4, yards:370, difficulty:'medium', bunkers:2, water:false },
    { n:11, par:5, yards:510, difficulty:'hard',   bunkers:2, water:false },
    { n:12, par:4, yards:360, difficulty:'medium', bunkers:1, water:false, note:'Louis dit qu\'il est impossible à faire en par. Il a tort.' },
    { n:13, par:4, yards:380, difficulty:'medium', bunkers:2, water:false },
    { n:14, par:3, yards:165, difficulty:'easy',   bunkers:1, water:false },
    { n:15, par:5, yards:490, difficulty:'hard',   bunkers:2, water:false },
    { n:16, par:4, yards:350, difficulty:'medium', bunkers:1, water:false },
    { n:17, par:4, yards:365, difficulty:'medium', bunkers:2, water:false },
    { n:18, par:5, yards:520, difficulty:'hard',   bunkers:2, water:false },
  ],
};

// ── SAUVEGARDE — Structure de données ────────────────────────
export const SAVE_TEMPLATE = {
  version: '1.0',
  player: {
    name: 'Pierre',
    reputation: 0,
    position: { map: 'hamlet', x: 186, y: 325 },
    inventory: [],
    flags: {},
  },
  missions: {
    active: ['meet_victor'],
    completed: [],
    failed: [],
  },
  collectibles: {
    golf_balls: [],
    old_photos: [],
    beer_caps: [],
    pokemon_cards: [],
  },
  npc_states: {},
  world: {
    time: 'morning',   // morning / afternoon / evening / night
    day: 1,
    season: 'summer',
  },
  golf: {
    scores: {},        // { 'ouest_1': -1, 'ouest_9': 0, ... }
    best_scores: {},
  },
};
