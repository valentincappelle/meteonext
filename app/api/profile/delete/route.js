import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Utilisateur non connecté" }), { status: 401 });
    }

    const id = session.user.id;

    // Supprime de la table profiles
    const { error: profileError } = await supabase.from("profiles").delete().eq("id", id);
    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), { status: 500 });
    }

    // Supprime de la table auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Erreur serveur." }), { status: 500 });
  }
}
