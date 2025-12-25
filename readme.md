# TP - NodeJS + Express

---

**Travail en groupe** : 4 à 5 personnes

**Durée** : 3 semaines

**Rendu final** :  le samedi 10 Janvier à 00h 

[**Base de donnée**](https://dbdiagram.io/d/authentication-674f2080e9daa85aca85b6ec)

---

## Objectif

Implémenter une API REST d'authentification complète intégrant plusieurs méthodes d'authentification.

---

## Fonctionnalités à Implémenter

### Authentification de Base

- Inscription
- Connexion
- Déconnexion
- Refresh token
- Mot de passe oublié (envoi d'email)
- Réinitialisation du mot de passe
- Changement de mot de passe (utilisateur connecté)

### Vérification Email

- Vérification du compte par email
- Renvoi de l'email de vérification

### Authentification OAuth

- Connexion via Google ou GitHub (un seul provider au choix)

### Authentification à Deux Facteurs (2FA)

- Activation du 2FA
- Désactivation du 2FA
- Vérification du code 2FA à la connexion

### Gestion des Sessions

- Lister ses sessions actives
- Révoquer une session spécifique
- Révoquer toutes les autres sessions

### Gestion du Profil

- Consulter son profil
- Modifier son profil
- Supprimer son compte

### Sécurité

- Protection contre le brute-force (rate limiting)
- Historique des connexions (date, IP, appareil)

---

## Modèle de Base de Données

### User

Table principale des utilisateurs.

- `emailVerifiedAt` : date de vérification de l'email (null = non vérifié)
- `twoFactorEnabledAt` : date d'activation du 2FA (null = désactivé)
- `disabledAt` : date de désactivation du compte (null = actif)
- `password` : peut être null si l'utilisateur s'inscrit via OAuth

### OAuthAccount

Comptes OAuth liés (Google ou GitHub).

- La combinaison `provider` + `providerId` est unique

### RefreshToken

Tokens de rafraîchissement JWT. Sert aussi à gérer les sessions actives.

- Fonctionne en **whitelist** : seuls les tokens présents dans la table sont valides
- `revokedAt` : date de révocation (null = token actif)
- Un token est valide si : présent en base ET `revokedAt` est null ET `expiresAt` > maintenant
- Pour lister les sessions actives : lister les RefreshTokens non révoqués
- Pour révoquer une session : mettre à jour `revokedAt` avec la date actuelle

### BlacklistedAccessToken

Access tokens révoqués avant leur expiration naturelle.

- Fonctionne en **blacklist** : les tokens présents ici sont invalides
- À chaque requête authentifiée, vérifier si l'access token est dans cette table
- `expiresAt` : conserver la date d'expiration originale pour nettoyer la table périodiquement

### VerificationToken

Token envoyé par email pour vérifier l'adresse email. Expire après un certain temps.

### PasswordResetToken

Token pour réinitialiser le mot de passe oublié. Envoyé par email, expire après un certain temps.

### LoginHistory

Historique des tentatives de connexion.

- `success` : true si connexion réussie, false si échouée
- Utile pour détecter les tentatives suspectes

---

## Livrables

1. Repository Git avec un historique de commits clair
2. README avec instructions d'installation et d'utilisation
3. Collection Yaak ou Postman

**NB:** Chaque membre du groupe doit contribuer (les commits seront vérifiés)