"use client";
import { useSession } from "next-auth/react";
import Favorites from "../../components/Favorites";

export default function FavoritesPage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Vous devez être connecté pour accéder à vos favoris.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <Favorites userId={session.user.id} />
    </main>
  );
}
