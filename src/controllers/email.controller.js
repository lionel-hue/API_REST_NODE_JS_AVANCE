import { validateData } from '#lib/validate';
import verificationService from '#services/verification.service.js';
import { BadRequestException } from '#lib/exceptions';
import { logger } from '#lib/logger';

// Validation schemas
import { z } from 'zod';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

const resendVerificationSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export class EmailController {
  /**
   * Verify email with token
   * GET /api/auth/verify-email?token=xyz
   * OR POST /api/auth/verify-email (with token in body)
   */
  static async verifyEmail(req, res) {
    // Support both GET with query param and POST with body
    const token = req.query.token || req.body.token;
    
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    const validatedData = validateData(verifyEmailSchema, { token });
    const result = await verificationService.verifyEmail(validatedData.token);

    res.json({
      success: true,
      ...result,
    });
  }

  /**
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  static async resendVerification(req, res) {
    const validatedData = validateData(resendVerificationSchema, req.body);
    const result = await verificationService.resendVerification(validatedData.email);

    res.json({
      success: true,
      ...result,
    });
  }
}