import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req) {
  try {
    const sig = req.headers.get("stripe-signature");
    const buf = await buffer(req.body);

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        buf,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("[STRIPE WEBHOOK] Erreur de signature:", err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    console.log("[STRIPE WEBHOOK] Événement reçu:", event.type);

    // Gestion d'événement "checkout.session.completed"
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id;
      
      console.log("[STRIPE WEBHOOK] checkout.session.completed reçu");
      console.log("[STRIPE WEBHOOK] userId:", userId);
      console.log("[STRIPE WEBHOOK] session:", JSON.stringify(session, null, 2));

      if (!userId) {
        console.error("[STRIPE WEBHOOK] Aucun userId transmis dans client_reference_id");
        return NextResponse.json({ error: "Aucun userId trouvé" }, { status: 400 });
      }

      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE
        );

        console.log("[STRIPE WEBHOOK] Tentative de mise à jour Supabase pour userId:", userId);
        
        const { error, data } = await supabase
          .from("profiles")
          .update({ is_premium: true })
          .eq("id", userId);

        if (error) {
          console.error("[STRIPE WEBHOOK] Erreur Supabase:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log("[STRIPE WEBHOOK] Mise à jour réussie:", data);
      } catch (dbError) {
        console.error("[STRIPE WEBHOOK] Erreur lors de la mise à jour de la base de données:", dbError);
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[STRIPE WEBHOOK] Erreur générale:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
