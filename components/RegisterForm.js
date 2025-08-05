"use client";
import { useState } from "react";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Erreur lors de l'inscription.");
      } else {
        setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Erreur réseau.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-w-md mx-auto p-6 bg-white text-gray-900 rounded shadow-md">
  <h2 className="text-2xl font-bold mb-4 text-gray-900">Inscription</h2>
  {error && <p className="text-red-500 mb-2">{error}</p>}
  {success && <p className="text-green-600 mb-2">{success}</p>}
  <input
    type="text"
    placeholder="Nom complet"
    value={name}
    onChange={(e) => setName(e.target.value)}
    required
    className="mb-3 p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400"
  />
  <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    className="mb-3 p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400"
  />
  <input
    type="password"
    placeholder="Mot de passe"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="mb-3 p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400"
  />
  <input
    type="password"
    placeholder="Confirmer le mot de passe"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
    className="mb-3 p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400"
  />
  <button
    type="submit"
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
  >
    S'inscrire
  </button>
</form>

  );
}
