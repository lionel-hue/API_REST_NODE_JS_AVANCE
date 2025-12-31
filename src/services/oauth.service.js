import prisma from "#lib/prisma";
import { logger } from "#lib/logger";

/**
 * Gère ou crée un compte OAuth et retourne l'utilisateur associé
 * @param {Object} oauthData - Données du profil OAuth retournées par le provider
 * @param {string} oauthData.provider - "google" ou "github"
 * @param {string} oauthData.id - ID du profil OAuth
 * @param {Object} oauthData.profile - Profil complet du provider
 * @returns {Promise<Object>} Utilisateur avec ses données
 * @throws {Error} Si erreur lors de la création/liaison du compte
 */
export async function findOrCreateOAuthUser(oauthData***REMOVED*** {
  const { provider, id: providerId, profile } = oauthData;

  try {
    // Vérifier si le compte OAuth existe déjà
    let oauthAccount = await prisma.oAuthAccount.findFirst({
      where: {
        provider,
        providerId: String(providerId***REMOVED***,
      },
      include: {
        user: true,
      },
    }***REMOVED***;

    // Si le compte OAuth existe, retourner l'utilisateur associé
    if (oauthAccount***REMOVED*** {
      logger.info(`OAuth account found for ${provider}:${providerId}`***REMOVED***;
      return oauthAccount.user;
    }

    // Sinon, créer un nouvel utilisateur et lier le compte OAuth
    logger.info(`Creating new user for OAuth ${provider}:${providerId}`***REMOVED***;

    // Extraire les données du profil selon le provider
    let userData = {};
    if (provider === "google"***REMOVED*** {
      userData = {
        email: profile.emails?.[0]?.value || `${providerId}@google.oauth`,
        firstName: profile.name?.givenName || "Google",
        lastName: profile.name?.familyName || "User",
      };
    } else if (provider === "github"***REMOVED*** {
      userData = {
        email: profile.emails?.[0]?.value || `${providerId}@github.oauth`,
        firstName: profile.displayName?.split(" "***REMOVED***[0] || "GitHub",
        lastName: profile.displayName?.split(" "***REMOVED***[1] || "User",
      };
    }

    // Vérifier si un utilisateur existe déjà avec cet email
    let user = await prisma.user.findUnique({
      where: { email: userData.email },
    }***REMOVED***;

    // Si l'utilisateur existe déjà, créer le compte OAuth pour le lier
    if (user***REMOVED*** {
      logger.info(`User already exists with email ${userData.email}, linking OAuth account`***REMOVED***;
      oauthAccount = await prisma.oAuthAccount.create({
        data: {
          provider,
          providerId: String(providerId***REMOVED***,
          userId: user.id,
        },
        include: {
          user: true,
        },
      }***REMOVED***;
      return oauthAccount.user;
    }

    // Sinon, créer un nouvel utilisateur ET le compte OAuth associé
    user = await prisma.user.create({
      data: {
        ...userData,
        oauthAccounts: {
          create: {
            provider,
            providerId: String(providerId***REMOVED***,
          },
        },
      },
      include: {
        oauthAccounts: true,
      },
    }***REMOVED***;

    logger.info(`New user created with OAuth ${provider}:${providerId}`***REMOVED***;
    return user;
  } catch (error***REMOVED*** {
    logger.error(`Error in findOrCreateOAuthUser: ${error.message}`***REMOVED***;
    throw error;
  }
}

/**
 * Lie un compte OAuth à un utilisateur existant (si pas déjà lié***REMOVED***
 * @param {string} userId - ID de l'utilisateur
 * @param {string} provider - "google" ou "github"
 * @param {string} providerId - ID du profil OAuth
 * @returns {Promise<Object>} L'enregistrement OAuthAccount créé ou existant
 */
export async function linkOAuthAccount(userId, provider, providerId***REMOVED*** {
  try {
    // Vérifier si le compte OAuth est déjà lié
    let oauthAccount = await prisma.oAuthAccount.findFirst({
      where: {
        provider,
        providerId: String(providerId***REMOVED***,
      },
    }***REMOVED***;

    if (oauthAccount***REMOVED*** {
      logger.warn(
        `OAuth account ${provider}:${providerId} already linked to another user`
      ***REMOVED***;
      throw new Error("Ce compte OAuth est déjà lié à un autre utilisateur"***REMOVED***;
    }

    // Créer le lien
    oauthAccount = await prisma.oAuthAccount.create({
      data: {
        provider,
        providerId: String(providerId***REMOVED***,
        userId,
      },
    }***REMOVED***;

    logger.info(`OAuth account linked: ${provider}:${providerId} -> user ${userId}`***REMOVED***;
    return oauthAccount;
  } catch (error***REMOVED*** {
    logger.error(`Error in linkOAuthAccount: ${error.message}`***REMOVED***;
    throw error;
  }
}

/**
 * Retourne tous les comptes OAuth liés à un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Liste des comptes OAuth
 */
export async function getUserOAuthAccounts(userId***REMOVED*** {
  try {
    return await prisma.oAuthAccount.findMany({
      where: { userId },
    }***REMOVED***;
  } catch (error***REMOVED*** {
    logger.error(`Error in getUserOAuthAccounts: ${error.message}`***REMOVED***;
    throw error;
  }
}

/**
 * Supprime un compte OAuth lié à un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} provider - "google" ou "github"
 * @returns {Promise<Object>} L'enregistrement supprimé
 */
export async function unlinkOAuthAccount(userId, provider***REMOVED*** {
  try {
    const deleted = await prisma.oAuthAccount.deleteMany({
      where: {
        userId,
        provider,
      },
    }***REMOVED***;

    logger.info(`OAuth account unlinked: ${provider} from user ${userId}`***REMOVED***;
    return deleted;
  } catch (error***REMOVED*** {
    logger.error(`Error in unlinkOAuthAccount: ${error.message}`***REMOVED***;
    throw error;
  }
}
