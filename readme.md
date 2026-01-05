# API d'Authentification Avancée - Node.js/Express

## 📋 Description
API REST complète d'authentification avec multiples méthodes d'authentification pour un projet universitaire. Cette API implémente un système d'authentification moderne avec support de JWT, OAuth 2.0, 2FA, gestion des sessions et plus encore.

## 🚀 Fonctionnalités

### ✅ Authentification Multi-méthodes
- **Authentification classique** : Email/mot de passe avec tokens JWT
- **OAuth 2.0** : Google et GitHub
- **2FA (TOTP)** : Authentification à deux facteurs avec QR codes
- **Refresh tokens** : Rotation sécurisée des tokens

### ✅ Sécurité Renforcée
- **Rate limiting** : Protection contre les attaques brute-force
- **Validation Zod** : Validation type-safe des données
- **Email verification** : Vérification obligatoire des emails
- **Session management** : Gestion multi-appareils
- **Password policies** : Réinitialisation sécurisée

### ✅ Gestion Utilisateur Complète
- Profil utilisateur (CRUD)
- Suppression de compte (soft delete)
- Historique des connexions
- Gestion des sessions actives

## 📁 Structure du Projet

```
API_REST_NODE_JS_AVANCE/
├── src/
│   ├── config/           # Configuration d'environnement
│   │   └── env.js       # Variables d'environnement
│   ├── controllers/      # Contrôleurs Express (8 fichiers)
│   │   ├── auth.controller.js
│   │   ├── email.controller.js
│   │   ├── oauth.controller.js
│   │   ├── password.controller.js
│   │   ├── profile.controller.js
│   │   ├── session.controller.js
│   │   ├── two-factor.controller.js
│   │   └── user.controller.js
│   ├── dto/             # Data Transfer Objects
│   │   └── user.dto.js
│   ├── lib/             # Bibliothèques et utilitaires (9 fichiers)
│   │   ├── async-handler.js
│   │   ├── exceptions.js
│   │   ├── jwt.js
│   │   ├── logger.js
│   │   ├── oauth.js
│   │   ├── password.js
│   │   ├── prisma.js
│   │   ├── two-factor.js
│   │   └── validate.js
│   ├── middlewares/     # Middlewares Express (4 fichiers)
│   │   ├── auth.js
│   │   ├── error-handler.js
│   │   ├── not-found.js
│   │   └── rate-limit.js
│   ├── routes/          # Routes API (8 fichiers)
│   │   ├── auth.routes.js
│   │   ├── email.routes.js
│   │   ├── oauth.routes.js
│   │   ├── password.routes.js
│   │   ├── profile.routes.js
│   │   ├── session.routes.js
│   │   ├── two-factor.routes.js
│   │   └── user.routes.js
│   ├── schemas/         # Schémas de validation Zod (3 fichiers)
│   │   ├── auth.schema.js
│   │   ├── email-password.schema.js
│   │   └── user.schema.js
│   ├── services/        # Services métier (10 fichiers)
│   │   ├── auth.service.js
│   │   ├── email.service.js
│   │   ├── login-history.js
│   │   ├── oauth.service.js
│   │   ├── password.service.js
│   │   ├── profile.service.js
│   │   ├── session.service.js
│   │   ├── user.service.js
│   │   └── verification.service.js
│   └── index.js         # Point d'entrée de l'application
├── prisma/
│   └── schema.prisma    # Modèles de données Prisma
├── docs/
│   └── API.md          # Documentation complète de l'API
├── .env.example        # Template de variables d'environnement
├── package.json        # Dépendances et scripts
└── README.md           # Ce fichier
```

## 🛠️ Technologies Utilisées

- **Runtime** : Node.js v22+
- **Framework** : Express.js 5.x
- **Base de données** : SQLite avec Prisma ORM
- **Authentification** : JOSE (JWT), Passport.js (OAuth)
- **Validation** : Zod pour la validation type-safe
- **Sécurité** : Argon2 pour le hachage, helmet, rate limiting
- **Logging** : Pino pour les logs structurés
- **Email** : Nodemailer avec support SMTP/Ethereal
- **2FA** : Speakeasy (TOTP) avec QR codes

## 🔧 Installation Rapide

### Prérequis
- Node.js v22+ installé
- npm ou pnpm
- Git

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
# Copier le template
cp .env.example .env

# Éditer avec vos configurations
nano .env
```

### 4. Configurer la base de données
```bash
# Générer le client Prisma
npm run db:generate

# Synchroniser le schéma avec la base de données
npm run db:push

# (Optionnel) Ouvrir l'interface Prisma Studio
npm run db:studio
```

### 5. Lancer le serveur
```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm start
```

## 📦 Scripts NPM

```bash
npm run dev          # Lance le serveur en mode développement
npm start            # Lance le serveur en mode production
npm run db:generate  # Génère le client Prisma
npm run db:push      # Synchronise la BDD avec le schéma
npm run db:migrate   # Exécute les migrations
npm run db:studio    # Ouvre Prisma Studio (interface web)
```

## 🔌 Points de Terminaison API

### Authentification (`/api/auth`)
- `POST /register` - Inscription d'un nouvel utilisateur
- `POST /login` - Connexion avec email/mot de passe
- `POST /logout` - Déconnexion (révocation des tokens)
- `POST /refresh` - Rafraîchir les tokens JWT

### Email (`/api/auth`)
- `GET/POST /verify-email` - Vérifier l'email avec token
- `POST /resend-verification` - Renvoyer l'email de vérification

### Mots de passe (`/api/password`)
- `POST /forgot` - Demander une réinitialisation
- `GET/POST /reset` - Réinitialiser le mot de passe
- `PUT /change` - Changer le mot de passe (authentifié)
- `POST /set` - Définir un mot de passe (utilisateurs OAuth)

### OAuth (`/api/oauth`)
- `GET /google` - Connexion avec Google OAuth
- `GET /google/callback` - Callback Google
- `GET /github` - Connexion avec GitHub OAuth
- `GET /github/callback` - Callback GitHub

### Sessions (`/api/sessions`)
- `GET /` - Lister les sessions actives
- `DELETE /:sessionId` - Révoquer une session spécifique
- `DELETE /others` - Révoquer toutes les autres sessions

### 2FA (`/api/2fa`)
- `GET /status` - Statut de l'authentification à deux facteurs
- `POST /enable` - Activer la 2FA (génère QR code)
- `POST /verify` - Vérifier et activer avec un token
- `POST /disable` - Désactiver la 2FA

### Profil (`/api/profile`)
- `GET /` - Récupérer le profil utilisateur
- `PUT /` - Mettre à jour le profil
- `DELETE /` - Supprimer le compte (soft delete)

## 🔐 Variables d'Environnement

Créez un fichier `.env` à la racine :

```env
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=votre_super_secret_jwt_de_32_caracteres_minimum
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OAuth (Google)
GOOGLE_CLIENT_ID=votre_client_id_google
GOOGLE_CLIENT_SECRET=votre_client_secret_google

# OAuth (GitHub)
GITHUB_CLIENT_ID=votre_client_id_github
GITHUB_CLIENT_SECRET=votre_client_secret_github

# URL de l'application (pour les callbacks OAuth)
APP_URL=http://localhost:3000

# Email (Mailtrap recommandé pour le développement)
EMAIL_SMTP_HOST=smtp.mailtrap.io
EMAIL_SMTP_PORT=2525
EMAIL_USERNAME=votre_username_mailtrap
EMAIL_PASSWORD=votre_password_mailtrap
EMAIL_FROM=noreply@authapi.com
EMAIL_ENABLED=true
```

## 📊 Modèles de Données (Prisma)

L'API utilise 7 modèles principaux :

1. **User** : Utilisateurs avec informations de profil
2. **OAuthAccount** : Comptes OAuth liés (Google/GitHub)
3. **RefreshToken** : Tokens de rafraîchissement pour les sessions
4. **BlacklistedAccessToken** : Tokens JWT révoqués avant expiration
5. **VerificationToken** : Tokens pour la vérification d'email
6. **PasswordResetToken** : Tokens pour la réinitialisation de mot de passe
7. **LoginHistory** : Historique des tentatives de connexion

## 🧪 Tester l'API

### Avec curl
```bash
# Tester l'endpoint racine
curl http://localhost:3000

# Inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### Avec Yaak/Postman
Importez la collection depuis `docs/API.md` pour tester tous les endpoints.

## 🐛 Dépannage

### Problèmes courants

1. **"Prisma client not generated"**
   ```bash
   npm run db:generate
   ```

2. **"Database not initialized"**
   ```bash
   npm run db:push
   ```

3. **"Invalid OAuth credentials"**
   - Vérifiez vos IDs et secrets dans `.env`
   - Assurez-vous que les URLs de callback sont correctement configurées

4. **"Email not sending"**
   - Vérifiez les credentials SMTP dans `.env`
   - En développement, vérifiez les logs pour les URLs Ethereal

### Logs
Les logs détaillés sont disponibles en mode développement. Activez le mode debug si nécessaire :
```bash
NODE_ENV=development npm run dev
```

## 🔒 Bonnes Pratiques de Sécurité

1. **Ne jamais commettre de secrets** dans le repository
2. **Utiliser des secrets forts** (générez avec `openssl rand -hex 32`)
3. **Activer le rate limiting** en production
4. **Utiliser HTTPS** en production
5. **Valider toutes les entrées utilisateur** avec Zod
6. **Hacher les mots de passe** avec Argon2
7. **Mettre à jour régulièrement** les dépendances

## 📚 Documentation Complète

- **Documentation API** : `docs/API.md` (endpoints détaillés)
- **Schéma de base de données** : `prisma/schema.prisma`
- **Guide d'installation** : Voir section "Installation Rapide" ci-dessus

## 👥 Développement

### Workflow Git
```bash
# Créer une branche pour votre fonctionnalité
git checkout -b feat/nom-fonctionnalite

# Commiter régulièrement
git add .
git commit -m "feat: description de la fonctionnalité"

# Pousser vers GitHub
git push origin feat/nom-fonctionnalite

# Créer une Pull Request
```

### Conventions de code
- **Controllers** : Gèrent les requêtes/réponses HTTP
- **Services** : Contiennent la logique métier
- **Routes** : Définissent les endpoints API
- **Middlewares** : Gèrent les pré/post-traitements
- **Schemas** : Validation des données avec Zod

## 📄 Licence

Projet universitaire - Usage éducatif

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

**Note importante** : Cette API est conçue pour un projet éducatif. En production, des audits de sécurité supplémentaires sont recommandés.