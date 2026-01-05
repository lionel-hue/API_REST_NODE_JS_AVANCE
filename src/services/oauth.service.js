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
export async function findOrCreateOAuthUser(oauthData) {
  const { provider, id: providerId, profile } = oauthData;

  try {
    // Vérifier si le compte OAuth existe déjà
    let oauthAccount = await prisma.oAuthAccount.findFirst({
      where: {
        provider,
        providerId: String(providerId),
      },
      include: {
        user: true,
      },
    });

    // Si le compte OAuth existe, retourner l'utilisateur associé
    if (oauthAccount) {
      logger.info(`OAuth account found for ${provider}:${providerId}`);
      return oauthAccount.user;
    }

    // Sinon, créer un nouvel utilisateur et lier le compte OAuth
    logger.info(`Creating new user for OAuth ${provider}:${providerId}`);

    // Extraire les données du profil selon le provider
    let userData = {};
    if (provider === "google") {
      userData = {
        email: profile.emails?.[0]?.value || `${providerId}@google.oauth`,
        firstName: profile.name?.givenName || "Google",
        lastName: profile.name?.familyName || "User",
      };
    } else if (provider === "github") {
      userData = {
        email: profile.emails?.[0]?.value || `${providerId}@github.oauth`,
        firstName: profile.displayName?.split(" ")[0] || "GitHub",
        lastName: profile.displayName?.split(" ")[1] || "User",
      };
    }

    // Vérifier si un utilisateur existe déjà avec cet email
    let user = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    // Si l'utilisateur existe déjà, créer le compte OAuth pour le lier
    if (user) {
      logger.info(`User already exists with email ${userData.email}, linking OAuth account`);
      oauthAccount = await prisma.oAuthAccount.create({
        data: {
          provider,
          providerId: String(providerId),
          userId: user.id,
        },
        include: {
          user: true,
        },
      });
      return oauthAccount.user;
    }

    // Sinon, créer un nouvel utilisateur ET le compte OAuth associé
    user = await prisma.user.create({
      data: {
        ...userData,
        oauthAccounts: {
          create: {
            provider,
            providerId: String(providerId),
          },
        },
      },
      include: {
        oauthAccounts: true,
      },
    });

    logger.info(`New user created with OAuth ${provider}:${providerId}`);
    return user;
  } catch (error) {
    logger.error(`Error in findOrCreateOAuthUser: ${error.message}`);
    throw error;
  }
}

/**
 * Lie un compte OAuth à un utilisateur existant (si pas déjà lié)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} provider - "google" ou "github"
 * @param {string} providerId - ID du profil OAuth
 * @returns {Promise<Object>} L'enregistrement OAuthAccount créé ou existant
 */
export async function linkOAuthAccount(userId, provider, providerId) {
  try {
    // Vérifier si le compte OAuth est déjà lié
    let oauthAccount = await prisma.oAuthAccount.findFirst({
      where: {
        provider,
        providerId: String(providerId),
      },
    });

    if (oauthAccount) {
      logger.warn(
        `OAuth account ${provider}:${providerId} already linked to another user`
      );
      throw new Error("Ce compte OAuth est déjà lié à un autre utilisateur");
    }

    // Créer le lien
    oauthAccount = await prisma.oAuthAccount.create({
      data: {
        provider,
        providerId: String(providerId),
        userId,
      },
    });

    logger.info(`OAuth account linked: ${provider}:${providerId} -> user ${userId}`);
    return oauthAccount;
  } catch (error) {
    logger.error(`Error in linkOAuthAccount: ${error.message}`);
    throw error;
  }
}

/**
 * Retourne tous les comptes OAuth liés à un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Liste des comptes OAuth
 */
export async function getUserOAuthAccounts(userId) {
  try {
    return await prisma.oAuthAccount.findMany({
      where: { userId },
    });
  } catch (error) {
    logger.error(`Error in getUserOAuthAccounts: ${error.message}`);
    throw error;
  }
}

/**
 * Supprime un compte OAuth lié à un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} provider - "google" ou "github"
 * @returns {Promise<Object>} L'enregistrement supprimé
 */
export async function unlinkOAuthAccount(userId, provider) {
  try {
    const deleted = await prisma.oAuthAccount.deleteMany({
      where: {
        userId,
        provider,
      },
    });

    logger.info(`OAuth account unlinked: ${provider} from user ${userId}`);
    return deleted;
  } catch (error) {
    logger.error(`Error in unlinkOAuthAccount: ${error.message}`);
    throw error;
  }
}
