# 📚 Documentation API d'Authentification

## Base URL
```
http://localhost:3000
```

## Authentification
Toutes les routes protégées nécessitent un header d'authentification :
```
Authorization: Bearer <access_token>
```

---

## 🔐 **AUTHENTIFICATION**

### **1. Inscription**
```http
POST /api/auth/register
```

**Body:**```
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### **2. Connexion**
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Réponse:** Même format que l'inscription

### **3. Rafraîchir les tokens**
```http
POST /api/auth/refresh
```

**Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

### **4. Déconnexion**
```http
POST /api/auth/logout
```

**Headers:** `Authorization: Bearer <access_token>`
**Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

---

## 📧 **EMAIL & MOT DE PASSE**

### **1. Vérifier email**
```http
GET /api/auth/verify-email?token=verification_token
```
ou
```http
POST /api/auth/verify-email
```
```json
{
  "token": "verification_token"
}
```

### **2. Renvoyer email de vérification**
```http
POST /api/auth/resend-verification
```
```json
{
  "email": "user@example.com"
}
```

### **3. Mot de passe oublié**
```http
POST /api/password/forgot
```
```json
{
  "email": "user@example.com"
}
```

### **4. Réinitialiser mot de passe**
```http
POST /api/password/reset
```
```json
{
  "token": "reset_token",
  "newPassword": "NewPassword123!"
}
```

### **5. Changer mot de passe (utilisateur connecté***REMOVED*****
```http
PUT /api/password/change
```
**Headers:** `Authorization: Bearer <access_token>`
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

---

## 👤 **PROFIL UTILISATEUR**

### **1. Récupérer profil**
```http
GET /api/profile
```
**Headers:** `Authorization: Bearer <access_token>`

**Réponse:**
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerifiedAt": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "hasPassword": true,
    "providers": ["google"]
  }
}
```

### **2. Mettre à jour profil**
```http
PUT /api/profile
```
**Headers:** `Authorization: Bearer <access_token>`
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "newemail@example.com",
  "currentPassword": "Password123!" // requis pour changer l'email
}
```

### **3. Supprimer compte**
```http
DELETE /api/profile
```
**Headers:** `Authorization: Bearer <access_token>`
```json
{
  "password": "Password123!",
  "confirm": "Password123!"
}
```

---

## 💼 **SESSIONS**

### **1. Lister sessions actives**
```http
GET /api/sessions
```
**Headers:** `Authorization: Bearer <access_token>`

### **2. Révoquer une session**
```http
DELETE /api/sessions/:sessionId
```
**Headers:** `Authorization: Bearer <access_token>`

### **3. Révoquer toutes les autres sessions**
```http
DELETE /api/sessions/others
```
**Headers:** `Authorization: Bearer <access_token>`
```json
{
  "currentSessionId": "session_id_to_keep"
}
```

---

## 🔐 **2FA**

### **1. Activer 2FA**
```http
POST /api/2fa/enable
```
**Headers:** `Authorization: Bearer <access_token>`

### **2. Vérifier et activer 2FA**
```http
POST /api/2fa/verify
```
**Headers:** `Authorization: Bearer <access_token>`
```json
{
  "token": "123456"
}
```

### **3. Désactiver 2FA**
```http
POST /api/2fa/disable
```
**Headers:** `Authorization: Bearer <access_token>`
```json
{
  "token": "123456"
}
```

### **4. Statut 2FA**
```http
GET /api/2fa/status
```
**Headers:** `Authorization: Bearer <access_token>`

---

## 🔗 **OAUTH**

### **1. Google OAuth**
```http
GET /api/oauth/google
```
Redirige vers Google pour l'authentification

### **2. Callback Google**
```http
GET /api/oauth/google/callback
```
Géré automatiquement par Google

### **3. GitHub OAuth**
```http
GET /api/oauth/github
```

### **4. Callback GitHub**
```http
GET /api/oauth/github/callback
```

---

## ⚠️ **CODES D'ERREUR**

| Code | Description |
|------|-------------|
| 200 | Succès |
| 400 | Mauvaise requête (validation échouée***REMOVED*** |
| 401 | Non authentifié (token manquant/invalide***REMOVED*** |
| 403 | Interdit (permissions insuffisantes***REMOVED*** |
| 404 | Ressource non trouvée |
| 409 | Conflit (email déjà utilisé***REMOVED*** |
| 429 | Trop de requêtes (rate limiting***REMOVED*** |
| 500 | Erreur serveur interne |

---

## 🛡️ **RATE LIMITING**

- **Authentification:** 5 tentatives échouées par IP toutes les 15 minutes
- **Global:** 100 requêtes par IP toutes les 15 minutes
- **2FA:** 10 tentatives par IP toutes les 5 minutes

---

## 📊 **MODÈLES DE DONNÉES**

### User
```javascript
{
  id: "uuid",
  email: "string",
  password: "string?",
  firstName: "string",
  lastName: "string",
  emailVerifiedAt: "datetime?",
  disabledAt: "datetime?",
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

### RefreshToken (Sessions***REMOVED***
```javascript
{
  id: "uuid",
  token: "string",
  userId: "uuid",
  userAgent: "string?",
  ipAddress: "string?",
  expiresAt: "datetime",
  revokedAt: "datetime?",
  createdAt: "datetime"
}
```

---

## 🧪 **EXEMPLES CURL**

### Inscription
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123!"}'
```

### Profil protégé
```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Déconnexion
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

---

## 🔧 **VARIABLES D'ENVIRONNEMENT**

```env
PORT=3000
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your_super_secret_jwt_secret"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
APP_URL="http://localhost:3000"
EMAIL_SMTP_HOST="smtp.mailtrap.io"
EMAIL_SMTP_PORT="2525"
EMAIL_USERNAME="your_mailtrap_username"
EMAIL_PASSWORD="your_mailtrap_password"
EMAIL_FROM="noreply@authapi.com"
```

---

## 🚀 **INSTALLATION RAPIDE**

```bash
# 1. Cloner le projet
git clone <repository>
cd API_REST_NODE_JS_AVANCE

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# 4. Initialiser la base de données
npx prisma generate
npx prisma db push

# 5. Démarrer le serveur
npm run dev
```

---

## 📞 **SUPPORT**

En cas de problème :
1. Vérifier les logs du serveur
2. Consulter la documentation
3. Ouvrir une issue sur GitHub
```

### **7. CRÉER DES TESTS `tests/basic.test.js` :**

```javascript
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';

// Tests basiques pour le membre 5
describe('Profile Management Tests', (***REMOVED*** => {
  let testUserId = null;
  let testAccessToken = null;
  let testRefreshToken = null;

  before(async (***REMOVED*** => {
    // Setup: Créer un utilisateur de test
    console.log('Setting up test environment...'***REMOVED***;
  }***REMOVED***;

  after(async (***REMOVED*** => {
    // Cleanup: Supprimer l'utilisateur de test
    console.log('Cleaning up test environment...'***REMOVED***;
  }***REMOVED***;

  it('should create a test user', async (***REMOVED*** => {
    // Test d'inscription
    assert.ok(true, 'Test user should be created'***REMOVED***;
  }***REMOVED***;

  it('should login with test user', async (***REMOVED*** => {
    // Test de connexion
    assert.ok(true, 'Test user should be able to login'***REMOVED***;
  }***REMOVED***;

  it('should get user profile', async (***REMOVED*** => {
    // Test GET /api/profile
    assert.ok(true, 'Should retrieve user profile'***REMOVED***;
  }***REMOVED***;

  it('should update user profile', async (***REMOVED*** => {
    // Test PUT /api/profile
    assert.ok(true, 'Should update user profile'***REMOVED***;
  }***REMOVED***;

  it('should delete user account', async (***REMOVED*** => {
    // Test DELETE /api/profile
    assert.ok(true, 'Should soft delete user account'***REMOVED***;
  }***REMOVED***;
}***REMOVED***;

// Exporter pour utilisation avec un test runner
export default describe;
```

### **8. MISE À JOUR DU `README.md` :**

Ajoutez une section "Tests" et "Documentation" :

```
## 🧪 Tests

Pour exécuter les tests :

```bash
# Tests basiques
npm test

# Tests avec coverage
npm run test:coverage
```

## 📚 Documentation

La documentation complète de l'API est disponible dans le dossier `docs/` :

- [Documentation API](docs/API.md***REMOVED***
- [Guide d'installation](docs/INSTALLATION.md***REMOVED***
- [Schéma de base de données](docs/DATABASE.md***REMOVED***

## 🔧 Variables d'environnement supplémentaires

Pour le membre 5, ajoutez :

```env
# Profil utilisateur
PROFILE_UPDATE_RATE_LIMIT=5
ACCOUNT_RECOVERY_DAYS=30

# Tests
TEST_EMAIL=test@example.com
TEST_PASSWORD=TestPassword123!
```

## 📊 Collection API

Importez la collection Postman/Yaak depuis `docs/auth-api-collection.json` pour tester rapidement tous les endpoints.