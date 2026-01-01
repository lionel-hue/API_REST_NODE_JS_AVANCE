import { validateData } from '#lib/validate';
import passwordService from '#services/password.service';

// Validation schemas
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const setPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export class PasswordController {
  /**
   * Request password reset (forgot password)
   * POST /api/password/forgot
   */
  static async forgotPassword(req, res) {
    const validatedData = validateData(forgotPasswordSchema, req.body);
    const result = await passwordService.forgotPassword(validatedData.email);

    res.json({
      success: true,
      ...result,
    });
  }

  /**
   * Reset password with token
   * POST /api/password/reset
   */
  static async resetPassword(req, res) {
    // Support both query param and body
    const token = req.query.token || req.body.token;
    const newPassword = req.body.newPassword;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required',
      });
    }

    const validatedData = validateData(resetPasswordSchema, { token, newPassword });
    const result = await passwordService.resetPassword(
      validatedData.token,
      validatedData.newPassword
    );

    res.json({
      success: true,
      ...result,
    });
  }

  /**
   * Change password for authenticated user
   * PUT /api/password/change
   */
  static async changePassword(req, res) {
    const validatedData = validateData(changePasswordSchema, req.body);
    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const result = await passwordService.changePassword(
      userId,
      validatedData.currentPassword,
      validatedData.newPassword
    );

    res.json({
      success: true,
      ...result,
    });
  }

  /**
   * Set password for OAuth user
   * POST /api/password/set
   */
  static async setPassword(req, res) {
    const validatedData = validateData(setPasswordSchema, req.body);
    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const result = await passwordService.setPassword(
      userId,
      validatedData.newPassword
    );

    res.json({
      success: true,
      ...result,
    });
  }
}