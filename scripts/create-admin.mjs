// Crée (ou promeut) le compte administrateur.
// Usage : node --env-file=.env.local scripts/create-admin.mjs admin@unamedcanape.fr "MotDePasse"
import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage : node --env-file=.env.local scripts/create-admin.mjs <email> "<mot de passe>"');
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

let { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { first_name: "Admin", last_name: "Unamed" },
});

let userId = data?.user?.id;
if (error) {
  // Déjà inscrit : on retrouve l'utilisateur
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  userId = list.users.find((u) => u.email === email)?.id;
  if (!userId) throw error;
}

const { error: roleError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", userId);
if (roleError) throw roleError;
console.log(`✓ ${email} est administrateur.`);
