"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch("/api/profile/get")
      .then(res => res.json())
      .then(data => setIsPremium(!!data.user?.is_premium));
  }, [session]);

  return (
    <nav className="w-full bg-black/80 text-white p-4 flex justify-between items-center border-b border-white/20 shadow-lg backdrop-blur-lg z-50">
      <div className="text-2xl font-bold flex items-center gap-3">
        <Link href="/">MétéoApp</Link>
        {isPremium && (
          <span className="ml-2 px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-bold shadow border border-yellow-300 animate-pulse">Premium</span>
        )}
      </div>
      <ul className="flex space-x-6">
        {!session ? (
          <>
            <li><Link href="/auth/login">Connexion</Link></li>
            <li><Link href="/auth/register">Inscription</Link></li>
          </>
        ) : (
          <>
            <li><Link href="/profile">Profil</Link></li>
            <li><Link href="/favorites">Favoris</Link></li>
            <li><Link href="/premium">Premium</Link></li>
            <li>
              <button onClick={() => signOut()} className="hover:underline">
                Déconnexion
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
