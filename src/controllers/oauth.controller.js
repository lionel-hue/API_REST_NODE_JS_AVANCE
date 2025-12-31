import { signAccessToken, signRefreshToken } from "#lib/jwt";
import { findOrCreateOAuthUser } from "#services/oauth.service";
import { logger } from "#lib/logger";
import prisma from "#lib/prisma";

/**
 * Initie la redirection vers Google OAuth
 * Passport gère automatiquement la redirection
 */
export const initiateGoogleOAuth = (req, res***REMOVED*** => {
  logger.info("Google OAuth initiation request"***REMOVED***;
  // Passport middleware gère la redirection
};

/**
 * Callback Google OAuth - Traite la réponse de Google et crée/lie l'utilisateur
 * @param {Object} req - Requête Express avec user depuis Passport
 * @param {Object} res - Réponse Express
 */
export const handleGoogleCallback = async (req, res***REMOVED*** => {
  try {
    logger.info("Google OAuth callback received"***REMOVED***;

    // Passport a déjà authentifié et mis en place req.user
    if (!req.user***REMOVED*** {
      logger.warn("No user in callback request"***REMOVED***;
      return res.status(401***REMOVED***.json({
        success: false,
        message: "Authentification échouée",
      }***REMOVED***;
    }

    // Trouver ou créer l'utilisateur OAuth
    const user = await findOrCreateOAuthUser({
      provider: "google",
      id: req.user.id,
      profile: req.user.profile,
    }***REMOVED***;

    if (!user***REMOVED*** {
      logger.error("Failed to create/find OAuth user"***REMOVED***;
      return res.status(500***REMOVED***.json({
        success: false,
        message: "Erreur lors de la création du compte",
      }***REMOVED***;
    }

    // Récupérer les tokens depuis la BD pour s'assurer que c'est à jour
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { oauthAccounts: true },
    }***REMOVED***;

    // Générer les tokens JWT
    const accessToken = await signAccessToken({
      id: updatedUser.id,
      email: updatedUser.email,
    }***REMOVED***;

    const refreshToken = await signRefreshToken({
      id: updatedUser.id,
      email: updatedUser.email,
    }***REMOVED***;

    // Sauvegarder le refresh token en BD (optionnel, mais recommandé***REMOVED***
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: updatedUser.id,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now(***REMOVED*** + 7 * 24 * 60 * 60 * 1000***REMOVED***, // 7 jours
      },
    }***REMOVED***;

    logger.info(`Google OAuth user authenticated: ${updatedUser.id}`***REMOVED***;

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
          oauthProviders: updatedUser.oauthAccounts.map((acc***REMOVED*** => acc.provider***REMOVED***,
        },
        accessToken,
        refreshToken,
      },
    }***REMOVED***;
  } catch (error***REMOVED*** {
    logger.error(`Google OAuth callback error: ${error.message}`***REMOVED***;
    return res.status(500***REMOVED***.json({
      success: false,
      message: "Erreur serveur lors de l'authentification",
      error: error.message,
    }***REMOVED***;
  }
};

/**
 * Initie la redirection vers GitHub OAuth
 * Passport gère automatiquement la redirection
 */
export const initiateGitHubOAuth = (req, res***REMOVED*** => {
  logger.info("GitHub OAuth initiation request"***REMOVED***;
  // Passport middleware gère la redirection
};

/**
 * Callback GitHub OAuth - Traite la réponse de GitHub et crée/lie l'utilisateur
 * @param {Object} req - Requête Express avec user depuis Passport
 * @param {Object} res - Réponse Express
 */
export const handleGitHubCallback = async (req, res***REMOVED*** => {
  try {
    logger.info("GitHub OAuth callback received"***REMOVED***;

    // Passport a déjà authentifié et mis en place req.user
    if (!req.user***REMOVED*** {
      logger.warn("No user in callback request"***REMOVED***;
      return res.status(401***REMOVED***.json({
        success: false,
        message: "Authentification échouée",
      }***REMOVED***;
    }

    // Trouver ou créer l'utilisateur OAuth
    const user = await findOrCreateOAuthUser({
      provider: "github",
      id: req.user.id,
      profile: req.user.profile,
    }***REMOVED***;

    if (!user***REMOVED*** {
      logger.error("Failed to create/find OAuth user"***REMOVED***;
      return res.status(500***REMOVED***.json({
        success: false,
        message: "Erreur lors de la création du compte",
      }***REMOVED***;
    }

    // Récupérer les tokens depuis la BD pour s'assurer que c'est à jour
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { oauthAccounts: true },
    }***REMOVED***;

    // Générer les tokens JWT
    const accessToken = await signAccessToken({
      id: updatedUser.id,
      email: updatedUser.email,
    }***REMOVED***;

    const refreshToken = await signRefreshToken({
      id: updatedUser.id,
      email: updatedUser.email,
    }***REMOVED***;

    // Sauvegarder le refresh token en BD (optionnel, mais recommandé***REMOVED***
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: updatedUser.id,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now(***REMOVED*** + 7 * 24 * 60 * 60 * 1000***REMOVED***, // 7 jours
      },
    }***REMOVED***;

    logger.info(`GitHub OAuth user authenticated: ${updatedUser.id}`***REMOVED***;

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
          oauthProviders: updatedUser.oauthAccounts.map((acc***REMOVED*** => acc.provider***REMOVED***,
        },
        accessToken,
        refreshToken,
      },
    }***REMOVED***;
  } catch (error***REMOVED*** {
    logger.error(`GitHub OAuth callback error: ${error.message}`***REMOVED***;
    return res.status(500***REMOVED***.json({
      success: false,
      message: "Erreur serveur lors de l'authentification",
      error: error.message,
    }***REMOVED***;
  }
};
