import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return new Response(JSON.stringify({ error: "Non authentifié." }), { status: 401 });
  }
  const { city } = await request.json();
  if (!city) {
    return new Response(JSON.stringify({ error: "City manquant" }), { status: 400 });
  }
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", session.user.id)
    .eq("city", city);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
