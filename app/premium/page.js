"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session } = useSession();
  const [isPremium, setIsPremium] = useState(undefined); // undefined = loading

  // Remplace par ton vrai Price ID Stripe !
  const PRICE_ID = "price_1RspYKKYZeX4hWaCMZP1qZoh";

  // Récupère le statut premium à jour
  useEffect(() => {
    if (!session) return;
    fetch("/api/profile/get")
      .then(res => res.json())
      .then(data => {
        setIsPremium(!!data.user?.is_premium);
      });
  }, [session]);

  async function subscribe() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: PRICE_ID }),
      });
      const json = await res.json();
      if (json.url) {
        window.location = json.url; // Redirection vers la page Stripe
      } else {
        setError(json.error || "Erreur lors de la création de la session Stripe");
      }
    } catch (e) {
      setError("Erreur réseau ou Stripe.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto mt-20 bg-white/80 rounded-xl shadow-lg p-10 text-center">
      <h1 className="text-3xl font-bold mb-4 text-yellow-600">Abonnement Premium</h1>
      <div className="mb-8 text-lg text-gray-800">
        <p className="mb-2">Devenez membre Premium et débloquez :</p>
        <ul className="list-disc list-inside text-left mx-auto max-w-md mb-4">
          <li>Prévisions météo sur 5 jours pour toutes vos villes</li>
          <li>Favoris illimités</li>
          <li>Support prioritaire</li>
        </ul>
        <p className="mt-2">Paiement sécurisé via Stripe.</p>
      </div>
      {isPremium === undefined ? (
        <div className="text-gray-500 text-lg mb-4">Chargement...</div>
      ) : isPremium ? (
        <div className="text-green-600 font-bold text-xl mb-4">Vous êtes déjà Premium !</div>
      ) : (
        <button
          onClick={subscribe}
          disabled={loading}
          className="bg-yellow-500 text-white font-bold rounded px-6 py-3 text-xl hover:bg-yellow-600 transition"
        >
          {loading ? "Redirection..." : "Souscrire à Premium"}
        </button>
      )}
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </div>
  );
}
