// ═══════════════════════════════════════════════════════════════
// LES 5 PREMIÈRES MISSIONS — enchaînées, jouables (parler / atteindre).
// objectif.type : 'talk' (un PNJ) | 'talkAll' (plusieurs) | 'reach' (zone)
// ═══════════════════════════════════════════════════════════════
export const QUESTS = [
  {
    id: 'le_nouveau',
    title: 'Le Nouveau',
    intro: "Tu viens d'arriver au Prieuré. Va te présenter à Victor.",
    objectives: [{ type: 'talk', target: 'victor', text: 'Trouver et parler à Victor' }],
    reward: 1,
    done: "« Ça va, t'es pas si nul. Va voir les autres. » — Victor t'a validé.",
  },
  {
    id: 'faire_connaissance',
    title: 'Faire connaissance',
    intro: 'Fais le tour de la bande : Charles, Margot et Oscar.',
    objectives: [
      { type: 'talk', target: 'charles', text: 'Parler à Charles' },
      { type: 'talk', target: 'margot',  text: 'Parler à Margot' },
      { type: 'talk', target: 'oscar',   text: 'Parler à Oscar' },
    ],
    reward: 1,
    done: 'La bande commence à te connaître.',
  },
  {
    id: 'baptente_golf',
    title: 'Le Baptême du Golf',
    intro: "Descends jusqu'au club-house (l'abbaye) et parle au greenkeeper.",
    objectives: [
      { type: 'reach', x: 1140, y: 1040, r: 90, text: "Rejoindre le club-house (l'abbaye)" },
      { type: 'talk', target: 'greenkeeper', text: 'Parler à Marcel le greenkeeper' },
    ],
    reward: 1,
    done: '« Respecte le parcours, petit. » — Marcel veille au grain.',
  },
  {
    id: 'chat_margot',
    title: 'Le Chat de Margot',
    intro: 'Bisou, le chat de Margot, a filé dans les roughs. Retrouve-le et ramène-le.',
    objectives: [
      { type: 'reach', x: 1460, y: 1520, r: 70, text: 'Fouiller les roughs pour trouver Bisou' },
      { type: 'talk', target: 'margot', text: 'Ramener Bisou à Margot' },
    ],
    reward: 1,
    done: '« BISOU ! » — Margot te serre dans ses bras (et le chat aussi).',
  },
  {
    id: 'bande_complete',
    title: 'La Bande au Complet',
    intro: "Tu fais presque partie du groupe. Parle à toute la bande (les 8).",
    objectives: [{ type: 'talkAll',
      targets: ['victor','charles','margot','antoine','oscar','louis','kupi','paul'],
      text: 'Parler à toute la bande' }],
    reward: 2,
    done: "Tu fais officiellement partie de la bande du Prieuré. L'été peut commencer.",
  },
];
