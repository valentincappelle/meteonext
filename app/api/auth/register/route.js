import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    // Créer un utilisateur via la clé service_role
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // optionnel, pour simuler l'email confirmé
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({ success: true, user: data.user }),
      { status: 201 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erreur serveur." }), { status: 500 });
  }
}
