"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Favorites() {
  const { data: session } = useSession();
  const [favoris, setFavoris] = useState([]);
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetch("/api/favorites/list")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFavoris(data);
      })
      .catch(() => setMessage("Erreur réseau"))
      .finally(() => setLoading(false));
  }, [session]);

  const addFavori = async () => {
    if (!city.trim()) return;
    setLoading(true);
    const res = await fetch("/api/favorites/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city }),
    });
    const data = await res.json();
    if (res.ok) {
      setFavoris(prev => [...prev, { id: Date.now(), city }]);
      setMessage("Favori ajouté !");
      setCity("");
    } else {
      setMessage(data.error || "Erreur lors de l’ajout");
    }
    setLoading(false);
  };

  const removeFavori = async (cityToRemove) => {
    setLoading(true);
    const res = await fetch("/api/favorites/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: cityToRemove }),
    });
    const data = await res.json();
    if (res.ok) {
      setFavoris(prev => prev.filter(f => f.city !== cityToRemove));
      setMessage("Favori supprimé !");
    } else {
      setMessage(data.error || "Erreur lors de la suppression");
    }
    setLoading(false);
  };

  if (!session) return <div className="text-center mt-10 text-gray-600">Connectez-vous pour gérer vos favoris.</div>;

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white shadow-xl rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">Mes Favoris</h2>
      {message && <div className="mb-4 text-center text-green-700 font-bold">{message}</div>}

      <div className="flex gap-3 mb-8">
        <input
          type="text"
          className="flex-grow border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Ajouter une ville"
          value={city}
          onChange={e => setCity(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addFavori(); }}
        />
        <button
          onClick={addFavori}
          className="bg-blue-600 text-white rounded-md px-7 py-2 font-semibold hover:bg-blue-700 transition"
        >
          Ajouter
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Chargement...</div>
      ) : favoris.length === 0 ? (
        <p className="text-center text-gray-400 font-medium">Vous n'avez pas encore de favoris.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {favoris.map(fav => (
            <li key={fav.id || fav.city} className="flex justify-between items-center py-3">
              <span className="text-gray-900 font-medium">{fav.city}</span>
              <button
                className="text-red-600 hover:underline font-semibold"
                onClick={() => removeFavori(fav.city)}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
