# illustrator-reperes-impression

Script **Adobe Illustrator** (ExtendScript) qui crée en un clic, sur tous les plans de travail (ou l'actif) :
- un repère de **fond perdu** (extérieur, ex. 3 mm),
- un repère de **marge de sécurité** (intérieur, ex. 5 mm),
- une **grille de colonnes / rangées** avec gouttière, placée dans la marge.

Tout est rangé dans un calque dédié et verrouillé `Repères impression` : facile à masquer ou supprimer.

*EN: Creates bleed, safety-margin and column/row grid guides on every artboard, in a dedicated locked layer. Bilingual FR/EN dialog.*

## Installation
- **Ponctuel :** `Fichier > Scripts > Autre script…` (Ctrl/Cmd+F12) puis choisir `ReperesImpression.jsx`.
- **Permanent :** copier le fichier dans `…/Adobe Illustrator <version>/Presets/<langue, ex. fr_FR>/Scripts/` puis redémarrer Illustrator ; il apparaît dans `Fichier > Scripts`.

## Utilisation
1. Ouvrez un document (**travaillez sur une copie**).
2. Lancez le script, choisissez l'unité (mm/pt), les marges, le nombre de colonnes/rangées et la gouttière.
3. Choisissez *Tous* ou *Actif*, validez.
4. Relancer avec « Remplacer » coché remplace les anciens repères du calque.

Pour annuler : supprimer le calque `Repères impression` (Illustrator peut enregistrer plusieurs étapes d'annulation pour un script).

## Version / statut
- v1.0.0 — cible Illustrator CC 2018 → 2026 (Windows/macOS).
- ⚠️ **Non testé dans Illustrator** : syntaxe vérifiée (ES3/ES5 avec acorn) et logique relue uniquement.
- Aucune connexion réseau, aucune collecte de données.
- Captures : aucune pour l'instant.

## Licence
MIT — © 2026 Amirouche Amwanes
