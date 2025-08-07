import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// Client public pour vérifier le mot de passe
const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // clé publique
);

// Client service pour la suppression
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE // clé de service
);

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Utilisateur non connecté" }), { status: 401 });
    }
    const id = session.user.id;
    const { password } = await request.json();

    // Récupérer l'email de l'utilisateur
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(id);
    if (userError || !userData?.user?.email) {
      return new Response(JSON.stringify({ error: "Impossible de vérifier l'utilisateur." }), { status: 500 });
    }

    // Vérifier le mot de passe avec le client public
    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email: userData.user.email,
      password,
    });
    if (error || !data.user) {
      return new Response(JSON.stringify({ error: "Mot de passe incorrect." }), { status: 401 });
    }

    // Supprimer le profil
    const { error: profileError } = await supabase.from("profiles").delete().eq("id", id);
    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), { status: 500 });
    }
    // Supprimer l'utilisateur
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message || "Erreur serveur." }), { status: 500 });
  }
}