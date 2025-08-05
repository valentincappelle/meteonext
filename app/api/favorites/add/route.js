import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// Connexion Supabase admin
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export async function POST(request) {
  // Récupère la session NextAuth du user connecté
  const session = await getServerSession(authOptions);

  // Sécurité : refuse si non connecté
  if (!session || !session.user || !session.user.id) {
    return new Response(JSON.stringify({ error: "Non authentifié." }), { status: 401 });
  }

  const { city } = await request.json();
  if (!city) {
    return new Response(JSON.stringify({ error: "City manquant" }), { status: 400 });
  }

  // Insère le favori pour cet user
  const { error } = await supabase
    .from("favorites")
    .insert([{ user_id: session.user.id, city }]);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
