import prisma from "#lib/prisma";
import { hashPassword, verifyPassword } from "#lib/password";
import { signAccessToken, signRefreshToken, verifyToken } from "#lib/jwt";
import { ConflictException, UnauthorizedException, NotFoundException } from "#lib/exceptions";
import { config } from "#config/env";
import verificationService from './verification.service.js';

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
    
    console.log(`\n🔵 [AUTH SERVICE] Starting registration for: ${email}`);
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log(`❌ [AUTH SERVICE] Email already exists: ${email}`);
      throw new ConflictException("Cet email est déjà utilisé");
    }
    
    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);
    
    console.log(`🔵 [AUTH SERVICE] Creating user in database...`);
    
    // Créer l'utilisateur - IMPORTANT: NOT auto-verified!
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        emailVerifiedAt: null, // CRITICAL: Do NOT auto-verify in development
      },
    });
    
    console.log(`✅ [AUTH SERVICE] User created: ${user.id}`);
    console.log(`✅ [AUTH SERVICE] User emailVerifiedAt: ${user.emailVerifiedAt}`);
    
    // Créer et envoyer le token de vérification
    try {
      console.log(`🔵 [AUTH SERVICE] Creating verification token...`);
      const verificationResult = await verificationService.createAndSendVerification(user);
      console.log(`✅ [AUTH SERVICE] Verification token created and email sent`);
      
      // Log the token for testing in development
      if (config.NODE_ENV === 'development' && verificationResult.token) {
        console.log(`\n🔥 [DEV MODE] VERIFICATION TOKEN FOR TESTING:`);
        console.log(`🔥 Email: ${email}`);
        console.log(`🔥 Token: ${verificationResult.token}`);
        console.log(`🔥 Verify URL: ${config.APP_URL}/api/auth/verify-email?token=${verificationResult.token}`);
        console.log(`🔥 Curl: curl -X POST ${config.APP_URL}/api/auth/verify-email -H "Content-Type: application/json" -d '{"token": "${verificationResult.token}"}'`);
        console.log(`\n`);
      }
    } catch (error) {
      console.log(`❌ [AUTH SERVICE] Verification error: ${error.message}`);
      // Don't fail registration if email fails - just log it
      // User can request verification email later
    }
    
    // Générer les tokens JWT (these are DIFFERENT from verification tokens!)
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
    
    console.log(`✅ [AUTH SERVICE] Registration complete for ${email}`);
    console.log(`✅ [AUTH SERVICE] JWT Access Token generated (for API auth)`);
    console.log(`✅ [AUTH SERVICE] JWT Refresh Token generated\n`);
    
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
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
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
    console.log(`\n🔄 [AUTH SERVICE] Starting token refresh`);
    
    // Vérifier le refresh token dans la base de données
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    
    if (!tokenRecord) {
      console.log(`❌ [AUTH SERVICE] Refresh token not found in database`);
      throw new UnauthorizedException("Refresh token invalide");
    }
    
    // Vérifier si le token est révoqué
    if (tokenRecord.revokedAt) {
      console.log(`❌ [AUTH SERVICE] Refresh token already revoked`);
      throw new UnauthorizedException("Refresh token révoqué");
    }
    
    // Vérifier si le token est expiré
    if (new Date() > tokenRecord.expiresAt) {
      console.log(`❌ [AUTH SERVICE] Refresh token expired at ${tokenRecord.expiresAt}`);
      throw new UnauthorizedException("Refresh token expiré");
    }
    
    // Vérifier le token JWT
    let decoded;
    try {
      decoded = await verifyToken(refreshToken);
      console.log(`✅ [AUTH SERVICE] JWT token verified, userId: ${decoded.userId}`);
    } catch (error) {
      console.log(`❌ [AUTH SERVICE] JWT verification failed: ${error.message}`);
      throw new UnauthorizedException("Refresh token invalide");
    }
    
    // Vérifier si l'utilisateur existe toujours et n'est pas désactivé
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (!user || user.disabledAt) {
      console.log(`❌ [AUTH SERVICE] User not found or disabled: ${decoded.userId}`);
      throw new UnauthorizedException("Utilisateur invalide");
    }
    
    // Générer de nouveaux tokens
    const newAccessToken = await signAccessToken({ userId: user.id });
    let newRefreshTokenValue = await signRefreshToken({ userId: user.id });
    
    // Révoquer l'ancien refresh token
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() }
    });
    
    console.log(`✅ [AUTH SERVICE] Old refresh token revoked: ${tokenRecord.id}`);
    
    // Calculer la date d'expiration du nouveau refresh token
    const refreshExpiry = config.JWT_REFRESH_EXPIRY || "7d";
    const expiresAt = calculateExpirationDate(refreshExpiry);
    
    // Tentative de sauvegarde du nouveau refresh token
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        await prisma.refreshToken.create({
          data: {
            token: newRefreshTokenValue,
            userId: user.id,
            userAgent,
            ipAddress,
            expiresAt,
          },
        });
        console.log(`✅ [AUTH SERVICE] New refresh token saved successfully`);
        break; // Sortie de la boucle si succès
      } catch (error) {
        retryCount++;
        
        if (error.code === 'P2002' && retryCount < maxRetries) {
          // Collision de token, générer un nouveau
          console.log(`🔄 [AUTH SERVICE] Token collision detected, generating new one (attempt ${retryCount}/${maxRetries})`);
          newRefreshTokenValue = await signRefreshToken({ userId: user.id });
        } else if (error.code === 'P2002') {
          // Trop de collisions
          console.log(`❌ [AUTH SERVICE] Max retries reached for token generation`);
          throw new Error("Impossible de générer un token unique après plusieurs tentatives");
        } else {
          // Autre erreur
          console.log(`❌ [AUTH SERVICE] Error saving refresh token: ${error.message}`);
          throw error;
        }
      }
    }
    
    console.log(`✅ [AUTH SERVICE] Token refresh completed successfully`);
    
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenValue,
    };
  }
}