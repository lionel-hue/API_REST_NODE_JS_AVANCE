import { UnauthorizedException } from "#lib/exceptions";
import { verifyToken } from "#lib/jwt";
import { logger } from "#lib/logger";
import prisma from "#lib/prisma";

/**
 * Middleware d'authentification complet
 * Vérifie le token JWT, la blacklist, et ajoute l'utilisateur à la requête
 * 
 * Fonctionnalités :
 * - Extraction et validation du token Bearer
 * - Vérification de la blacklist des tokens révoqués
 * - Vérification de la validité du token JWT
 * - Vérification de l'existence et du statut de l'utilisateur
 * - Ajout des informations utilisateur à req.user
 */
export async function auth(req, res, next***REMOVED*** {
  try {
    // Extraire le token du header Authorization
    const bearerToken = req.headers["authorization"];
    if (!bearerToken***REMOVED*** {
      logger.warn("Tentative d'accès sans token d'authentification"***REMOVED***;
      throw new UnauthorizedException("Token d'authentification manquant"***REMOVED***;
    }

    const tokenPart = bearerToken.split(" "***REMOVED***;
    if (tokenPart[0] !== "Bearer" || !tokenPart[1]***REMOVED*** {
      logger.warn("Format de token invalide"***REMOVED***;
      throw new UnauthorizedException("Format de token invalide. Utilisez: Bearer <token>"***REMOVED***;
    }

    const token = tokenPart[1];

    // Vérifier si le token est blacklisté (révoqué***REMOVED***
    const blacklistedToken = await prisma.blacklistedAccessToken.findUnique({
      where: { token },
    }***REMOVED***;

    if (blacklistedToken***REMOVED*** {
      logger.warn(`Tentative d'utilisation d'un token révoqué pour l'utilisateur ${blacklistedToken.userId}`***REMOVED***;
      throw new UnauthorizedException("Token révoqué"***REMOVED***;
    }

    // Vérifier et décoder le token JWT
    let payload;
    try {
      payload = await verifyToken(token***REMOVED***;
    } catch (error***REMOVED*** {
      logger.warn("Token JWT invalide ou expiré"***REMOVED***;
      throw new UnauthorizedException("Token invalide ou expiré"***REMOVED***;
    }

    if (!payload.userId***REMOVED*** {
      logger.warn("Token sans userId"***REMOVED***;
      throw new UnauthorizedException("Token invalide"***REMOVED***;
    }

    // Vérifier que l'utilisateur existe et n'est pas désactivé
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        disabledAt: true,
      },
    }***REMOVED***;

    if (!user***REMOVED*** {
      logger.warn(`Utilisateur ${payload.userId} non trouvé`***REMOVED***;
      throw new UnauthorizedException("Utilisateur non trouvé"***REMOVED***;
    }

    if (user.disabledAt***REMOVED*** {
      logger.warn(`Tentative d'accès avec un compte désactivé: ${user.email}`***REMOVED***;
      throw new UnauthorizedException("Compte désactivé"***REMOVED***;
    }

    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      userId: user.id,
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    logger.debug(`Authentification réussie pour l'utilisateur: ${user.email}`***REMOVED***;
    next(***REMOVED***;
  } catch (error***REMOVED*** {
    // Si c'est déjà une UnauthorizedException, la propager telle quelle
    if (error instanceof UnauthorizedException***REMOVED*** {
      throw error;
    }
    // Pour toute autre erreur, la transformer en UnauthorizedException
    logger.error("Erreur dans le middleware d'authentification:", error***REMOVED***;
    throw new UnauthorizedException("Token invalide ou expiré"***REMOVED***;
  }
}
