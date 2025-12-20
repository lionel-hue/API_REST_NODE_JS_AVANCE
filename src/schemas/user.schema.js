import { z } from "zod";

export const registerSchema = z.object({
  email: z.string(***REMOVED***.email("Email invalide"***REMOVED***,
  password: z.string(***REMOVED***.min(8, "Minimum 8 caractères"***REMOVED***,
  name: z.string(***REMOVED***.min(2***REMOVED***.optional(***REMOVED***,
}***REMOVED***;

export const loginSchema = z.object({
  email: z.string(***REMOVED***.email("Email invalide"***REMOVED***,
  password: z.string(***REMOVED***.min(1, "Mot de passe requis"***REMOVED***,
}***REMOVED***;
