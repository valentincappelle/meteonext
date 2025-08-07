"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Fonction utilitaire pour choisir le fond selon la météo
function getWeatherBg(weather) {
  if (!weather) return "from-orange-200 to-yellow-300";
  const main = weather.weather[0].main.toLowerCase();
  if (main.includes("cloud")) return "from-gray-300 to-gray-400";
  if (main.includes("rain") || main.includes("drizzle") || main.includes("thunderstorm")) return "from-blue-200 to-blue-400";
  if (main.includes("snow")) return "from-blue-100 to-white";
  if (main.includes("mist") || main.includes("fog")) return "from-gray-100 to-gray-300";
  if (main.includes("clear")) return "from-yellow-200 to-orange-300";
  return "from-orange-100 to-yellow-200";
}

export default function Favorites() {
  const { data: session } = useSession();
  const [favoris, setFavoris] = useState([]);
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const inputRef = useRef(null);
  const router = useRouter();

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

  // Récupère la météo pour chaque favori
  useEffect(() => {
    async function fetchWeatherForFavorites() {
      const newWeather = {};
      await Promise.all(
        favoris.map(async (fav) => {
          try {
            const res = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(fav.city)},fr&units=metric&lang=fr&appid=3432083903fe6dfdc2e09fadb51702e9`
            );
            if (res.ok) {
              const data = await res.json();
              newWeather[fav.city] = data;
            }
          } catch {}
        })
      );
      setWeatherData(newWeather);
    }
    if (favoris.length > 0) fetchWeatherForFavorites();
    else setWeatherData({});
  }, [favoris]);

  if (!session) return <div className="text-center mt-10 text-gray-600">Connectez-vous pour gérer vos favoris.</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-200 via-yellow-100 to-orange-200 py-12 px-2">
      <div className="max-w-5xl mx-auto bg-white/80 shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Mes Favoris</h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {favoris.map(fav => {
              const weather = weatherData[fav.city];
              // Détermine l'image de fond météo
              let bgImage = null;
              if (weather) {
                const main = weather.weather[0].main.toLowerCase();
                if (main.includes("cloud")) {
                  if (weather.weather[0].description.toLowerCase().includes("peu nuageux")) {
                    bgImage = "/images/peunuageux.jpg";
                  } else {
                    bgImage = "/images/cloudy.jpg";
                  }
                } else if (["rain", "drizzle", "thunderstorm"].includes(main)) {
                  bgImage = "/images/rainy.jpg";
                } else if (main.includes("snow")) {
                  bgImage = "/images/snowy.jpg";
                } else if (["mist", "fog"].includes(main)) {
                  bgImage = "/images/Foggy.jpg";
                } else if (main.includes("clear")) {
                  bgImage = "/images/sunny.jpg";
                }
              }
              return (
                <div
                  key={fav.id || fav.city}
                  className="rounded-xl shadow-lg p-6 flex flex-col items-center relative group min-h-[260px] transition-transform hover:scale-105 text-white"
                  onClick={e => {
                    if (e.target.closest('button')) return;
                    router.push(`/?ville=${encodeURIComponent(fav.city)}`);
                  }}
                  title={`Voir la météo de ${fav.city}`}
                  style={{
                    cursor: 'pointer',
                    backgroundBlendMode: 'multiply',
                    backgroundColor: 'rgba(0,0,0,0.25)',
                    backgroundImage: bgImage ? `url('${bgImage}')` : undefined,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  <h3 className="text-xl font-bold mb-2 text-gray-900 text-center w-full break-words">{fav.city}</h3>
                  {weather ? (
                    <>
                      <img
                        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                        alt={weather.weather[0].description}
                        className="mx-auto my-2 w-14 h-14"
                      />
                      <div className="text-lg font-semibold mb-1">{weather.main.temp.toFixed(1)}°C</div>
                      <div className="text-gray-700 mb-2 text-center">{weather.weather[0].description}</div>
                    </>
                  ) : (
                    <div className="text-gray-400 text-sm mb-2">Chargement météo...</div>
                  )}
                  <button
                    className="absolute bottom-3 right-3 text-red-600 bg-white/90 border border-red-200 rounded px-3 py-1 text-xs font-semibold shadow hover:bg-red-100 transition-opacity opacity-80 group-hover:opacity-100"
                    onClick={e => {
                      e.stopPropagation();
                      removeFavori(fav.city);
                    }}
                    aria-label={`Supprimer le favori ${fav.city}`}
                  >
                    Supprimer
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
