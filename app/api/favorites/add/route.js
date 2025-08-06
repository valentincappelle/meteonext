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

  // Vérifie le nombre de favoris existants
  const { data: favs, error: favError } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", session.user.id);
  if (favError) return new Response(JSON.stringify({ error: favError.message }), { status: 500 });

  // Vérifie si la ville existe déjà pour cet utilisateur (insensible à la casse et espaces)
  const doublon = favs.some(fav => fav.city && fav.city.trim().toLowerCase() === city.trim().toLowerCase());
  if (doublon) {
    return new Response(JSON.stringify({ error: "Cette ville est déjà dans vos favoris." }), { status: 409 });
  }

  // Récupère le statut premium (champ is_premium dans profiles ou user_metadata)
  let isPremium = false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", session.user.id)
    .single();
  if (profile?.is_premium) isPremium = true;
  if (session.user.is_premium) isPremium = true;

  if (!isPremium && favs.length >= 3) {
    return new Response(JSON.stringify({ error: "Nombre maximum de favoris atteint. Passe en Premium pour en ajouter plus." }), { status: 403 });
  }

  // Insère le favori pour cet user
  const { error } = await supabase
    .from("favorites")
    .insert([{ user_id: session.user.id, city }]);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
