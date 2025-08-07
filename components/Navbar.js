"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isPremium, setIsPremium] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch("/api/profile/get")
      .then(res => res.json())
      .then(data => setIsPremium(!!data.user?.is_premium));
  }, [session]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="w-full bg-black/80 text-white p-4 flex items-center border-b border-white/20 shadow-lg backdrop-blur-lg z-50 relative">
      
      {/* LOGO & Premium à gauche */}
      <div className="text-2xl font-bold flex items-center gap-3">
        <Link href="/">MétéoApp</Link>
        {isPremium && (
          <span className="ml-2 px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-bold shadow border border-yellow-300 animate-pulse">
            Premium
          </span>
        )}
      </div>

      {/* Espacement entre gauche et droite */}
      <div className="flex-1" />

      {/* Liens à droite (desktop/tablette) */}
      <ul className="hidden sm:flex space-x-6 items-center">
        {!session ? (
          <>
            <li>
              <Link href="/auth/login" className="hover:underline">
                Connexion
              </Link>
            </li>
            <li>
              <Link href="/auth/register" className="hover:underline">
                Inscription
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/profile" className="hover:underline">
                Profil
              </Link>
            </li>
            <li>
              <Link href="/favorites" className="hover:underline">
                Favoris
              </Link>
            </li>
            <li>
              <Link href="/premium" className="hover:underline">
                Premium
              </Link>
            </li>
            <li>
              <button onClick={() => signOut()} className="hover:underline">
                Déconnexion
              </button>
            </li>
          </>
        )}
      </ul>

      {/* Bouton burger (mobile uniquement) */}
      <button
        className="sm:hidden flex flex-col justify-center items-center w-8 h-8 relative z-50 ml-2"
        aria-label="Ouvrir le menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span
          className={`block h-1 w-6 bg-white rounded transition-transform duration-300 ${
            menuOpen ? "rotate-45 translate-y-2" : ""
          }`}
        ></span>
        <span
          className={`block h-1 w-6 bg-white rounded my-1 transition-all duration-300 ${
            menuOpen ? "opacity-0" : ""
          }`}
        ></span>
        <span
          className={`block h-1 w-6 bg-white rounded transition-transform duration-300 ${
            menuOpen ? "-rotate-45 -translate-y-2" : ""
          }`}
        ></span>
      </button>

      {/* Menu déroulant mobile */}
      <ul
        className={`sm:hidden bg-black/95 absolute top-full left-0 w-full py-5 transition-all duration-300 z-40 ${
          menuOpen ? "block" : "hidden"
        }`}
      >
        {!session ? (
          <>
            <li className="block px-6 py-2">
              <Link
                href="/auth/login"
                className="hover:underline"
                onClick={() => setMenuOpen(false)}
              >
                Connexion
              </Link>
            </li>
            <li className="block px-6 py-2">
              <Link
                href="/auth/register"
                className="hover:underline"
                onClick={() => setMenuOpen(false)}
              >
                Inscription
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className="block px-6 py-2">
              <Link
                href="/profile"
                className="hover:underline"
                onClick={() => setMenuOpen(false)}
              >
                Profil
              </Link>
            </li>
            <li className="block px-6 py-2">
              <Link
                href="/favorites"
                className="hover:underline"
                onClick={() => setMenuOpen(false)}
              >
                Favoris
              </Link>
            </li>
            <li className="block px-6 py-2">
              <Link
                href="/premium"
                className="hover:underline"
                onClick={() => setMenuOpen(false)}
              >
                Premium
              </Link>
            </li>
            <li className="block px-6 py-2">
              <button
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
                className="hover:underline"
              >
                Déconnexion
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
