import { NextResponse } from "next/server";
import Stripe from "stripe";

// Pour lire le body brut
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const buf = await buffer(req.body);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET // Obtenu depuis le Dashboard Stripe
    );
  } catch (err) {
    return NextResponse.json({ err: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Gestion d'événement "checkout.session.completed" avec client_reference_id
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    console.log("[STRIPE WEBHOOK] checkout.session.completed reçu, userId:", userId);
    if (userId) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE
      );
      const { error, data } = await supabase
        .from("profiles")
        .update({ is_premium: true })
        .eq("id", userId);
      console.log("[STRIPE WEBHOOK] Résultat update Supabase:", { error, data });
    } else {
      console.log("[STRIPE WEBHOOK] Aucun userId transmis dans client_reference_id");
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
