# Unamed Canapé.

Boutique en ligne de canapés de créateurs : six pièces, un design luxe et minimaliste, un conseiller IA.

**Stack** : Next.js 16 (App Router) · Tailwind CSS v4 · Supabase (Auth, Postgres, RLS) · Claude API · Vercel

**Équipe** : Robin Machard · Marc

**En ligne** : https://unamed-canape.vercel.app — base Supabase « GALAAD » — déploiement continu Vercel (chaque push sur `main` est mis en ligne).

---

## Fonctionnalités

| Domaine | Ce qui est fait |
|---|---|
| Comptes clients | Inscription, connexion, déconnexion (Supabase Auth), profil modifiable, adresses enregistrées |
| Boutique | Canapés / Fauteuils / Convertibles — un produit apparaît dans chaque catégorie qui le concerne (Nuage est canapé *et* fauteuil), dans la bonne configuration ; tri par prix, fiche produit éditoriale (photos plein format, coloris qui affichent leur photo), stock en temps réel |
| Panier | **Sans compte** (cookie 30 jours), puis fusionné en base à la connexion ; quantités plafonnées au stock, **historique complet** de chaque action |
| Commande | Codes promo, livraison offerte dès 1 500 €, commande **atomique** côté base (stock décrémenté, prix figés, panier vidé) |
| Espace client | Suivi de commande étape par étape, montant total dépensé, historique du panier |
| Administration | Accès réservé au rôle `admin` : KPIs (CA, commandes, panier moyen, conversion, paniers abandonnés…), graphique du CA, top ventes, stock faible, gestion des statuts de commande, du stock et de la mise en ligne |
| Le Concierge | Conseiller IA qui recommande la bonne pièce à partir du catalogue réel ; repli par règles sans clé API |
| Marketing | Newsletter, journal des vues produit, journal des conversations du Concierge |

## Base de données

17 tables, toutes protégées par Row Level Security.

```
auth.users ─1:1─ profiles ─┬─< addresses
                           ├─1:1─ carts ─< cart_items >─ product_variants
                           ├─< cart_events (journal immuable)
                           ├─< orders ─< order_items        (prix figés)
                           │          └─< order_status_history
                           └─< concierge_messages
categories ─< product_categories >─ products ─┬─< product_images
                        ├─< product_variants (combinaisons d'options + stock)
                        └─< product_views
coupons ─< orders            newsletter_subscribers
```

**Logique en base** (`supabase/migrations/0003_functions.sql`)
- `add_to_cart(variant, qty)` — crée le panier si besoin, cumule, plafonne au stock.
- `validate_coupon(code, subtotal)` — expiration, quota, minimum d'achat.
- `place_order(address, coupon, notes)` — transaction : verrou `FOR UPDATE` sur les variantes, contrôle du stock, calcul des totaux, création commande + lignes, décrément du stock, consommation du coupon, vidage du panier.
- `admin_kpis(days)` — tous les KPIs en un seul appel, avec comparaison à la période précédente.

**Triggers** : création du profil à l'inscription, journalisation automatique de chaque action panier, historique des statuts de commande, `updated_at`, interdiction pour un client de se promouvoir admin.

## Skills (Claude Code)

Le dossier `.claude/skills/` contient les skills du projet, utilisés pendant le développement **et** en production :

| Skill | Rôle |
|---|---|
| `concierge-canape` | Personnalité, règles et exemples du conseiller. **Chargé à l'exécution** par `/api/concierge` comme prompt système, complété par le catalogue lu en base : modifier le skill change le comportement du site. |
| `unamed-design-system` | Charte graphique (tokens, typographie, composants, ton). |
| `supabase-migration` | Méthode pour toute évolution de la base (modélisation, RLS, RPC). |
| `add-product` | Rédaction et insertion d'une nouvelle pièce. |
| `admin-kpi` | Ajout d'un indicateur au tableau de bord. |

## Expérience & animations

- Intro animée à la première visite, défilement inertiel (Lenis), transitions de page.
- Hero « mur de galerie » : titre centré, les pièces flottent autour en parallaxe (souris et défilement).
- Carrousel de la collection piloté à la main (swipe, glisser, flèches), récit en chapitres à image fixe, texte qui s'allume au fil du scroll.
- Menu plein écran avec aperçu photo, panneau panier coulissant.
- Fiche produit à options (format, longueur, coloris, garnissage) : chaque option a ses photos et son prix.
- Respecte `prefers-reduced-motion`. Animations : `motion` ; composants dans `components/motion/`.

## Installation

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés Supabase
```

1. Créer un projet sur [supabase.com](https://supabase.com).
2. **SQL Editor** → exécuter dans l'ordre `supabase/migrations/0001_schema.sql`, `0002_rls.sql`, `0003_functions.sql`, puis `supabase/seed.sql`.
3. **Authentication → Sign In / Providers → Email** : désactiver « Confirm email » (inscription immédiate pour la démo).
4. Créer l'administrateur :
   ```bash
   node --env-file=.env.local scripts/create-admin.mjs admin@unamedcanape.fr "UnMotDePasseSolide"
   ```
5. (Optionnel) Données de démonstration pour les KPIs :
   ```bash
   node --env-file=.env.local scripts/seed-demo.mjs
   ```
6. `npm run dev` → http://localhost:3000

## Déploiement Vercel

Importer le dépôt GitHub sur Vercel et renseigner `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et (optionnel) `ANTHROPIC_API_KEY`. Ne jamais ajouter la clé `service_role` sur Vercel.

## Comptes de test

| Rôle | Accès |
|---|---|
| Client | créer un compte sur `/inscription` |
| Admin | identifiants créés à l'étape 4 → `/admin` |

Codes promo : `BIENVENUE10` (−10 %), `SALON200` (−200 € dès 2 000 €).
