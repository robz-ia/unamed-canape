// URL + clé « publishable » du projet Supabase GALAAD.
// Cette clé est publique par conception (elle est envoyée à chaque navigateur) :
// la sécurité repose sur les politiques RLS de la base. Les variables d'environnement
// restent prioritaires. La clé secrète (service role) n'apparaît jamais ici.
const DEFAULT_URL = "https://ynoxstbvdoohkzgopnuy.supabase.co";
const DEFAULT_PUBLISHABLE_KEY = "sb_publishable_AvJSYiTonpepT8jcSI31LA_k89oRGgy";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_PUBLISHABLE_KEY;

// Faux uniquement si on force des valeurs d'exemple (mode démo sans base).
export const SUPABASE_CONFIGURED =
  !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !SUPABASE_URL.includes("example.supabase.co") && SUPABASE_ANON_KEY !== "placeholder";
