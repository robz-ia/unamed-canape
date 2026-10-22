@AGENTS.md

# Unamed Canapé. — consignes projet

E-commerce de canapés de créateurs. Next.js 16 (App Router, `proxy.ts`), Tailwind v4, Supabase (Auth + Postgres + RLS), déployé sur Vercel.

## Skills du projet (`.claude/skills/`) — à charger selon la tâche

| Skill | Quand |
|---|---|
| `unamed-design-system` | toute création/modification d'UI |
| `supabase-migration` | toute nouvelle donnée stockée (table, colonne, RPC, RLS) |
| `add-product` | ajout d'une pièce au catalogue |
| `admin-kpi` | nouvel indicateur du tableau de bord admin |
| `concierge-canape` | ton et règles du conseiller IA — **aussi chargé en production** comme prompt système par `app/api/concierge/route.ts` |

## Architecture

- `lib/supabase/{server,client}.ts` — clients Supabase ; `proxy.ts` rafraîchit la session et protège `/compte`, `/commande`, `/admin`.
- `lib/data.ts` — lectures (Server Components). `app/actions.ts` — écritures (server actions).
- Logique critique en SQL : `add_to_cart`, `validate_coupon`, `place_order` (transaction + stock), `admin_kpis`.
- Admin : `profiles.role = 'admin'`, vérifié en base (`is_admin()`) ET dans `app/admin/layout.tsx`.

## Règles

- Jamais de clé `SUPABASE_SERVICE_ROLE_KEY` dans le code client ni dans Vercel (scripts locaux uniquement).
- Migrations : un nouveau fichier `supabase/migrations/NNNN_*.sql`, jamais modifier un ancien.
- Commits en français, à l'impératif, préfixés : `feat:`, `fix:`, `style:`, `db:`, `docs:`.
- Vérifier `npx tsc --noEmit && npx eslint .` avant chaque commit.
