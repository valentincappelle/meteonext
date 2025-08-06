import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getToken } from "next-auth/jwt";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    // Récupère le token JWT pour obtenir l'ID utilisateur
    const token = await getToken({ req: request });
    if (!token?.id) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }
    // Log pour debug la valeur de NEXT_PUBLIC_URL
    console.log("[STRIPE] NEXT_PUBLIC_URL:", process.env.NEXT_PUBLIC_URL);
    const publicUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: "price_1RspYKKYZeX4hWaCMZP1qZoh",
          quantity: 1,
        },
      ],
      success_url: `${publicUrl}/premium?success=true`,
      cancel_url: `${publicUrl}/premium?canceled=true`,
      client_reference_id: token.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
