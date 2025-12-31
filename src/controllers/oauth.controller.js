import { signAccessToken, signRefreshToken } from "#lib/jwt";
import { findOrCreateOAuthUser } from "#services/oauth.service";
import { logger } from "#lib/logger";
import prisma from "#lib/prisma";

/**
 * Initie la redirection vers Google OAuth
 * Passport gère automatiquement la redirection
 */
export const initiateGoogleOAuth = (req, res) => {
  logger.info("Google OAuth initiation request");
  // Passport middleware gère la redirection
};

/**
 * Callback Google OAuth - Traite la réponse de Google et crée/lie l'utilisateur
 * @param {Object} req - Requête Express avec user depuis Passport
 * @param {Object} res - Réponse Express
 */
export const handleGoogleCallback = async (req, res) => {
  try {
    logger.info("Google OAuth callback received");

    // Passport a déjà authentifié et mis en place req.user
    if (!req.user) {
      logger.warn("No user in callback request");
      return res.status(401).json({
        success: false,
        message: "Authentification échouée",
      });
    }

    // Trouver ou créer l'utilisateur OAuth
    const user = await findOrCreateOAuthUser({
      provider: "google",
      id: req.user.id,
      profile: req.user.profile,
    });

    if (!user) {
      logger.error("Failed to create/find OAuth user");
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la création du compte",
      });
    }

    // Récupérer les tokens depuis la BD pour s'assurer que c'est à jour
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { oauthAccounts: true },
    });

    // Générer les tokens JWT
    const accessToken = await signAccessToken({
      id: updatedUser.id,
      email: updatedUser.email,
    });

    const refreshToken = await signRefreshToken({
      id: updatedUser.id,
      email: updatedUser.email,
    });

    // Sauvegarder le refresh token en BD (optionnel, mais recommandé)
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: updatedUser.id,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
    });

    logger.info(`Google OAuth user authenticated: ${updatedUser.id}`);

    // Retourner les tokens
    return res.json({
      success: true,
      message: "Authentification Google réussie",
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          oauthProviders: updatedUser.oauthAccounts.map((acc) => acc.provider),
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error(`Google OAuth callback error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'authentification",
      error: error.message,
    });
  }
};

/**
 * Initie la redirection vers GitHub OAuth
 * Passport gère automatiquement la redirection
 */
export const initiateGitHubOAuth = (req, res) => {
  logger.info("GitHub OAuth initiation request");
  // Passport middleware gère la redirection
};

/**
 * Callback GitHub OAuth - Traite la réponse de GitHub et crée/lie l'utilisateur
 * @param {Object} req - Requête Express avec user depuis Passport
 * @param {Object} res - Réponse Express
 */
export const handleGitHubCallback = async (req, res) => {
  try {
    logger.info("GitHub OAuth callback received");

    // Passport a déjà authentifié et mis en place req.user
    if (!req.user) {
      logger.warn("No user in callback request");
      return res.status(401).json({
        success: false,
        message: "Authentification échouée",
      });
    }

    // Trouver ou créer l'utilisateur OAuth
    const user = await findOrCreateOAuthUser({
      provider: "github",
      id: req.user.id,
      profile: req.user.profile,
    });

    if (!user) {
      logger.error("Failed to create/find OAuth user");
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la création du compte",
      });
    }

    // Récupérer les tokens depuis la BD pour s'assurer que c'est à jour
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { oauthAccounts: true },
    });

    // Générer les tokens JWT
    const accessToken = await signAccessToken({
      id: updatedUser.id,
      email: updatedUser.email,
    });

    const refreshToken = await signRefreshToken({
      id: updatedUser.id,
      email: updatedUser.email,
    });

    // Sauvegarder le refresh token en BD (optionnel, mais recommandé)
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: updatedUser.id,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
    });

    logger.info(`GitHub OAuth user authenticated: ${updatedUser.id}`);

    // Retourner les tokens
    return res.json({
      success: true,
      message: "Authentification GitHub réussie",
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          oauthProviders: updatedUser.oauthAccounts.map((acc) => acc.provider),
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error(`GitHub OAuth callback error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'authentification",
      error: error.message,
    });
  }
};
