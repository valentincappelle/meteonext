import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export async function POST(request) {
  try {
    const { id, name, email } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "ID utilisateur manquant" }), { status: 400 });
    }

    // Mettre à jour le profil custom (table 'profiles')
    if (name) {
      await supabase.from("profiles").update({ name }).eq("id", id);
    }
    if (email) {
      await supabase.from("profiles").update({ email }).eq("id", id);
    }

    // Mettre à jour auth.users  (très important pour NextAuth)
    const updates = {};
    if (name) updates.user_metadata = { name };
    if (email) updates.email = email;

    if (Object.keys(updates).length > 0) {
      const { error: errAuth } = await supabase.auth.admin.updateUserById(id, updates);
      if (errAuth) {
        return new Response(JSON.stringify({ error: errAuth.message }), { status: 500 });
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Erreur serveur." }), { status: 500 });
  }
}
