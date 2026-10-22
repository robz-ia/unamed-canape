---
name: admin-kpi
description: Ajoute ou modifie un indicateur (KPI) du tableau de bord administrateur d'Unamed Canapé., calculé en SQL dans la fonction admin_kpis(). Trigger : "nouveau KPI", "indicateur", "dashboard admin", "statistique", "tableau de bord".
---

# Ajouter un KPI au tableau de bord

Tous les indicateurs sont calculés **en base**, en un seul appel : `select public.admin_kpis(p_days)` (fichier `supabase/migrations/0003_functions.sql`). Le front ne fait aucun calcul lourd.

## Méthode

1. **Définir** le KPI en une phrase et sa formule exacte. Exemples :
   - Taux de conversion = acheteurs distincts / visiteurs uniques (product_views) sur la période.
   - Panier moyen = CA / nombre de commandes valides.
   - Commandes valides = statut ≠ `pending` et ≠ `cancelled`.
2. **Écrire une nouvelle migration** (`00NN_kpi_xxx.sql`) qui fait `create or replace function public.admin_kpis(...)` avec :
   - une CTE nommée de plus dans le `with` ;
   - une clé de plus dans `jsonb_build_object(...)`.
   Garder la vérification `if not public.is_admin() then raise exception` en tête de fonction.
3. **Typer** : ajouter le champ au type `Kpis` de `app/admin/page.tsx`.
4. **Afficher** : tuile dans le tableau `tiles` (valeur + sous-texte comparatif), ou section dédiée.
   - Une seule série → pas de légende, le titre la nomme.
   - Couleur : `ink` uniquement, barres arrondies 4 px côté valeur, survol avec infobulle.
   - Jamais deux axes Y.
5. **Tester** avec des données : `node --env-file=.env.local scripts/seed-demo.mjs`.
