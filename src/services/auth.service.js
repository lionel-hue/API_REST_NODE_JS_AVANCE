import prisma from "#lib/prisma";
import { hashPassword, verifyPassword } from "#lib/password";
import { signAccessToken, signRefreshToken, verifyToken } from "#lib/jwt";
import { ConflictException, UnauthorizedException, NotFoundException } from "#lib/exceptions";
import { config } from "#config/env";

/**
 * Calcule la date d'expiration à partir d'une chaîne comme "7d" ou "15m"
 * @param {string} expiryString - Chaîne d'expiration (ex: "7d", "15m", "1h")
 * @returns {Date} Date d'expiration
 */
function calculateExpirationDate(expiryString) {
  const date = new Date();
  const match = expiryString.match(/^(\d+)([dhms])$/);
  
  if (!match) {
    // Par défaut, 7 jours si le format est invalide
    date.setDate(date.getDate() + 7);
    return date;
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'd':
      date.setDate(date.getDate() + value);
      break;
    case 'h':
      date.setHours(date.getHours() + value);
      break;
    case 'm':
      date.setMinutes(date.getMinutes() + value);
      break;
    case 's':
      date.setSeconds(date.getSeconds() + value);
      break;
    default:
      date.setDate(date.getDate() + 7);
  }

  return date;
}

export class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} data - Données d'inscription (email, password, firstName, lastName)
   * @param {string} userAgent - User agent de la requête
   * @param {string} ipAddress - Adresse IP de la requête
   * @returns {Promise<Object>} Utilisateur créé avec tokens
   */
  static async register(data, userAgent, ipAddress) {
    const { email, password, firstName, lastName } = data;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException("Cet email est déjà utilisé");
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    // Générer les tokens
    const accessToken = await signAccessToken({ userId: user.id });
    const refreshTokenValue = await signRefreshToken({ userId: user.id });

    // Calculer la date d'expiration du refresh token
    const refreshExpiry = config.JWT_REFRESH_EXPIRY || "7d";
    const expiresAt = calculateExpirationDate(refreshExpiry);

    // Sauvegarder le refresh token en base
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    // Retourner les données sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  /**
   * Connexion d'un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @param {string} userAgent - User agent de la requête
   * @param {string} ipAddress - Adresse IP de la requête
   * @returns {Promise<Object>} Utilisateur avec tokens
   */
  static async login(email, password, userAgent, ipAddress) {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new UnauthorizedException("Identifiants invalides");
    }

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Identifiants invalides");
    }

    // Vérifier si le compte est désactivé
    if (user.disabledAt) {
      throw new UnauthorizedException("Ce compte a été désactivé");
    }

    // Générer les tokens
    const accessToken = await signAccessToken({ userId: user.id });
    const refreshTokenValue = await signRefreshToken({ userId: user.id });

    // Calculer la date d'expiration du refresh token
    const refreshExpiry = config.JWT_REFRESH_EXPIRY || "7d";
    const expiresAt = calculateExpirationDate(refreshExpiry);

    // Sauvegarder le refresh token en base
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    // Retourner les données sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  /**
   * Déconnexion d'un utilisateur
   * @param {string} accessToken - Access token à blacklister
   * @param {string} refreshToken - Refresh token à révoquer
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<void>}
   */
  static async logout(accessToken, refreshToken, userId) {
    try {
      // Vérifier et décoder l'access token pour obtenir l'expiration
      const decoded = await verifyToken(accessToken);
      const expiresAt = new Date(decoded.exp * 1000);

      // Blacklister l'access token
      await prisma.blacklistedAccessToken.create({
        data: {
          token: accessToken,
          userId,
          expiresAt,
        },
      });
    } catch (error) {
      // Si le token est déjà expiré, on peut ignorer l'erreur
    }

    // Révoquer le refresh token
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: {
          token: refreshToken,
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }
  }

  /**
   * Rafraîchir les tokens
   * @param {string} refreshToken - Refresh token à vérifier
   * @param {string} userAgent - User agent de la requête
   * @param {string} ipAddress - Adresse IP de la requête
   * @returns {Promise<Object>} Nouveaux tokens
   */
  static async refresh(refreshToken, userAgent, ipAddress) {
    // Vérifier le refresh token dans la base de données
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException("Refresh token invalide");
    }

    // Vérifier si le token est révoqué
    if (tokenRecord.revokedAt) {
      throw new UnauthorizedException("Refresh token révoqué");
    }

    // Vérifier si le token est expiré
    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException("Refresh token expiré");
    }

    // Vérifier le token JWT
    let decoded;
    try {
      decoded = await verifyToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedException("Refresh token invalide");
    }

    // Vérifier si l'utilisateur existe toujours et n'est pas désactivé
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.disabledAt) {
      throw new UnauthorizedException("Utilisateur invalide");
    }

    // Générer de nouveaux tokens
    const newAccessToken = await signAccessToken({ userId: user.id });
    const newRefreshTokenValue = await signRefreshToken({ userId: user.id });

    // Révoquer l'ancien refresh token
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    // Calculer la date d'expiration du nouveau refresh token
    const refreshExpiry = config.JWT_REFRESH_EXPIRY || "7d";
    const expiresAt = calculateExpirationDate(refreshExpiry);

    // Sauvegarder le nouveau refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshTokenValue,
        userId: user.id,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenValue,
    };
  }
}

