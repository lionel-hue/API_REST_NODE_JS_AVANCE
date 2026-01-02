import prisma from "#lib/prisma";
import { hashPassword, verifyPassword } from "#lib/password";
import { signAccessToken, signRefreshToken, verifyToken } from "#lib/jwt";
import { ConflictException, UnauthorizedException, NotFoundException } from "#lib/exceptions";
import { config } from "#config/env";
import verificationService from './verification.service.js'; // Add this import

/**
 * Calcule la date d'expiration à partir d'une chaîne comme "7d" ou "15m"
 * @param {string} expiryString - Chaîne d'expiration (ex: "7d", "15m", "1h"***REMOVED***
 * @returns {Date} Date d'expiration
 */
function calculateExpirationDate(expiryString***REMOVED*** {
  const date = new Date(***REMOVED***;
  const match = expiryString.match(/^(\d+***REMOVED***([dhms]***REMOVED***$/***REMOVED***;

  if (!match***REMOVED*** {
    // Par défaut, 7 jours si le format est invalide
    date.setDate(date.getDate(***REMOVED*** + 7***REMOVED***;
    return date;
  }

  const value = parseInt(match[1]***REMOVED***;
  const unit = match[2];

  switch (unit***REMOVED*** {
    case 'd':
      date.setDate(date.getDate(***REMOVED*** + value***REMOVED***;
      break;
    case 'h':
      date.setHours(date.getHours(***REMOVED*** + value***REMOVED***;
      break;
    case 'm':
      date.setMinutes(date.getMinutes(***REMOVED*** + value***REMOVED***;
      break;
    case 's':
      date.setSeconds(date.getSeconds(***REMOVED*** + value***REMOVED***;
      break;
    default:
      date.setDate(date.getDate(***REMOVED*** + 7***REMOVED***;
  }

  return date;
}

export class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} data - Données d'inscription (email, password, firstName, lastName***REMOVED***
   * @param {string} userAgent - User agent de la requête
   * @param {string} ipAddress - Adresse IP de la requête
   * @returns {Promise<Object>} Utilisateur créé avec tokens
   */
  static async register(data, userAgent, ipAddress***REMOVED*** {
    const { email, password, firstName, lastName } = data;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } }***REMOVED***;
    if (existingUser***REMOVED*** {
      throw new ConflictException("Cet email est déjà utilisé"***REMOVED***;
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password***REMOVED***;

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        emailVerifiedAt: null,
      },
    }***REMOVED***;

    // Send verification email (except in development***REMOVED***
    if (config.EMAIL_ENABLED***REMOVED*** {
      await verificationService.createAndSendVerification(user***REMOVED***;
    }

    // Générer les tokens
    const accessToken = await signAccessToken({ userId: user.id }***REMOVED***;
    const refreshTokenValue = await signRefreshToken({ userId: user.id }***REMOVED***;

    // Calculer la date d'expiration du refresh token
    const refreshExpiry = config.JWT_REFRESH_EXPIRY || "7d";
    const expiresAt = calculateExpirationDate(refreshExpiry***REMOVED***;

    // Sauvegarder le refresh token en base
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        userAgent,
        ipAddress,
        expiresAt,
      },
    }***REMOVED***;

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
  static async logout(accessToken, refreshToken, userId***REMOVED*** {
    try {
      // Vérifier et décoder l'access token pour obtenir l'expiration
      const decoded = await verifyToken(accessToken***REMOVED***;
      const expiresAt = new Date(decoded.exp * 1000***REMOVED***;

      // Blacklister l'access token
      await prisma.blacklistedAccessToken.create({
        data: {
          token: accessToken,
          userId,
          expiresAt,
        },
      }***REMOVED***;
    } catch (error***REMOVED*** {
      // Si le token est déjà expiré, on peut ignorer l'erreur
    }

    // Révoquer le refresh token
    if (refreshToken***REMOVED*** {
      await prisma.refreshToken.updateMany({
        where: {
          token: refreshToken,
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(***REMOVED***,
        },
      }***REMOVED***;
    }
  }

  /**
   * Rafraîchir les tokens
   * @param {string} refreshToken - Refresh token à vérifier
   * @param {string} userAgent - User agent de la requête
   * @param {string} ipAddress - Adresse IP de la requête
   * @returns {Promise<Object>} Nouveaux tokens
   */
  static async refresh(refreshToken, userAgent, ipAddress***REMOVED*** {
    // Vérifier le refresh token dans la base de données
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    }***REMOVED***;

    if (!tokenRecord***REMOVED*** {
      throw new UnauthorizedException("Refresh token invalide"***REMOVED***;
    }

    // Vérifier si le token est révoqué
    if (tokenRecord.revokedAt***REMOVED*** {
      throw new UnauthorizedException("Refresh token révoqué"***REMOVED***;
    }

    // Vérifier si le token est expiré
    if (new Date(***REMOVED*** > tokenRecord.expiresAt***REMOVED*** {
      throw new UnauthorizedException("Refresh token expiré"***REMOVED***;
    }

    // Vérifier le token JWT
    let decoded;
    try {
      decoded = await verifyToken(refreshToken***REMOVED***;
    } catch (error***REMOVED*** {
      throw new UnauthorizedException("Refresh token invalide"***REMOVED***;
    }

    // Vérifier si l'utilisateur existe toujours et n'est pas désactivé
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    }***REMOVED***;

    if (!user || user.disabledAt***REMOVED*** {
      throw new UnauthorizedException("Utilisateur invalide"***REMOVED***;
    }

    // Générer de nouveaux tokens
    const newAccessToken = await signAccessToken({ userId: user.id }***REMOVED***;
    const newRefreshTokenValue = await signRefreshToken({ userId: user.id }***REMOVED***;

    // Révoquer l'ancien refresh token
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date(***REMOVED*** },
    }***REMOVED***;

    // Calculer la date d'expiration du nouveau refresh token
    const refreshExpiry = config.JWT_REFRESH_EXPIRY || "7d";
    const expiresAt = calculateExpirationDate(refreshExpiry***REMOVED***;

    // Sauvegarder le nouveau refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshTokenValue,
        userId: user.id,
        userAgent,
        ipAddress,
        expiresAt,
      },
    }***REMOVED***;

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenValue,
    };
  }
}