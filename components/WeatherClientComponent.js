"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import CurrentWeather from "./CurrentWeather";
import Forecast from "./Forecast";
import Loader from "./Loader";

export default function WeatherClientComponent() {
  const { data: session } = useSession();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weatherType, setWeatherType] = useState("");
  const [favoris, setFavoris] = useState([]);
  const [message, setMessage] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  const searchedCity = weather?.name || "";

  // Limite des favoris selon premium (récupéré dynamiquement)
  const MAX_FAV = isPremium ? Infinity : 3;

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

  useEffect(() => {
    fetchWeather("Beauvais");
  }, []);

  // Charger les favoris de l'utilisateur connecté
  useEffect(() => {
    if (!session) return;
    fetch("/api/favorites/list")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFavoris(data.map((f) => f.city));
      })
      .catch(() => setMessage("Erreur lors du chargement des favoris"));
  }, [session]);

  // Met à jour la météo et le type (pour fond dynamique)
  useEffect(() => {
    if (!weather) return;
    const w = weather.weather[0].main.toLowerCase();
    if (w === "clear") setWeatherType("sunny");
    else if (w === "clouds") {
      setWeatherType(
        weather.weather[0].description.toLowerCase().includes("peu nuageux")
          ? "fewclouds"
          : "cloudy"
      );
    } else if (["rain", "drizzle", "thunderstorm"].includes(w)) setWeatherType("rainy");
    else if (w === "snow") setWeatherType("snowy");
    else if (["mist", "fog"].includes(w)) setWeatherType("foggy");
    else setWeatherType("");
  }, [weather]);

  const fetchWeather = async (city) => {
    setLoading(true);
    try {
      const [res, foreRes] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
            city
          )},fr&units=metric&lang=fr&appid=3432083903fe6dfdc2e09fadb51702e9`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
            city
          )},fr&units=metric&lang=fr&appid=3432083903fe6dfdc2e09fadb51702e9`
        ),
      ]);
      if (!res.ok || !foreRes.ok) throw new Error("Ville non trouvée.");
      const data = await res.json();
      const forecastData = await foreRes.json();
      setWeather(data);
      setForecast(forecastData);
      setMessage("");
    } catch (e) {
      alert(e.message);
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = favoris.includes(searchedCity);

  const toggleFavori = async () => {
    if (!session) {
      setMessage("Veuillez vous connecter pour gérer vos favoris.");
      return;
    }
    // Vérifie si la ville est déjà dans les favoris (insensible à la casse et espaces)
    if (!isFavorite && favoris.some(c => c.trim().toLowerCase() === searchedCity.trim().toLowerCase())) {
      setMessage("Cette ville est déjà dans vos favoris.");
      return;
    }
    // Contrôle limite ici
    if (!isFavorite && favoris.length >= MAX_FAV) {
      setMessage(
        isPremium
          ? "Chargement en cours..." // si premium, pas de limite, message générique
          : "Nombre maximum de favoris atteint. Passe en Premium pour en ajouter plus."
      );
      return;
    }
    setMessage("");
    setLoading(true);
    if (isFavorite) {
      const res = await fetch("/api/favorites/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: searchedCity }),
      });
      if (res.ok) {
        setFavoris((prev) => prev.filter((c) => c !== searchedCity));
        setMessage("Ville retirée des favoris !");
      } else {
        const data = await res.json();
        setMessage(data.error || "Erreur lors de la suppression");
      }
    } else {
      const res = await fetch("/api/favorites/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: searchedCity }),
      });
      if (res.ok) {
        setFavoris((prev) => [...prev, searchedCity]);
        setMessage("Ville ajoutée aux favoris !");
      } else {
        const data = await res.json();
        setMessage(data.error || "Erreur lors de l’ajout");
      }
    }
    setLoading(false);
  };

  // Nouvelle fonction : afficher la météo quand on clique sur un favori
  const handleClickFavori = (city) => {
    fetchWeather(city);
  };

  return (
    <main
      className={`${
        weatherType ? weatherType + "-bg" : "bg-gradient-to-b from-sky-100 to-blue-200"
      } min-h-screen flex flex-col`}
    >
      <header className="relative z-10 w-full max-w-5xl mx-auto mt-8 mb-8 p-6 md:p-8 bg-[#968c8c]/50 rounded-xl md:rounded-2xl shadow-[0_8px_16px_rgba(0,0,0,0.2)] backdrop-blur-md border border-white/30 flex flex-col items-center">
        <div className="flex flex-col items-center justify-center w-full mb-4 gap-2">
          <img
            src="/images/logometeoblanc.png"
            alt="Logo météo"
            className="w-24 h-auto mb-2"
          />
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center">Météo</h1>
        </div>
        <div className="w-full mt-4 flex items-center gap-3">
          <div className="flex-1">
            <SearchBar onSearch={fetchWeather} />
          </div>
        </div>

        {/* Liste favoris cliquable */}
        {session && favoris.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">
            {favoris.map((city) => (
              <button
                key={city}
                onClick={() => handleClickFavori(city)}
                className={`px-4 py-2 rounded-full border border-white/50 bg-white/20 text-white transition hover:bg-white/40 ${
                  searchedCity === city ? "font-bold underline" : ""
                }`}
                aria-label={`Afficher la météo pour ${city}`}
                title={`Afficher la météo pour ${city}`}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </header>

      {searchedCity && (
        <section className="w-full max-w-md mx-auto mb-6">
          <div
            className="
              flex items-center justify-between
              bg-[#968c8c]/50 rounded-xl md:rounded-2xl p-8 shadow-[0_10px_25px_rgba(0,0,0,0.4)]
              backdrop-blur-md border border-white/30
              "
          >
            <h2 className="text-2xl font-semibold text-white">{searchedCity}</h2>
            <div className="flex items-center gap-3">
              <span className="text-white font-medium select-none">
                {isFavorite ? "Retirer des favoris" : "Ajouter en favori"}
              </span>
              <button
                onClick={toggleFavori}
                disabled={loading}
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                className={`bg-white/20 border border-white/30 rounded-full flex items-center justify-center w-12 h-12 text-2xl transition hover:bg-white/40 ${
                  loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <span className="text-yellow-400">{isFavorite ? "★" : "☆"}</span>
              </button>
            </div>
          </div>
          {message && <div className="pt-2 text-center text-green-600">{message}</div>}
        </section>
      )}

      <div className="flex flex-col md:flex-row gap-10 w-full max-w-5xl mx-auto justify-center mb-8">
        <section className="flex-1 bg-[#968c8c]/50 rounded-xl md:rounded-2xl p-8 md:p-10 shadow-[0_10px_25px_rgba(0,0,0,0.4)] backdrop-blur-md text-white flex flex-col items-center justify-center min-h-[340px] border border-white/30">
          <CurrentWeather data={weather} />
        </section>
        <section className="flex-1 bg-[#968c8c]/50 rounded-xl md:rounded-2xl p-8 md:p-10 shadow-[0_8px_16px_rgba(0,0,0,0.2)] backdrop-blur-md text-white min-h-[340px] border border-white/30">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white">
            Prévisions sur 5 jours
          </h2>
          {isPremium
            ? (forecast?.list && <Forecast data={forecast} />)
            : <div className="text-center text-gray-300">Réservé aux membres Premium</div>
          }
        </section>
      </div>

      <footer className="w-full py-6 text-center bg-black/80 text-white border-t border-white/20 shadow-lg backdrop-blur-lg">
        <span className="pfooter">© Valentin CAPPELLE - 2025 - Tous droits réservés</span>
      </footer>
      {loading && <Loader />}
    </main>
  );
}
