import { z } from "zod";

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
});

/**
 * Schéma de validation pour la connexion
 */
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

/**
 * Schéma de validation pour le rafraîchissement de token
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Le refresh token est requis"),
});

