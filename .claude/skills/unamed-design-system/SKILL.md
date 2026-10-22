---
name: unamed-design-system
description: Charte graphique d'Unamed Canapé. (luxe, minimaliste, noir/ivoire, serif Playfair + capitales espacées). À charger AVANT de créer ou modifier une page, un composant ou un style du site. Trigger : "nouvelle page", "composant", "design", "UI", "style", "mise en page", "bouton", "formulaire".
---

# Design system — Unamed Canapé.

Inspiration : le logo serif à fort contraste avec point final (façon Panache Pâtisserie), les galeries de mobilier haut de gamme. **Le luxe, c'est l'espace et la retenue.**

## Tokens (définis dans `app/globals.css`, bloc `@theme`)

| Token | Valeur | Usage |
|---|---|---|
| `paper` | #fcfbf8 | fond principal |
| `ivory` | #f7f4ee | blocs secondaires, récapitulatifs, fonds d'images |
| `ink` | #121110 | texte, boutons pleins, bordures fortes |
| `stone` | #8a8378 | texte secondaire |
| `line` | #e4ded3 | séparateurs, bordures légères |
| `success` / `danger` | #3f6b4a / #9b3b2f | messages uniquement |

Jamais d'autre couleur, jamais de dégradé coloré, jamais d'ombre portée marquée.

## Typographie

- **Titres** : classe `.display` (Playfair Display 700, interlignage 1.02). Tailles généreuses : `text-5xl md:text-7xl` pour un H1.
- **Accents** : un mot en `<em className="font-normal">` italique dans un titre, pas plus.
- **Labels, nav, boutons** : classe `.eyebrow` (11 px, capitales, `letter-spacing: .22em`).
- **Corps** : Jost 400, `text-stone` pour les descriptions, `leading-relaxed`.
- Le logo est toujours `Unamed Canapé` + un point en `text-stone` (composant `<Logo />`).

## Composants & classes utilitaires

- Boutons : `.btn .btn-solid` (action principale, une par écran) ou `.btn .btn-ghost`. Coins droits, jamais arrondis.
- Champs : `.field` (souligné, sans cadre).
- Liens texte : `.link-underline` (soulignement animé au survol).
- Images produit : toujours `<ProductImage />` (gère l'absence de photo avec un dessin au trait).
- Apparition : `animate-fade-up` avec `animationDelay` échelonné de 80 ms.

## Mise en page

- Conteneur : `mx-auto max-w-[1440px] px-5 md:px-10`.
- Respiration verticale entre sections : `mt-32`.
- Grilles produits : `gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3`.
- Séparateurs : `border-line` 1 px ; un trait `border-ink` pour marquer un début de section.
- Mobile d'abord : vérifier à 375 px, aucune barre de défilement horizontale.

## Ton éditorial

Français, vouvoiement, phrases courtes. Pas de points d'exclamation, pas d'emoji, pas de superlatifs ("incroyable", "top"). On décrit la matière, la forme, l'usage.

## Checklist avant de valider

- [ ] Uniquement des tokens de la charte
- [ ] Un seul bouton plein par écran
- [ ] Titres en `.display`, labels en `.eyebrow`
- [ ] États vides et messages d'erreur rédigés
- [ ] Rendu vérifié en 375 px et 1440 px
