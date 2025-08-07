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
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    if (!deletePassword) {
      setError("Veuillez entrer votre mot de passe pour confirmer la suppression.");
      return;
    }
    setError("");
    setMessage("");
    const res = await fetch("/api/profile/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword }),
    });
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-200 via-yellow-100 to-orange-200">
      <div className="max-w-lg w-full mx-auto p-10 bg-white/80 rounded-2xl shadow-2xl border border-white/40 backdrop-blur-md relative flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <img src="/images/logometeo.png" alt="Avatar météo" className="w-20 h-20 rounded-full shadow-lg border-4 border-white/60 bg-white/30 mb-2" />
          <h2 className="text-4xl font-bold mb-2 text-gray-900 text-center drop-shadow">Mon Profil</h2>
        </div>

        {message && <p className="text-green-700 font-medium mb-4 text-center">{message}</p>}
        {error && <p className="text-red-600 font-medium mb-4 text-center">{error}</p>}

        {/* Affichage toujours lisible */}
        <div className="mb-6 space-y-2 text-lg w-full">
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
          <form onSubmit={handleUpdate} className="space-y-4 w-full">
            <div>
              <label className="block font-semibold text-gray-800 mb-1" htmlFor="nameInput">Nom</label>
              <input
                id="nameInput"
                type="text"
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                className="w-full p-2 border rounded text-gray-900 bg-white/80 focus:ring-2 focus:ring-blue-400"
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
                className="w-full p-2 border rounded text-gray-900 bg-white/80 focus:ring-2 focus:ring-blue-400"
                placeholder="Adresse e-mail"
                autoComplete="email"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition shadow"
              >
                Enregistrer
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-300 text-gray-900 font-semibold py-2 rounded hover:bg-gray-400 transition shadow"
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
            <div className="mt-4">
              <button
                type="button"
                className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700 transition shadow"
                onClick={() => setChangingPassword(true)}
              >
                Changer mon mot de passe
              </button>
            </div>
          </form>
        ) : (
          <>
            <button
              className="w-full mb-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition shadow"
              onClick={() => setEditing(true)}
            >
              Modifier mes infos
            </button>
            <button
              className="w-full mb-4 bg-green-600 text-white font-semibold py-2 px-4 rounded hover:bg-green-700 transition shadow"
              onClick={() => setChangingPassword(true)}
            >
              Changer mon mot de passe
            </button>
          </>
        )}

        {/* Changement de mot de passe */}
        {changingPassword && (
          <form onSubmit={handleChangePassword} className="space-y-4 mt-6 w-full">
            <div>
              <label className="block font-semibold text-gray-800 mb-1">Mot de passe actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full p-2 border rounded text-gray-900 bg-white/80 focus:ring-2 focus:ring-blue-400"
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
                className="w-full p-2 border rounded text-gray-900 bg-white/80 focus:ring-2 focus:ring-blue-400"
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
                className="w-full p-2 border rounded text-gray-900 bg-white/80 focus:ring-2 focus:ring-blue-400"
                required
                autoComplete="new-password"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition shadow"
              >
                Changer mot de passe
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-300 text-gray-900 py-2 rounded hover:bg-gray-400 transition shadow"
                onClick={() => {
                  setChangingPassword(false);
                  setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setError(""); setMessage("");
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        <button
          className="w-full mt-4 mb-2 bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-700 transition shadow"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Supprimer mon compte
        </button>
        {showDeleteConfirm && (
          <form
            className="w-full mb-2 flex flex-col gap-3"
            onSubmit={e => { e.preventDefault(); handleDelete(); }}
          >
            <input
              type="password"
              className="w-full p-2 border rounded text-gray-900 bg-white/80 focus:ring-2 focus:ring-red-400"
              placeholder="Mot de passe pour confirmer la suppression"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              autoComplete="current-password"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-red-600 text-white font-semibold py-2 rounded hover:bg-red-700 transition shadow"
              >
                Confirmer la suppression
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-300 text-gray-900 font-semibold py-2 rounded hover:bg-gray-400 transition shadow"
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setError(""); setMessage(""); }}
              >
                Annuler
              </button>
            </div>
          </form>
        )}
        <button
          className="w-full mb-2 bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-900 transition shadow"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}