export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Faux tant que .env.local contient encore les valeurs d'exemple.
export const SUPABASE_CONFIGURED =
  !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !SUPABASE_URL.includes("example.supabase.co") && SUPABASE_ANON_KEY !== "placeholder";
