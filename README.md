# Kafka Chat — projet unique (backend + frontend)

Version consolidée en **un seul projet** : un backend Node/Express qui gère
l'authentification (JWT), publie et consomme les événements Kafka, et
diffuse les messages en direct via WebSocket ; un frontend React (Vite)
avec Login / Register / Chat.

## Architecture

```
kafka-chat-app/
├── docker-compose.yml       <- Kafka (KRaft), Kafka UI, MySQL
├── backend/
│   ├── server.js             (Express + WebSocket, même port)
│   ├── kafka.js               (producer + consumer kafkajs)
│   ├── db.js                  (pool MySQL + création des tables)
│   ├── init.sql
│   ├── routes/auth.js         (/register, /login)
│   ├── middleware/authMiddleware.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx             (routes: /login, /register, /chat)
    │   ├── ProtectedRoute.jsx
    │   ├── pages/Login.jsx
    │   ├── pages/Register.jsx
    │   ├── pages/Chat.jsx
    │   └── services/api.js
    └── .env
```

## Ce qui a été corrigé / ajouté par rapport à tes fichiers d'origine

- **Routes d'authentification manquantes** : `server.js` n'avait qu'un
  `/send` ; ajout de `/register` et `/login` (`routes/auth.js`), avec
  hachage du mot de passe (`bcryptjs`) et JWT (`jsonwebtoken`).
- **Table `users`** créée automatiquement (`db.js` / `init.sql`) — elle
  n'existait pas du tout avant.
- **Consommateur Kafka manquant** : `kafka.js` n'avait qu'un producer.
  Ajout d'un `consumer` qui persiste chaque événement dans MySQL et le
  transmet au WebSocket.
- **WebSocket manquant côté Node** : `Chat.jsx` se connectait à
  `ws://localhost:8765`, qui n'existait nulle part dans ce stack.
  Le WebSocket est maintenant intégré au même serveur Express (`ws`),
  sur le **même port** que l'API — un seul processus, un seul port.
- **`/send` protégé par JWT** : le nom d'utilisateur est extrait du token
  côté serveur (jamais fait confiance au client), évitant qu'un
  utilisateur usurpe l'identité d'un autre.
- **Routing React** : `App.jsx` était encore le template par défaut de
  Vite. Il gère maintenant les routes `/login`, `/register`, `/chat`
  (protégée), avec un `ProtectedRoute` basé sur la présence du token.
- **`api.js`** enrichi avec la gestion du token (stockage, lecture,
  suppression) et une fonction `sendMessage`.
- **CSS nettoyé** : suppression du contenu du template Vite (hero,
  next-steps, liens GitHub/Discord…) au profit de styles simples pour
  les formulaires et le chat.

## Lancer le projet

**1. Infrastructure (Kafka + MySQL) :**

```bash
docker compose up -d
```

**2. Backend :**

```bash
cd backend
cp .env.example .env      # ajuster si besoin (mot de passe MySQL, JWT_SECRET…)
npm install
npm run dev
```

Le backend écoute sur `http://localhost:5000` (API **et** WebSocket sur
le même port).

**3. Frontend :**

```bash
cd frontend
npm install
npm run dev
```

Ouvrir l'URL indiquée par Vite (`http://localhost:5173` par défaut).

## Scénario de démo

1. Créer un compte sur `/register`.
2. Se connecter sur `/login` → un JWT est stocké côté client.
3. Sur `/chat`, envoyer un message : il est publié sur Kafka
   (`chat-topic`), consommé par le backend, sauvegardé en base MySQL,
   puis rediffusé en direct à tous les clients connectés via WebSocket.
4. Ouvrir un deuxième onglet connecté avec un autre compte pour voir la
   diffusion en temps réel entre deux "utilisateurs".

## Notes de sécurité (pour la présentation du stage)

- Les mots de passe ne sont jamais stockés en clair (`bcryptjs`).
- Le nom d'utilisateur associé à un message vient du JWT décodé côté
  serveur, pas d'un champ envoyé par le client.
- `JWT_SECRET` doit être changé et gardé secret en production (ne jamais
  committer le vrai `.env`, seul `.env.example` est versionné).
