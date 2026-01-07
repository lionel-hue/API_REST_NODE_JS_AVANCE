import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto"; // ⭐ IMPORTANT: Ajouter cet import
import { config } from "#config/env";

// 🔴 REMPLACER L'ANCIENNE CONFIGURATION :
// const secret = new TextEncoder().encode(config.JWT_SECRET)
// const alg = "HS256";

// ✅ PAR CETTE NOUVELLE CONFIGURATION :
// Secrets distincts pour access et refresh tokens
const accessSecret = new TextEncoder().encode(config.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(config.JWT_REFRESH_SECRET);
const alg = "HS256";

// Fonction utilitaire pour garantir une longueur minimale de 1024 caractères
function ensureTokenLength(token, minLength = 1024) {
  if (token.length >= minLength) {
    return token;
  }
  
  // Calculer combien de caractères manquent
  const missingChars = minLength - token.length;
  
  // Générer du padding sécurisé avec crypto
  const padding = crypto
    .randomBytes(Math.ceil(missingChars / 2))
    .toString('hex')
    .slice(0, missingChars);
  
  return token + padding;
}

/**
 * Génère un access token JWT d'au moins 1024 caractères
 * @param {Object} payload - Données à encoder dans le token
 * @returns {Promise<string>} Access token d'au moins 1024 caractères
 */
export async function signAccessToken(payload) {
  const expiresIn = config.JWT_ACCESS_EXPIRY || "15m";
  
  // Ajouter des données supplémentaires pour augmenter la taille du token
  const enhancedPayload = {
    ...payload,
    // Données techniques pour augmenter la taille
    jti: crypto.randomBytes(32).toString('hex'), // JWT ID unique
    iat: Math.floor(Date.now() / 1000),
    // Données supplémentaires (sécurisées mais augmentent la taille)
    security: {
      salt: crypto.randomBytes(32).toString('hex'),
      version: "2.0"
    }
  };
  
  // Générer le token JWT de base
  const baseToken = await new SignJWT(enhancedPayload)
    .setProtectedHeader({ 
      alg,
      typ: "JWT",
      kid: "access-1" // Key ID pour tracking
    })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(accessSecret);
  
  // Garantir une longueur minimale de 1024 caractères
  return ensureTokenLength(baseToken, 1024);
}

/**
 * Génère un refresh token JWT d'au moins 1024 caractères
 * @param {Object} payload - Données à encoder dans le token
 * @returns {Promise<string>} Refresh token d'au moins 1024 caractères
 */
export async function signRefreshToken(payload) {
  const expiresIn = config.JWT_REFRESH_EXPIRY || "7d";
  
  // Ajouter des données supplémentaires spécifiques au refresh token
  const enhancedPayload = {
    ...payload,
    // Données uniques pour le refresh token
    jti: crypto.randomBytes(32).toString('hex'),
    iat: Math.floor(Date.now() / 1000),
    token_type: "refresh",
    // Données de sécurité supplémentaires
    security: {
      salt: crypto.randomBytes(32).toString('hex'),
      version: "2.0",
      rotation: crypto.randomBytes(16).toString('hex')
    }
  };
  
  // Générer le token JWT de base
  const baseToken = await new SignJWT(enhancedPayload)
    .setProtectedHeader({ 
      alg,
      typ: "JWT",
      kid: "refresh-1"
    })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(refreshSecret);
  
  // Garantir une longueur minimale de 1024 caractères
  return ensureTokenLength(baseToken, 1024);
}

/**
 * Vérifie et décode un access token JWT
 * @param {string} token - Token à vérifier (sans le padding)
 * @returns {Promise<Object>} Payload décodé
 * @throws {Error} Si le token est invalide ou expiré
 */
export async function verifyAccessToken(token) {
  try {
    // Extraire le token JWT réel (enlever le padding si présent)
    const jwtToken = token.length > 1024 ? token.slice(0, token.lastIndexOf('.')) : token;
    const { payload } = await jwtVerify(jwtToken, accessSecret);
    return payload;
  } catch (error) {
    throw new Error("Access token invalide ou expiré");
  }
}

/**
 * Vérifie et décode un refresh token JWT
 * @param {string} token - Token à vérifier (sans le padding)
 * @returns {Promise<Object>} Payload décodé
 * @throws {Error} Si le token est invalide ou expiré
 */
export async function verifyRefreshToken(token) {
  try {
    // Extraire le token JWT réel (enlever le padding si présent)
    const jwtToken = token.length > 1024 ? token.slice(0, token.lastIndexOf('.')) : token;
    const { payload } = await jwtVerify(jwtToken, refreshSecret);
    return payload;
  } catch (error) {
    throw new Error("Refresh token invalide ou expiré");
  }
}

/**
 * Fonction legacy pour rétrocompatibilité temporaire
 * @deprecated Utiliser signAccessToken ou signRefreshToken
 */
export async function signToken(payload, expiresIn = "7d") {
  console.warn("⚠️ signToken est déprécié. Utilisez signAccessToken ou signRefreshToken.");
  return signAccessToken(payload);
}

/**
 * Fonction legacy pour rétrocompatibilité temporaire
 * @deprecated Utiliser verifyAccessToken ou verifyRefreshToken
 */
export async function verifyToken(token) {
  console.warn("⚠️ verifyToken est déprécié. Utilisez verifyAccessToken ou verifyRefreshToken.");
  return verifyAccessToken(token);
} 