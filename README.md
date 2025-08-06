# 🌦️ MétéoApp Next.js

Application météo moderne avec Next.js, Tailwind, Supabase et Stripe.

## Fonctionnalités

- **Recherche météo instantanée** (sans compte)
- **Authentification sécurisée** (NextAuth + Supabase)
- **Gestion du profil utilisateur** (modification nom, email, mot de passe, suppression)
- **Favoris** (ajout/suppression, limite selon abonnement)
- **Abonnement Premium** (paiement Stripe, favoris illimités, prévisions sur 5 jours)
- **UI responsive et moderne** (Tailwind CSS)

## Installation

1. Clone le repo :
   ```bash
   git clone https://github.com/valentincappelle/meteonext.git
   cd meteonext
   ```
2. Installe les dépendances :
   ```bash
   npm install
   ```
3. Configure les variables d'environnement dans `.env.local` :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE=...
   NEXTAUTH_SECRET=...
   STRIPE_SECRET_KEY=...
   STRIPE_WEBHOOK_SECRET=...
   ```
4. Lance le serveur :
   ```bash
   npm run dev
   ```

## Structure du projet

- `app/` : pages Next.js (accueil, auth, favoris, profil, premium...)
- `components/` : composants React réutilisables
- `lib/` : logique d'authentification
- `public/` : images et assets
- `api/` : routes API (auth, favoris, profil, Stripe...)

## Démo

- [Lien Vercel](https://meteonext.vercel.app) *(à compléter)*
- ![screenshot](public/images/logometeoblanc.png)

## Choix techniques

- **Next.js 15** (App Router)
- **Supabase** (base de données, auth)
- **NextAuth** (gestion session JWT)
- **Stripe** (paiement premium)
- **Tailwind CSS** (UI moderne)

## Fonctionnement Premium

- Paiement Stripe → webhook → mise à jour du champ `is_premium` dans Supabase
- Limite de favoris levée et prévisions 5 jours débloquées

## Sécurité

- Toutes les routes API vérifient la session utilisateur
- Webhook Stripe sécurisé par signature

## Auteur

Valentin Cappelle

---

> Ce projet est un exemple complet d’application Next.js moderne, prêt à être déployé sur Vercel.
