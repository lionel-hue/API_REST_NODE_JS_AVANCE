import { SignJWT, jwtVerify } from "jose";
import { config } from "#config/env";

const secret = new TextEncoder(***REMOVED***.encode(config.JWT_SECRET***REMOVED***
const alg = "HS256";

/**
 * Génère un access token JWT
 * @param {Object} payload - Données à encoder dans le token
 * @returns {Promise<string>} Access token
 */
export async function signAccessToken(payload***REMOVED*** {
  const expiresIn = config.JWT_ACCESS_EXPIRY || "15m";
  return new SignJWT(payload***REMOVED***
    .setProtectedHeader({ alg }***REMOVED***
    .setIssuedAt(***REMOVED***
    .setExpirationTime(expiresIn***REMOVED***
    .sign(secret***REMOVED***;
}

/**
 * Génère un refresh token JWT
 * @param {Object} payload - Données à encoder dans le token
 * @returns {Promise<string>} Refresh token
 */
export async function signRefreshToken(payload***REMOVED*** {
  const expiresIn = config.JWT_REFRESH_EXPIRY || "7d";
  return new SignJWT(payload***REMOVED***
    .setProtectedHeader({ alg }***REMOVED***
    .setIssuedAt(***REMOVED***
    .setExpirationTime(expiresIn***REMOVED***
    .sign(secret***REMOVED***;
}

/**
 * Vérifie et décode un token JWT
 * @param {string} token - Token à vérifier
 * @returns {Promise<Object>} Payload décodé
 * @throws {Error} Si le token est invalide ou expiré
 */
export async function verifyToken(token***REMOVED*** {
  try {
    const { payload } = await jwtVerify(token, secret***REMOVED***;
    return payload;
  } catch (error***REMOVED*** {
    throw new Error("Token invalide ou expiré"***REMOVED***;
  }
}

/**
 * Fonction legacy pour rétrocompatibilité
 * @deprecated Utiliser signAccessToken ou signRefreshToken
 */
export async function signToken(payload, expiresIn = "7d"***REMOVED*** {
  return new SignJWT(payload***REMOVED***
    .setProtectedHeader({ alg }***REMOVED***
    .setIssuedAt(***REMOVED***
    .setExpirationTime(expiresIn***REMOVED***
    .sign(secret***REMOVED***;
}