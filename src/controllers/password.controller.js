import { validateData } from '#lib/validate';
import passwordService from '#services/password.service';

// Validation schemas
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string(***REMOVED***.email('Valid email is required'***REMOVED***,
}***REMOVED***;

const resetPasswordSchema = z.object({
  token: z.string(***REMOVED***.min(1, 'Reset token is required'***REMOVED***,
  newPassword: z.string(***REMOVED***.min(8, 'Password must be at least 8 characters'***REMOVED***,
}***REMOVED***;

const changePasswordSchema = z.object({
  currentPassword: z.string(***REMOVED***.min(1, 'Current password is required'***REMOVED***,
  newPassword: z.string(***REMOVED***.min(8, 'New password must be at least 8 characters'***REMOVED***,
}***REMOVED***;

const setPasswordSchema = z.object({
  newPassword: z.string(***REMOVED***.min(8, 'Password must be at least 8 characters'***REMOVED***,
}***REMOVED***;

export class PasswordController {
  /**
   * Request password reset (forgot password***REMOVED***
   * POST /api/password/forgot
   */
  static async forgotPassword(req, res***REMOVED*** {
    const validatedData = validateData(forgotPasswordSchema, req.body***REMOVED***;
    const result = await passwordService.forgotPassword(validatedData.email***REMOVED***;

    res.json({
      success: true,
      ...result,
    }***REMOVED***;
  }

  /**
   * Reset password with token
   * POST /api/password/reset
   */
  static async resetPassword(req, res***REMOVED*** {
    // Support both query param and body
    const token = req.query.token || req.body.token;
    const newPassword = req.body.newPassword;
    
    if (!token || !newPassword***REMOVED*** {
      return res.status(400***REMOVED***.json({
        success: false,
        error: 'Token and new password are required',
      }***REMOVED***;
    }

    const validatedData = validateData(resetPasswordSchema, { token, newPassword }***REMOVED***;
    const result = await passwordService.resetPassword(
      validatedData.token,
      validatedData.newPassword
    ***REMOVED***;

    res.json({
      success: true,
      ...result,
    }***REMOVED***;
  }

  /**
   * Change password for authenticated user
   * PUT /api/password/change
   */
  static async changePassword(req, res***REMOVED*** {
    const validatedData = validateData(changePasswordSchema, req.body***REMOVED***;
    const userId = req.user.userId || req.user.id;

    if (!userId***REMOVED*** {
      return res.status(401***REMOVED***.json({
        success: false,
        error: 'Authentication required',
      }***REMOVED***;
    }

    const result = await passwordService.changePassword(
      userId,
      validatedData.currentPassword,
      validatedData.newPassword
    ***REMOVED***;

    res.json({
      success: true,
      ...result,
    }***REMOVED***;
  }

  /**
   * Set password for OAuth user
   * POST /api/password/set
   */
  static async setPassword(req, res***REMOVED*** {
    const validatedData = validateData(setPasswordSchema, req.body***REMOVED***;
    const userId = req.user.userId || req.user.id;

    if (!userId***REMOVED*** {
      return res.status(401***REMOVED***.json({
        success: false,
        error: 'Authentication required',
      }***REMOVED***;
    }

    const result = await passwordService.setPassword(
      userId,
      validatedData.newPassword
    ***REMOVED***;

    res.json({
      success: true,
      ...result,
    }***REMOVED***;
  }
}