import { validateData } from '#lib/validate';
import verificationService from '#services/verification.service';
import { BadRequestException } from '#lib/exceptions';
import { logger } from '#lib/logger';

// Validation schemas
import { z } from 'zod';

const verifyEmailSchema = z.object({
  token: z.string(***REMOVED***.min(1, 'Verification token is required'***REMOVED***,
}***REMOVED***;

const resendVerificationSchema = z.object({
  email: z.string(***REMOVED***.email('Valid email is required'***REMOVED***,
}***REMOVED***;

export class EmailController {
  /**
   * Verify email with token
   * GET /api/auth/verify-email?token=xyz
   * OR POST /api/auth/verify-email (with token in body***REMOVED***
   */
  static async verifyEmail(req, res***REMOVED*** {
    // Support both GET with query param and POST with body
    const token = req.query.token || req.body.token;
    
    if (!token***REMOVED*** {
      throw new BadRequestException('Verification token is required'***REMOVED***;
    }

    const validatedData = validateData(verifyEmailSchema, { token }***REMOVED***;
    const result = await verificationService.verifyEmail(validatedData.token***REMOVED***;

    res.json({
      success: true,
      ...result,
    }***REMOVED***;
  }

  /**
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  static async resendVerification(req, res***REMOVED*** {
    const validatedData = validateData(resendVerificationSchema, req.body***REMOVED***;
    const result = await verificationService.resendVerification(validatedData.email***REMOVED***;

    res.json({
      success: true,
      ...result,
    }***REMOVED***;
  }
}