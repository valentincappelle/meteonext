"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

export default function Favorites() {
  const { data: session } = useSession();
  const [favoris, setFavoris] = useState([]);
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  // Récupère le statut premium à jour depuis l'API
  useEffect(() => {
    if (!session) return;
    fetch("/api/profile/get")
      .then(res => res.json())
      .then(data => {
        if (data.user?.is_premium) setIsPremium(true);
        else setIsPremium(false);
      });
  }, [session]);

  const MAX_FAV = isPremium ? Infinity : 3;

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

  // Autocomplétion des villes françaises (API geo.api.gouv.fr)
  const handleInput = async (e) => {
    const val = e.target.value;
    setCity(val);
    if (val.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const resp = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(val)}&fields=nom&boost=population&limit=5`
      );
      const cities = await resp.json();
      setSuggestions(cities.map(city => city.nom));
    } catch {
      setSuggestions([]);
    }
  };

  const handleSuggestion = (name) => {
    setCity(name);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const addFavori = async () => {
    if (!city.trim()) return;
    // Vérifie si la ville est déjà dans les favoris (insensible à la casse et espaces)
    if (favoris.some(f => f.city.trim().toLowerCase() === city.trim().toLowerCase())) {
      setMessage("Cette ville est déjà dans vos favoris.");
      return;
    }
    // Blocage si la limite est atteinte
    if (favoris.length >= MAX_FAV) {
      setMessage(
        isPremium
          ? "Chargement en cours..."
          : `Tu as atteint la limite de ${MAX_FAV} favoris. Passe en Premium pour en ajouter plus !`
      );
      return;
    }
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

      <div className="flex gap-3 mb-8 relative">
        <div className="flex-grow relative">
          <input
            ref={inputRef}
            type="text"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ajouter une ville"
            value={city}
            onChange={handleInput}
            onKeyDown={e => {
              if (e.key === 'Enter') addFavori();
              if (e.key === 'ArrowDown' && suggestions.length > 0) {
                document.getElementById('suggestion-0')?.focus();
              }
            }}
            disabled={loading || (!isPremium && favoris.length >= MAX_FAV)}
            aria-label="Saisissez une ville à ajouter aux favoris"
            autoComplete="off"
            onBlur={() => setTimeout(() => setSuggestions([]), 100)}
            onFocus={() => city && suggestions.length > 0 && setSuggestions(suggestions)}
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-56 overflow-y-auto">
              {suggestions.map((name, idx) => (
                <li
                  key={name + idx}
                  id={`suggestion-${idx}`}
                  tabIndex={0}
                  className="px-4 py-2 cursor-pointer text-gray-900 hover:bg-blue-100 hover:text-blue-800"
                  onMouseDown={() => handleSuggestion(name)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSuggestion(name);
                    if (e.key === 'ArrowDown') document.getElementById(`suggestion-${idx+1}`)?.focus();
                    if (e.key === 'ArrowUp') {
                      if (idx === 0) inputRef.current?.focus();
                      else document.getElementById(`suggestion-${idx-1}`)?.focus();
                    }
                  }}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={addFavori}
          disabled={loading || (!isPremium && favoris.length >= MAX_FAV)}
          className={`bg-blue-600 text-white rounded-md px-7 py-2 font-semibold hover:bg-blue-700 transition
            ${loading || (!isPremium && favoris.length >= MAX_FAV) ? "opacity-50 cursor-not-allowed" : ""}
            `}
          aria-disabled={loading || (!isPremium && favoris.length >= MAX_FAV)}
          aria-label="Ajouter la ville aux favoris"
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
                aria-label={`Supprimer le favori ${fav.city}`}
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
