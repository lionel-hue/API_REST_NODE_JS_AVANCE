import { z } from "zod";

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
  email: z.string(***REMOVED***.email("Email invalide"***REMOVED***,
  password: z.string(***REMOVED***.min(8, "Le mot de passe doit contenir au moins 8 caractères"***REMOVED***,
  firstName: z.string(***REMOVED***.min(1, "Le prénom est requis"***REMOVED***,
  lastName: z.string(***REMOVED***.min(1, "Le nom est requis"***REMOVED***,
}***REMOVED***;

/**
 * Schéma de validation pour la connexion
 */
export const loginSchema = z.object({
  email: z.string(***REMOVED***.email("Email invalide"***REMOVED***,
  password: z.string(***REMOVED***.min(1, "Le mot de passe est requis"***REMOVED***,
}***REMOVED***;

/**
 * Schéma de validation pour le rafraîchissement de token
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string(***REMOVED***.min(1, "Le refresh token est requis"***REMOVED***,
}***REMOVED***;

