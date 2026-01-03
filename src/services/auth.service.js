import prisma from "#lib/prisma";
import { hashPassword, verifyPassword } from "#lib/password";
import { signAccessToken, signRefreshToken, verifyToken } from "#lib/jwt";
import { ConflictException, UnauthorizedException, NotFoundException } from "#lib/exceptions";
import { config } from "#config/env";
import verificationService from './verification.service.js';

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
    
    console.log(`\n🔵 [AUTH SERVICE] Starting registration for: ${email}`***REMOVED***;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    }***REMOVED***;
    
    if (existingUser***REMOVED*** {
      console.log(`❌ [AUTH SERVICE] Email already exists: ${email}`***REMOVED***;
      throw new ConflictException("Cet email est déjà utilisé"***REMOVED***;
    }
    
    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password***REMOVED***;
    
    console.log(`🔵 [AUTH SERVICE] Creating user in database...`***REMOVED***;
    
    // Créer l'utilisateur - IMPORTANT: NOT auto-verified!
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        emailVerifiedAt: null, // CRITICAL: Do NOT auto-verify in development
      },
    }***REMOVED***;
    
    console.log(`✅ [AUTH SERVICE] User created: ${user.id}`***REMOVED***;
    console.log(`✅ [AUTH SERVICE] User emailVerifiedAt: ${user.emailVerifiedAt}`***REMOVED***;
    
    // Créer et envoyer le token de vérification
    try {
      console.log(`🔵 [AUTH SERVICE] Creating verification token...`***REMOVED***;
      const verificationResult = await verificationService.createAndSendVerification(user***REMOVED***;
      console.log(`✅ [AUTH SERVICE] Verification token created and email sent`***REMOVED***;
      
      // Log the token for testing in development
      if (config.NODE_ENV === 'development' && verificationResult.token***REMOVED*** {
        console.log(`\n🔥 [DEV MODE] VERIFICATION TOKEN FOR TESTING:`***REMOVED***;
        console.log(`🔥 Email: ${email}`***REMOVED***;
        console.log(`🔥 Token: ${verificationResult.token}`***REMOVED***;
        console.log(`🔥 Verify URL: ${config.APP_URL}/api/auth/verify-email?token=${verificationResult.token}`***REMOVED***;
        console.log(`🔥 Curl: curl -X POST ${config.APP_URL}/api/auth/verify-email -H "Content-Type: application/json" -d '{"token": "${verificationResult.token}"}'`***REMOVED***;
        console.log(`\n`***REMOVED***;
      }
    } catch (error***REMOVED*** {
      console.log(`❌ [AUTH SERVICE] Verification error: ${error.message}`***REMOVED***;
      // Don't fail registration if email fails - just log it
      // User can request verification email later
    }
    
    // Générer les tokens JWT (these are DIFFERENT from verification tokens!***REMOVED***
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
    
    console.log(`✅ [AUTH SERVICE] Registration complete for ${email}`***REMOVED***;
    console.log(`✅ [AUTH SERVICE] JWT Access Token generated (for API auth***REMOVED***`***REMOVED***;
    console.log(`✅ [AUTH SERVICE] JWT Refresh Token generated\n`***REMOVED***;
    
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
  static async login(email, password, userAgent, ipAddress***REMOVED*** {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    }***REMOVED***;
    
    if (!user || !user.password***REMOVED*** {
      throw new UnauthorizedException("Identifiants invalides"***REMOVED***;
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(user.password, password***REMOVED***;
    if (!isPasswordValid***REMOVED*** {
      throw new UnauthorizedException("Identifiants invalides"***REMOVED***;
    }
    
    // Vérifier si le compte est désactivé
    if (user.disabledAt***REMOVED*** {
      throw new UnauthorizedException("Ce compte a été désactivé"***REMOVED***;
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
    console.log(`\n🔄 [AUTH SERVICE] Starting token refresh`***REMOVED***;
    
    // Vérifier le refresh token dans la base de données
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    }***REMOVED***;
    
    if (!tokenRecord***REMOVED*** {
      console.log(`❌ [AUTH SERVICE] Refresh token not found in database`***REMOVED***;
      throw new UnauthorizedException("Refresh token invalide"***REMOVED***;
    }
    
    // Vérifier si le token est révoqué
    if (tokenRecord.revokedAt***REMOVED*** {
      console.log(`❌ [AUTH SERVICE] Refresh token already revoked`***REMOVED***;
      throw new UnauthorizedException("Refresh token révoqué"***REMOVED***;
    }
    
    // Vérifier si le token est expiré
    if (new Date(***REMOVED*** > tokenRecord.expiresAt***REMOVED*** {
      console.log(`❌ [AUTH SERVICE] Refresh token expired at ${tokenRecord.expiresAt}`***REMOVED***;
      throw new UnauthorizedException("Refresh token expiré"***REMOVED***;
    }
    
    // Vérifier le token JWT
    let decoded;
    try {
      decoded = await verifyToken(refreshToken***REMOVED***;
      console.log(`✅ [AUTH SERVICE] JWT token verified, userId: ${decoded.userId}`***REMOVED***;
    } catch (error***REMOVED*** {
      console.log(`❌ [AUTH SERVICE] JWT verification failed: ${error.message}`***REMOVED***;
      throw new UnauthorizedException("Refresh token invalide"***REMOVED***;
    }
    
    // Vérifier si l'utilisateur existe toujours et n'est pas désactivé
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    }***REMOVED***;
    
    if (!user || user.disabledAt***REMOVED*** {
      console.log(`❌ [AUTH SERVICE] User not found or disabled: ${decoded.userId}`***REMOVED***;
      throw new UnauthorizedException("Utilisateur invalide"***REMOVED***;
    }
    
    // Générer de nouveaux tokens
    const newAccessToken = await signAccessToken({ userId: user.id }***REMOVED***;
    let newRefreshTokenValue = await signRefreshToken({ userId: user.id }***REMOVED***;
    
    // Révoquer l'ancien refresh token
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date(***REMOVED*** }
    }***REMOVED***;
    
    console.log(`✅ [AUTH SERVICE] Old refresh token revoked: ${tokenRecord.id}`***REMOVED***;
    
    // Calculer la date d'expiration du nouveau refresh token
    const refreshExpiry = config.JWT_REFRESH_EXPIRY || "7d";
    const expiresAt = calculateExpirationDate(refreshExpiry***REMOVED***;
    
    // Tentative de sauvegarde du nouveau refresh token
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries***REMOVED*** {
      try {
        await prisma.refreshToken.create({
          data: {
            token: newRefreshTokenValue,
            userId: user.id,
            userAgent,
            ipAddress,
            expiresAt,
          },
        }***REMOVED***;
        console.log(`✅ [AUTH SERVICE] New refresh token saved successfully`***REMOVED***;
        break; // Sortie de la boucle si succès
      } catch (error***REMOVED*** {
        retryCount++;
        
        if (error.code === 'P2002' && retryCount < maxRetries***REMOVED*** {
          // Collision de token, générer un nouveau
          console.log(`🔄 [AUTH SERVICE] Token collision detected, generating new one (attempt ${retryCount}/${maxRetries}***REMOVED***`***REMOVED***;
          newRefreshTokenValue = await signRefreshToken({ userId: user.id }***REMOVED***;
        } else if (error.code === 'P2002'***REMOVED*** {
          // Trop de collisions
          console.log(`❌ [AUTH SERVICE] Max retries reached for token generation`***REMOVED***;
          throw new Error("Impossible de générer un token unique après plusieurs tentatives"***REMOVED***;
        } else {
          // Autre erreur
          console.log(`❌ [AUTH SERVICE] Error saving refresh token: ${error.message}`***REMOVED***;
          throw error;
        }
      }
    }
    
    console.log(`✅ [AUTH SERVICE] Token refresh completed successfully`***REMOVED***;
    
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenValue,
    };
  }
}