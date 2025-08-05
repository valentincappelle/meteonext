"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  const res = await signIn("credentials", {
    redirect: false,       
    email,
    password,
    callbackUrl: "/",       
  });
  if (res.error) {
    setError("E-mail ou mot de passe invalide.");
  } else if (res.ok || res.url) {
   
    router.push(res.url || "/");
  }
};

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-w-md mx-auto p-6 bg-white text-gray-900 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Connexion</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
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
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Se connecter
      </button>
    </form>
  );
}
