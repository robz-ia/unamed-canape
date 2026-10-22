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

- **Logo** : classe `.logo` (Playfair Display 800) + point final — façon Panache.
- **Titres** : classe `.display` (Playfair Display 400, interlignage 1). Tailles monumentales : `text-[clamp(3.5rem,11vw,10rem)]` pour un H1 de page.
- **Accents** : un mot en `<em className="font-normal">` italique dans un titre, pas plus.
- **Labels, nav, boutons** : classe `.eyebrow` (11 px, capitales, `letter-spacing: .22em`).
- **Corps** : Jost 400, `text-stone` pour les descriptions, `leading-relaxed`.
- Le logo est toujours `Unamed Canapé` + un point en `text-stone` (composant `<Logo />`).

## Composants & classes utilitaires

- Boutons : `.btn .btn-solid` (action principale, une par écran) ou `.btn .btn-ghost`. Coins droits, jamais arrondis.
- Champs : `.field` (souligné, sans cadre).
- Liens texte : `.link-underline` (soulignement animé au survol).
- Images produit : toujours `<ProductImage />` (gère l'absence de photo avec un dessin au trait).
- Photo détourée (fond blanc) : `object-contain mix-blend-multiply` sur `bg-ivory` — le blanc devient ivoire.

## Mouvement (`components/motion/`)

Le luxe est lent et précis : courbe `EASE = [0.22, 1, 0.36, 1]`, durées 0,9 – 1,6 s, jamais de rebond.

| Composant | Usage |
|---|---|
| `SplitReveal` | Titres : mots qui sortent d'un masque. `*mot*` = italique. `immediate` pour le haut de page. |
| `Reveal` | Blocs : fondu + 40 px de montée à l'entrée dans l'écran. Décaler de 0,1 – 0,15 s. |
| `ParallaxImage` | Grandes images : rideau qui s'ouvre puis parallaxe. |
| `ScrollText` | Manifeste : le texte s'allume mot à mot au défilement. |
| `Counter` | Chiffres clés qui défilent. |

Règles : jamais de `transform`/`filter` sur un conteneur de page (casse `fixed`/`sticky`) — utiliser un portail. Toujours vérifier `prefers-reduced-motion`. Aucun bandeau promotionnel en haut de page, aucun curseur personnalisé, aucun défilement détourné (pas de section épinglée qui transforme le scroll vertical en horizontal) : les carrousels se pilotent à la main (swipe, glisser, flèches).

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
- [ ] Titres animés (`SplitReveal`), blocs révélés (`Reveal`)
- [ ] Titres en `.display`, labels en `.eyebrow`
- [ ] États vides et messages d'erreur rédigés
- [ ] Rendu vérifié en 375 px et 1440 px
