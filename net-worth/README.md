# Relevé de patrimoine — calculateur de net worth

Petite app autonome pour suivre sa valeur nette, avec une gestion correcte de
l'**indivision** (appartement détenu à plusieurs).

Un seul fichier, aucune dépendance : ouvre `index.html` dans un navigateur.

## Ce que ça calcule

```
net worth = actifs (à ma quote-part) − dettes (à ma quote-part)
```

### Immobilier en indivision

Le point qui distingue cette app d'un tableur : **la quote-part sur la valeur du
bien et la quote-part sur le crédit sont deux champs séparés**. On peut posséder
50 % d'un appartement tout en remboursant 60 % de l'emprunt — les confondre
fausse le résultat.

Pour chaque bien :

| Champ | Sens |
|---|---|
| Valeur du bien | Valeur de marché, à 100 % |
| Ma quote-part | Ma part de propriété, en % |
| Capital restant dû | Ce qu'il reste à rembourser, à 100 % |
| Ma part du crédit | La fraction de l'emprunt qui est à ma charge, en % |
| Créance | Ajustement ± pour un apport personnel non compensé (créance entre indivisaires) |

```
ma part = valeur × quote-part − capital restant dû × part du crédit + créance
```

La créance se répercute du bon côté du bilan : positive elle compte en actif
(l'indivision te doit), négative elle compte en dette.

### Autres postes

Placements, autres actifs et dettes prennent chacun un montant et une
quote-part — 100 % pour ce qui est à toi seul, 50 % pour un compte joint.

## Fonctionnement

- **Sauvegarde automatique** dans le `localStorage` du navigateur. Rien ne sort
  de la machine, aucun réseau.
- **Historique** : « Enregistrer un point » fige un relevé daté (actifs, dettes,
  net worth). À partir de deux points, la courbe d'évolution s'affiche.
- **Export / import JSON** pour sauvegarder ou passer d'un appareil à l'autre.
- Les montants se saisissent librement : `420 000`, `420000`, `420 000 €` et
  `420000,50` sont tous acceptés.

## Notes techniques

- HTML/CSS/JS vanilla, aucun build, aucune requête externe.
- Thèmes clair et sombre : palette complète en tokens sur `:root`, redéfinie pour
  `prefers-color-scheme: dark` et pour `[data-theme="dark"]`.
- Les listes ne sont reconstruites qu'aux changements de structure (ajout,
  suppression) ; les montants se rafraîchissent en place pour ne pas voler le
  focus pendant la frappe.
