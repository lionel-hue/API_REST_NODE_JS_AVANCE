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
export async function auth(req, res, next) {
  try {
    // Extraire le token du header Authorization
    const bearerToken = req.headers["authorization"];
    if (!bearerToken) {
      logger.warn("Tentative d'accès sans token d'authentification");
      throw new UnauthorizedException("Token d'authentification manquant");
    }

    const tokenPart = bearerToken.split(" ");
    if (tokenPart[0] !== "Bearer" || !tokenPart[1]) {
      logger.warn("Format de token invalide");
      throw new UnauthorizedException("Format de token invalide. Utilisez: Bearer <token>");
    }

    const token = tokenPart[1];

    // Vérifier si le token est blacklisté (révoqué)
    const blacklistedToken = await prisma.blacklistedAccessToken.findUnique({
      where: { token },
    });

    if (blacklistedToken) {
      logger.warn(`Tentative d'utilisation d'un token révoqué pour l'utilisateur ${blacklistedToken.userId}`);
      throw new UnauthorizedException("Token révoqué");
    }

    // Vérifier et décoder le token JWT
    let payload;
    try {
      payload = await verifyToken(token);
    } catch (error) {
      logger.warn("Token JWT invalide ou expiré");
      throw new UnauthorizedException("Token invalide ou expiré");
    }

    if (!payload.userId) {
      logger.warn("Token sans userId");
      throw new UnauthorizedException("Token invalide");
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
    });

    if (!user) {
      logger.warn(`Utilisateur ${payload.userId} non trouvé`);
      throw new UnauthorizedException("Utilisateur non trouvé");
    }

    if (user.disabledAt) {
      logger.warn(`Tentative d'accès avec un compte désactivé: ${user.email}`);
      throw new UnauthorizedException("Compte désactivé");
    }

    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      userId: user.id,
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    logger.debug(`Authentification réussie pour l'utilisateur: ${user.email}`);
    next();
  } catch (error) {
    // Si c'est déjà une UnauthorizedException, la propager telle quelle
    if (error instanceof UnauthorizedException) {
      throw error;
    }
    // Pour toute autre erreur, la transformer en UnauthorizedException
    logger.error("Erreur dans le middleware d'authentification:", error);
    throw new UnauthorizedException("Token invalide ou expiré");
  }
}
