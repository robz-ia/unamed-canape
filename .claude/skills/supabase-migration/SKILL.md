---
name: supabase-migration
description: Méthode pour faire évoluer la base Supabase d'Unamed Canapé. (nouvelle table, colonne, fonction RPC, politique RLS). À utiliser dès qu'une fonctionnalité doit stocker ou lire de nouvelles données. Trigger : "nouvelle table", "migration", "base de données", "Supabase", "RLS", "stocker en base", "RPC".
---

# Faire évoluer la base Supabase

## 1. Créer le fichier

`supabase/migrations/NNNN_description.sql` — numéro suivant le dernier fichier existant (`0004_reviews.sql`, `0005_wishlist.sql`…). Ne JAMAIS modifier une migration déjà exécutée en production : on en ajoute une nouvelle.

## 2. Conventions de modélisation

- Clé primaire `id uuid primary key default gen_random_uuid()` (ou `bigint generated always as identity` pour les journaux volumineux).
- Clés étrangères explicites avec `on delete` réfléchi : `cascade` pour les données possédées, `set null` pour l'historique, `restrict` pour les commandes.
- Contraintes métier en base : `check`, `unique`, `not null`. La base doit refuser une donnée invalide même si le front a un bug.
- `created_at timestamptz not null default now()` partout ; `updated_at` + trigger `public.set_updated_at()` si la ligne est modifiable.
- Un index sur chaque clé étrangère et chaque colonne filtrée/triée.
- Noms en anglais, `snake_case`, au pluriel pour les tables.

## 3. Sécurité — obligatoire

```sql
alter table public.ma_table enable row level security;
create policy "ma_table: propriétaire" on public.ma_table
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ma_table: admin lecture" on public.ma_table
  for select using (public.is_admin());
```

- `public.is_admin()` existe déjà (0002).
- Toute écriture qui touche plusieurs tables ou le stock → fonction `security definer set search_path = public` qui vérifie `auth.uid()`, puis `revoke execute ... from public, anon; grant execute ... to authenticated;`.

## 4. Brancher dans Next.js

- Lecture : `lib/data.ts` (Server Components) via `createClient()` de `lib/supabase/server.ts`.
- Écriture : une server action dans `app/actions.ts`, puis `revalidatePath(...)`.
- Types : ajouter le type dans `lib/types.ts`.

## 5. Exécuter et vérifier

1. Supabase → SQL Editor → coller la migration → Run.
2. Tester en tant que client ET en tant qu'admin (une politique trop large est un bug de sécurité).
3. Si la donnée sert un KPI, l'ajouter à `public.admin_kpis()` (voir le skill `admin-kpi`).
