import prisma from "#lib/prisma";
import { hashPassword, verifyPassword } from "#lib/password";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "#lib/jwt";
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

      // 🔒 SECURITÉ: Ne JAMAIS logger le token de vérification, même en développement
      // Le token doit être uniquement dans l'email (EXIGENCE)
      if (config.NODE_ENV === 'development') {
        console.log(`✅ [AUTH SERVICE] Verification email sent to ${email}`);
        // Seulement confirmer l'envoi, pas montrer le token
      }
    } catch (error) {
      console.log(`❌ [AUTH SERVICE] Verification error: ${error.message}`);
      // Don't fail registration if email fails - just log it
      // User can request verification email later
    }

    // Générer les tokens JWT (these are DIFFERENT from verification tokens!)
    const accessToken = await signAccessToken({ userId: user.id });
    let refreshTokenValue = await signRefreshToken({ userId: user.id });

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
    console.log(`\n🔵 [AUTH SERVICE] Login attempt for: ${email}`);

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      console.log(`❌ [AUTH SERVICE] User not found or has no password`);
      throw new UnauthorizedException("Identifiants invalides");
    }

    // ✅ Verify email is confirmed
    if (!user.emailVerifiedAt) {
      console.log(`❌ [AUTH SERVICE] Email not verified for user: ${user.id}`);
      throw new UnauthorizedException("Veuillez vérifier votre email avant de vous connecter");
    }

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
      console.log(`❌ [AUTH SERVICE] Invalid password for user: ${user.id}`);
      throw new UnauthorizedException("Identifiants invalides");
    }

    // Vérifier si le compte est désactivé
    if (user.disabledAt) {
      console.log(`❌ [AUTH SERVICE] Account disabled: ${user.id}`);
      throw new UnauthorizedException("Ce compte a été désactivé");
    }

    // ✅ Generate tokens and return result
    console.log(`✅ [AUTH SERVICE] User authenticated: ${user.id}`);

    // Générer les tokens JWT
    const accessToken = await signAccessToken({ userId: user.id });
    const refreshTokenValue = await signRefreshToken({ userId: user.id });

    // Calculer la date d'expiration du refresh token
    const refreshExpiry = config.JWT_REFRESH_EXPIRY || "7d";
    const expiresAt = calculateExpirationDate(refreshExpiry);

    // Sauvegarder le refresh token en base
    try {
      await prisma.refreshToken.create({
        data: {
          token: refreshTokenValue,
          userId: user.id,
          userAgent,
          ipAddress,
          expiresAt,
        },
      });
      console.log(`✅ [AUTH SERVICE] Refresh token saved to database`);
    } catch (error) {
      console.error(`❌ [AUTH SERVICE] Error saving refresh token:`, error);
      // If it's a duplicate token, try once more with a new token
      if (error.code === 'P2002') {
        console.log(`🔄 [AUTH SERVICE] Token collision, generating new token...`);
        refreshTokenValue = await signRefreshToken({ userId: user.id });
        await prisma.refreshToken.create({
          data: {
            token: refreshTokenValue,
            userId: user.id,
            userAgent,
            ipAddress,
            expiresAt,
          },
        });
      } else {
        throw error;
      }
    }

    // Retourner les données sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    console.log(`✅ [AUTH SERVICE] Login successful for ${email}`);
    console.log(`✅ [AUTH SERVICE] Access Token generated: ${accessToken.substring(0, 30)}...`);
    console.log(`✅ [AUTH SERVICE] Refresh Token generated: ${refreshTokenValue.substring(0, 30)}...\n`);

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
  // ✅ PAR CETTE NOUVELLE VERSION :

  /** 
   * Déconnexion d'un utilisateur
   * INVALIDATION COMPLÈTE DU REFRESH_TOKEN (EXIGENCE)
   * @param {string} accessToken - Access token à blacklister
   * @param {string} refreshToken - Refresh token à révoquer OBLIGATOIREMENT
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<void>}
   */
  static async logout(accessToken, refreshToken, userId) {
    try {
      console.log(`\n🔵 [AUTH SERVICE] Logout request for user: ${userId}`);

      // 1. BLACKLISTER L'ACCESS TOKEN (si fourni)
      if (accessToken) {
        try {
          const decoded = await verifyAccessToken(accessToken);
          const expiresAt = new Date(decoded.exp * 1000);

          await prisma.blacklistedAccessToken.create({
            data: {
              token: accessToken,
              userId,
              expiresAt,
            },
          });
          console.log(`✅ [AUTH SERVICE] Access token blacklisted`);
        } catch (error) {
          // Si le token est déjà expiré ou invalide, on continue quand même
          console.log(`⚠️ [AUTH SERVICE] Access token already expired or invalid`);
        }
      }

      // 2. RÉVOQUER LE REFRESH TOKEN - EXIGENCE PRINCIPALE
      if (refreshToken) {
        // Première méthode: révoquer le refresh token spécifique
        const revoked = await prisma.refreshToken.updateMany({
          where: {
            token: refreshToken,
            userId,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });

        if (revoked.count > 0) {
          console.log(`✅ [AUTH SERVICE] Refresh token revoked: ${refreshToken.substring(0, 20)}...`);
        } else {
          console.log(`⚠️ [AUTH SERVICE] Refresh token already revoked or not found`);
        }

        // Deuxième méthode: révoquer TOUS les refresh tokens de l'utilisateur (déconnexion globale)
        await prisma.refreshToken.updateMany({
          where: {
            userId,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });
        console.log(`✅ [AUTH SERVICE] All refresh tokens revoked for user`);
      } else {
        console.warn(`⚠️ [AUTH SERVICE] No refresh token provided for logout`);
        throw new Error("Refresh token requis pour la déconnexion");
      }

      console.log(`✅ [AUTH SERVICE] Logout completed successfully for user: ${userId}`);
    } catch (error) {
      console.error(`❌ [AUTH SERVICE] Logout error: ${error.message}`);
      throw new Error("Échec de la déconnexion");
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
       decoded = await verifyRefreshToken(refreshToken);
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