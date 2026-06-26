# Le Prieuré RPG

RPG top-down style Pokémon GBA, basé sur le Golf du Prieuré (Bonnelles, Yvelines)
et sur un groupe d'amis d'enfance réels.

## Pour Claude Code — lis d'abord

**→ CLAUDE.md** : tout ce qu'il faut savoir sur le projet, les persos, la géo, le gameplay.

## Structure

```
CLAUDE.md                    ← START HERE (instructions complètes)
index.html                   ← Point d'entrée jeu
src/
  engine_starter.js          ← Moteur Canvas à compléter
  data_complete.js           ← Toutes les données (PNJ, missions, dialogues)
docs/
  tileset_guide.md           ← Guide assets visuels
assets/
  world_map_reference.html   ← Map interactive du Prieuré (référence visuelle)
```

## Lancer le jeu

```bash
# Serveur local simple (pas de build)
python3 -m http.server 8080
# → http://localhost:8080
```

## Stack

- HTML5 Canvas (vanilla JS, zéro dépendance)
- ES modules natifs
- LocalStorage pour la sauvegarde
- Pas de bundler nécessaire

## Commandes pour Claude Code

```
# Demande type pour Claude Code :
"Implémente la tilemap du hameau à partir de la world map reference.
Toutes les maisons (≥45) doivent être représentées avec jardin et haie.
Les allées des Fougères, des Hameaux et de la Lisière doivent être reconnaissables.
Tile size 16px, map 320×220 tiles. Style Pokémon GBA strict."
```
