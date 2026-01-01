import { z } from 'zod';

export const verifyEmailSchema = z.object({
  token: z.string(***REMOVED***.min(1, 'Verification token is required'***REMOVED***,
}***REMOVED***;

export const resendVerificationSchema = z.object({
  email: z.string(***REMOVED***.email('Valid email is required'***REMOVED***,
}***REMOVED***;

export const forgotPasswordSchema = z.object({
  email: z.string(***REMOVED***.email('Valid email is required'***REMOVED***,
}***REMOVED***;

export const resetPasswordSchema = z.object({
  token: z.string(***REMOVED***.min(1, 'Reset token is required'***REMOVED***,
  newPassword: z.string(***REMOVED***.min(8, 'Password must be at least 8 characters'***REMOVED***,
}***REMOVED***;

export const changePasswordSchema = z.object({
  currentPassword: z.string(***REMOVED***.min(1, 'Current password is required'***REMOVED***,
  newPassword: z.string(***REMOVED***.min(8, 'New password must be at least 8 characters'***REMOVED***,
}***REMOVED***;

export const setPasswordSchema = z.object({
  newPassword: z.string(***REMOVED***.min(8, 'Password must be at least 8 characters'***REMOVED***,
}***REMOVED***;