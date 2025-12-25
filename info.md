# Division des Tâches pour le Projet API d'Authentification

## 👥 **Membre 1 : Système d'Authentification de Base & JWT**
**Responsabilités principales :**
- Implémenter l'inscription et connexion basiques
- Gestion complète des tokens JWT (access + refresh)
- Middleware d'authentification pour protéger les routes
- Système de déconnexion et blacklist des tokens

**Fichiers à créer/modifier :**
```
src/controllers/auth.controller.js
src/services/auth.service.js
src/schemas/auth.schema.js
src/middlewares/auth.js (extension)
src/lib/jwt.js (amélioration)
src/routes/auth.routes.js (complétion)
```

**Étapes immédiates :**
1. Étendre `src/lib/jwt.js` pour gérer access + refresh tokens
2. Créer `src/services/auth.service.js` avec méthodes register/login/logout
3. Implémenter le middleware d'authentification complet
4. Créer les endpoints POST `/api/auth/register`, `/login`, `/logout`, `/refresh`

---

## 👥 **Membre 2 : Système Email & Gestion des Mots de Passe**
**Responsabilités principales :**
- Vérification d'email (envoi + validation)
- Réinitialisation de mot de passe oublié
- Changement de mot de passe pour utilisateur connecté
- Service d'envoi d'emails (mocké ou réel)

**Fichiers à créer/modifier :**
```
src/controllers/email.controller.js
src/controllers/password.controller.js
src/services/email.service.js
src/services/password.service.js
src/routes/email.routes.js
src/routes/password.routes.js
```

**Étapes immédiates :**
1. Créer le service d'email avec Nodemailer
2. Implémenter la génération/validation de tokens de vérification
3. Créer endpoints POST `/api/auth/verify-email`, `/resend-verification`
4. Implémenter POST `/api/password/forgot`, `/reset`, `/change`

---

## 👥 **Membre 3 : Intégration OAuth (Google/GitHub)**
**Responsabilités principales :**
- Configuration OAuth avec Google et GitHub
- Gestion des callbacks et création de compte OAuth
- Liaison des comptes OAuth avec les utilisateurs existants
- Middleware pour l'authentification OAuth

**Fichiers à créer/modifier :**
```
src/controllers/oauth.controller.js
src/services/oauth.service.js
src/lib/oauth.js
src/routes/oauth.routes.js
src/middlewares/oauth.js
```

**Étapes immédiates :**
1. Créer des apps OAuth sur Google Cloud Console et GitHub
2. Installer et configurer Passport.js ou librairie OAuth2
3. Implémenter GET `/api/oauth/google` et `/api/oauth/github`
4. Gérer les callbacks et création d'utilisateurs OAuth

---

## 👥 **Membre 4 : 2FA & Fonctionnalités de Sécurité**
**Responsabilités principales :**
- Authentification à deux facteurs (TOTP)
- Rate limiting contre les attaques brute-force
- Historique des connexions
- Gestion des sessions actives

**Fichiers à créer/modifier :**
```
src/controllers/two-factor.controller.js
src/controllers/session.controller.js
src/lib/two-factor.js
src/middlewares/rate-limit.js
src/services/session.service.js
```

**Étapes immédiates :**
1. Implémenter la génération/validation de codes TOTP
2. Créer middleware de rate limiting global
3. Implémenter la journalisation des tentatives de connexion
4. Créer endpoints pour gérer les sessions : GET/DELETE `/api/sessions`

---

## 👥 **Membre 5 : Gestion de Profil & Coordination**
**Responsabilités principales :**
- CRUD du profil utilisateur
- Suppression de compte (soft delete)
- Documentation et collection API (Yaak/Postman)
- Tests et validation globale

**Fichiers à créer/modifier :**
```
src/controllers/profile.controller.js
src/services/profile.service.js
README.md (complet)
docs/ (dossier de documentation)
tests/ (dossier de tests)
```

**Étapes immédiates :**
1. Implémenter GET/PUT/DELETE `/api/profile`
2. Créer la collection Yaak/Postman complète
3. Rédiger le README détaillé
4. Mettre en place des tests basiques

---