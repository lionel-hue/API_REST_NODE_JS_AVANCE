# README.md pour les Collaborateurs

```markdown
# API d'Authentification - Node.js/Express

## 📋 Description du Projet
API REST complète d'authentification avec multiples méthodes d'authentification pour un projet universitaire.

## 🚀 Installation Rapide

### Prérequis
- Node.js v22+
- npm ou pnpm
- Git
- [Yaak](https://yaak.app/***REMOVED*** pour tester l'API

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd API_REST_NODE_JS_AVANCE
```

### 2. Installer les dépendances
```bash
npm install
# ou avec pnpm
pnpm install
```

### 3. Configuration de l'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos configurations
nano .env
```

### 4. Initialiser la base de données
```bash
# Générer le client Prisma
npm run db:generate

# Créer/initialiser la base de données
npm run db:push

# (Optionnel***REMOVED*** Ouvrir l'interface Prisma Studio
npm run db:studio
```

### 5. Lancer le serveur
```bash
# Mode développement (avec rechargement automatique***REMOVED***
npm run dev

# Mode production
npm start
```

## 📁 Structure du Projet
```
API_REST_NODE_JS_AVANCE/
├── prisma/              # Configuration de la base de données
│   ├── schema.prisma    # Modèles de données
│   └── migrations/      # Migrations de base de données
├── src/
│   ├── config/          # Configuration (variables d'environnement***REMOVED***
│   ├── controllers/     # Gestionnaires de requêtes HTTP
│   ├── dto/            # Objets de transfert de données
│   ├── lib/            # Bibliothèques et utilitaires
│   ├── middlewares/    # Middlewares Express
│   ├── routes/         # Définitions des routes
│   ├── schemas/        # Schémas de validation (Zod***REMOVED***
│   ├── services/       # Logique métier
│   └── index.js        Point d'entrée de l'application
├── .env.example        # Modèle de variables d'environnement
├── .gitignore          # Fichiers ignorés par Git
└── package.json        # Dépendances et scripts
```

## 🔧 Scripts Disponibles
```bash
npm run dev      # Lance le serveur en mode développement
npm start n       # Lance le serveur en mode production
pm run db:generate  # Génère le client Prisma
npm run db:push      # Synchronise la BDD avec le schéma
npm run db:studio    # Ouvre Prisma Studio (interface web***REMOVED***
```

## 🌐 Variables d'Environnement (.env***REMOVED***
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=votre_super_secret_jwt_32_caracteres_minimum
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OAuth (pour le membre 3***REMOVED***
GOOGLE_CLIENT_ID=votre_client_id_google
GOOGLE_CLIENT_SECRET=votre_client_secret_google
GITHUB_CLIENT_ID=votre_client_id_github
GITHUB_CLIENT_SECRET=votre_client_secret_github

# Email (pour le membre 2***REMOVED***
EMAIL_SMTP_HOST=smtp.mailtrap.io
EMAIL_SMTP_PORT=2525
EMAIL_USERNAME=votre_username
EMAIL_PASSWORD=votre_password

APP_URL=http://localhost:3000
```

## 📚 Base de Données
Le projet utilise **SQLite** avec **Prisma ORM** :
- Schéma : `prisma/schema.prisma`
- Client généré : `node_modules/.prisma/client`
- Fichier BDD : `prisma/dev.db`

## 🛠️ Workflow de Développement

### Pour chaque membre :
1. **Créer une branche** pour votre fonctionnalité :
```bash
git checkout -b feat/votre-nom-fonctionnalite
# Exemple : git checkout -b feat/karim-oauth
```

2. **Travailler sur votre partie** selon la division des tâches

3. **Commiter régulièrement** :
```bash
git add .
git commit -m "feat: ajout de l'authentification OAuth Google"
```

4. **Pousser votre branche** :
```bash
git push origin feat/votre-nom-fonctionnalite
```

5. **Créer une Pull Request** sur GitHub/GitLab

### Règles de commit :
- `feat:` pour les nouvelles fonctionnalités
- `fix:` pour les corrections de bugs
- `docs:` pour la documentation
- `refactor:` pour le refactoring
- `test:` pour les tests

## 🔗 Points de Terminaison API (Endpoints***REMOVED***

### Authentification de base
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/refresh` - Rafraîchir token

### Email
- `POST /api/auth/verify-email` - Vérifier email
- `POST /api/auth/resend-verification` - Renvoyer email de vérification

### Mots de passe
- `POST /api/password/forgot` - Mot de passe oublié
- `POST /api/password/reset` - Réinitialiser mot de passe
- `PUT /api/password/change` - Changer mot de passe

### OAuth
- `GET /api/oauth/google` - Connexion Google
- `GET /api/oauth/google/callback` - Callback Google
- `GET /api/oauth/github` - Connexion GitHub
- `GET /api/oauth/github/callback` - Callback GitHub

### 2FA
- `POST /api/2fa/enable` - Activer 2FA
- `POST /api/2fa/disable` - Désactiver 2FA
- `POST /api/2fa/verify` - Vérifier code 2FA

### Sessions
- `GET /api/sessions` - Lister sessions actives
- `DELETE /api/sessions/:id` - Révoquer une session
- `DELETE /api/sessions/others` - Révoquer toutes les autres sessions

### Profil
- `GET /api/profile` - Consulter profil
- `PUT /api/profile` - Modifier profil
- `DELETE /api/profile` - Supprimer compte

## 🧪 Tester l'API
Utiliser **Yaak** ou **Postman** :
1. Importer la collection dans le dossier `docs/`
2. Configurer l'environnement avec `baseUrl = http://localhost:3000`
3. Tester les endpoints dans l'ordre logique

## 📞 Communication
- **Discord/Slack** : Pour les discussions quotidiennes
- **Réunions** : Tous les jours à 10h pour le point quotidien
- **Code Review** : Revue obligatoire avant merge

## 🗓️ Dates Importantes
- **10 Janvier** : Date de rendu finale
- **Chaque vendredi** : Revue d'avancement
- **3 Janvier** : Intégration complète de toutes les fonctionnalités

## ❓ Besoin d'aide ?
1. Consulter la documentation dans `docs/`
2. Poser vos questions dans le canal dédié
3. Contacter le responsable de votre section

---

**Bonne chance à tous !** 🚀
```

---

# Plan d'Action Immédiat pour Chaque Membre

**À faire aujourd'hui :**
1. **Tous** : Cloner le repo et exécuter `npm install`
2. **Tous** : Créer votre branche de fonctionnalité
3. **Tous** : Lire et comprendre la partie qui vous concerne
4. **Membre 5** : Créer le README.md et .gitignore
5. **Tous** : Commencer l'implémentation de vos premiers endpoints

**D'ici demain :**
- Avoir au moins 2 endpoints fonctionnels par membre
- Avoir une première version de la collection Yaak/Postman
- Avoir le schéma Prisma complet et synchronisé

Vous êtes prêts ? Commencez maintenant ! 💪