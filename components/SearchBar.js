"use client";
import { useState, useRef, useEffect } from "react";

export default function SearchBar({ onSearch }) {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef();

  // Fermer suggestions en cliquant dehors
  useEffect(() => {
    const handleClick = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim() !== "") {
      onSearch(city.trim());
      setCity("");
      setSuggestions([]);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8" ref={inputRef}>
      <form onSubmit={handleSubmit} className="flex items-center w-full">
        <input
          type="text"
          value={city}
          onChange={handleInput}
          placeholder="Entrez le nom d'une ville"
          className="w-full px-6 py-3 rounded-lg border-none shadow bg-white/90 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          autoComplete="off"
        />
        <button
          type="submit"
          className="ml-2 text-white bg-[#b4b4b4]/30 hover:bg-[#b4b4b4]/50 rounded-lg h-[48px] w-[48px] flex items-center justify-center shadow"
          aria-label="Rechercher"
        >
          {/* SVG loupe bien visible */}
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke="currentColor" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" />
          </svg>
        </button>
      </form>
      {suggestions.length > 0 && (
        <div
          className="
            absolute left-0 w-full mt-2 rounded-b-xl shadow-lg max-h-56 overflow-y-auto
            bg-white/95 backdrop-blur-xl border border-t-0 transition-all text-gray-900 z-50
          "
        >
          {suggestions.map((name, idx) => (
            <div
              key={name + idx}
              className="px-4 py-2 cursor-pointer hover:bg-blue-200"
              onClick={() => handleSuggestion(name)}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
