import express from "express";
import passport from "#lib/oauth";
import {
  initiateGoogleOAuth,
  handleGoogleCallback,
  initiateGitHubOAuth,
  handleGitHubCallback,
} from "#controllers/oauth.controller";

const router = express.Router();

/**
 * GET /api/oauth/google
 * Redirige l'utilisateur vers la page de connexion Google
 * Passport gère automatiquement la redirection avec les paramètres OAuth
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
  initiateGoogleOAuth
);

/**
 * GET /api/oauth/google/callback
 * Callback de Google - Passport valide le code d'autorisation et remplit req.user
 * Ensuite, le contrôleur traite la création/liaison de l'utilisateur
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=google_auth_failed",
  }),
  handleGoogleCallback
);

/**
 * GET /api/oauth/github
 * Redirige l'utilisateur vers la page de connexion GitHub
 * Passport gère automatiquement la redirection avec les paramètres OAuth
 */
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  }),
  initiateGitHubOAuth
);

/**
 * GET /api/oauth/github/callback
 * Callback de GitHub - Passport valide le code d'autorisation et remplit req.user
 * Ensuite, le contrôleur traite la création/liaison de l'utilisateur
 */
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login?error=github_auth_failed",
  }),
  handleGitHubCallback
);

export default router;
