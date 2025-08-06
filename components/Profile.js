"use client";
import { useState, useEffect } from "react";
import { useSession, signOut, signIn } from "next-auth/react";

export default function Profile() {
  const { data: session } = useSession();
  const [editing, setEditing] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    getUserData();
  }, []);

  async function getUserData() {
    const response = await fetch('/api/profile/get');
    const { user } = await response.json();
    setUserData(user);
    setInputName(user?.name || "");
    setInputEmail(user?.email || "");
  }

  // On met à jour ce qui est réellement rempli, on envoie seulement ce qui a changé
  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const updateFields = {};
    if (inputName !== userData?.name && inputName) updateFields.name = inputName;
    if (inputEmail !== userData?.email && inputEmail) updateFields.email = inputEmail;
    if (!updateFields.name && !updateFields.email) {
      setError("Merci de changer le nom ou l'email pour enregistrer ✅");
      return;
    }

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: session.user.id, ...updateFields }),
    });

    if (res.ok) {
      setMessage("Profil mis à jour !");
      setEditing(false);
      // Met à jour le state local pour afficher les nouvelles infos immédiatement
      setInputName(updateFields.name);
      setInputEmail(updateFields.email);
      await getUserData();
    } else {
      const json = await res.json();
      setError(json.error || "Erreur lors de la mise à jour.");
    }
  };

  // -------- Changement de mot de passe -------
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (!currentPassword) {
      setError("Veillez entrer votre mot de passe actuel.");
      return;
    }

    // Valide le mot de passe actuel côté client
    const signInResult = await signIn("credentials", {
      redirect: false,
      email: inputEmail || userData?.email,
      password: currentPassword,
    });

    if (signInResult?.error) {
      setError("Mot de passe actuel incorrect.");
      return;
    }

    // Met à jour le mdp
    const res = await fetch("/api/profile/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: session.user.id,
        newPassword,
      }),
    });

    if (res.ok) {
      setMessage("Mot de passe changé avec succès !");
      setChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const json = await res.json();
      setError(json.error || "Erreur lors du changement du mot de passe.");
    }
  };

  // --------- Suppression du compte ----------
  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) return;
    setError("");
    setMessage("");

    const res = await fetch("/api/profile/delete", { method: "DELETE" });

    if (res.ok) {
      setMessage("Compte supprimé. Déconnexion...");
      setTimeout(() => signOut({ callbackUrl: "/" }), 1200);
    } else {
      const json = await res.json();
      setError(json.error || "Erreur lors de la suppression.");
    }
  };

  if (!session || !userData) return <p>Chargement…</p>;

  return (
    <div className="max-w-md mx-auto mt-14 p-8 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-4xl font-bold mb-6 text-gray-900 text-center">Mon Profil</h2>

      {message && <p className="text-green-700 font-medium mb-4">{message}</p>}
      {error && <p className="text-red-600 font-medium mb-4">{error}</p>}

      {/* Affichage toujours lisible */}
      <div className="mb-6 space-y-2">
        <div>
          <span className="font-semibold text-gray-900">Nom :</span>{" "}
          <span className="text-gray-800">{inputName ?? <span className="italic text-gray-400">non renseigné</span>}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-900">Email :</span>{" "}
          <span className="text-gray-800">{inputEmail ?? <span className="italic text-gray-400">non renseigné</span>}</span>
        </div>
      </div>

      {/* Formulaire édition */}
      {editing ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-800 mb-1" htmlFor="nameInput">Nom</label>
            <input
              id="nameInput"
              type="text"
              value={inputName}
              onChange={e => setInputName(e.target.value)}
              className="w-full p-2 border rounded text-gray-900 bg-white"
              placeholder="Nom"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-800 mb-1" htmlFor="emailInput">Email</label>
            <input
              id="emailInput"
              type="email"
              value={inputEmail}
              onChange={e => setInputEmail(e.target.value)}
              className="w-full p-2 border rounded text-gray-900 bg-white"
              placeholder="Adresse e-mail"
              autoComplete="email"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
            >
              Enregistrer
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-300 text-gray-900 font-semibold py-2 rounded hover:bg-gray-400 transition"
              onClick={() => {
                setEditing(false);
                setInputName(userData?.name || "");
                setInputEmail(userData?.email || "");
                setError(""); setMessage("");
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button
          className="w-full mb-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition"
          onClick={() => setEditing(true)}
        >
          Modifier mes infos
        </button>
      )}

      {/* Changement de mot de passe */}
      {changingPassword ? (
        <form onSubmit={handleChangePassword} className="space-y-4 mt-6">
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Mot de passe actuel</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              required
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Changer mot de passe
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-300 text-gray-900 py-2 rounded hover:bg-gray-400 transition"
              onClick={() => {
                setChangingPassword(false);
                setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setError(""); setMessage("");
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button
          className="w-full mb-4 bg-green-600 text-white font-semibold py-2 px-4 rounded hover:bg-green-700 transition"
          onClick={() => setChangingPassword(true)}
        >
          Changer mon mot de passe
        </button>
      )}

      <button
        className="w-full mb-4 bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-700 transition"
        onClick={handleDelete}
      >
        Supprimer mon compte
      </button>

      <button
        className="w-full bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-900 transition"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Déconnexion
      </button>
    </div>
  );
}