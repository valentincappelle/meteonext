"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-2xl font-bold">
        <Link href="/">MétéoApp</Link>
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
