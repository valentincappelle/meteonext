import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

export async function POST(request) {
  try {
    const { id, newPassword } = await request.json();

    if (!id || !newPassword) {
      return new Response(JSON.stringify({ error: "Informations manquantes." }), { status: 400 });
    }

    const { error } = await supabase.auth.admin.updateUserById(id, { password: newPassword });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Erreur serveur." }), { status: 500 });
  }
}
