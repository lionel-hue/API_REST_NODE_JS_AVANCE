import { Router } from 'express';
import { EmailController } from '#controllers/email.controller';
import { asyncHandler } from '#lib/async-handler';
import prisma from '#lib/prisma';
import { config } from '#config/env';

const router = Router(***REMOVED***;

// Email verification routes
router.get('/verify-email', asyncHandler(EmailController.verifyEmail***REMOVED******REMOVED***;
router.post('/verify-email', asyncHandler(EmailController.verifyEmail***REMOVED******REMOVED***;
router.post('/resend-verification', asyncHandler(EmailController.resendVerification***REMOVED******REMOVED***;

// Debug route - GET /api/auth/debug/verification-tokens
router.get('/debug/verification-tokens', async (req, res***REMOVED*** => {
  try {
    const tokens = await prisma.verificationToken.findMany({
      include: {
        user: {
          select: {
            email: true,
            emailVerifiedAt: true,
          },
        },
      },
    }***REMOVED***;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    }***REMOVED***;

    res.json({
      success: true,
      verificationTokens: {
        count: tokens.length,
        tokens: tokens.map(t => ({
          id: t.id,
          token: t.token,
          userId: t.userId,
          userEmail: t.user.email,
          expiresAt: t.expiresAt,
          createdAt: t.createdAt,
        }***REMOVED******REMOVED***,
      },
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        emailVerifiedAt: u.emailVerifiedAt,
        createdAt: u.createdAt,
      }***REMOVED******REMOVED***,
    }***REMOVED***;
  } catch (error***REMOVED*** {
    res.status(500***REMOVED***.json({
      success: false,
      error: error.message,
    }***REMOVED***;
  }
}***REMOVED***;

// Get verification token for a specific email - GET /api/auth/get-token/:email
router.get('/get-token/:email', async (req, res***REMOVED*** => {
  try {
    const { email } = req.params;
    
    console.log(`🔍 [DEBUG] Getting token for: ${email}`***REMOVED***;
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerifiedAt: true, firstName: true },
    }***REMOVED***;
    
    if (!user***REMOVED*** {
      return res.status(404***REMOVED***.json({
        success: false,
        error: 'User not found',
      }***REMOVED***;
    }
    
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { userId: user.id },
    }***REMOVED***;
    
    const response = {
      success: true,
      user: {
        email: user.email,
        firstName: user.firstName,
        verified: user.emailVerifiedAt ? 'YES' : 'NO',
        verifiedAt: user.emailVerifiedAt,
      },
    };
    
    if (verificationToken***REMOVED*** {
      response.verificationToken = {
        exists: true,
        token: verificationToken.token,
        expiresAt: verificationToken.expiresAt,
        expiresIn: Math.round((verificationToken.expiresAt - new Date(***REMOVED******REMOVED*** / (1000 * 60 * 60***REMOVED******REMOVED*** + ' hours',
        verifyUrl: `${config.APP_URL}/api/auth/verify-email?token=${verificationToken.token}`,
        curlCommand: `curl -X POST ${config.APP_URL}/api/auth/verify-email -H "Content-Type: application/json" -d '{"token": "${verificationToken.token}"}'`,
      };
    } else {
      response.verificationToken = {
        exists: false,
        message: user.emailVerifiedAt 
          ? 'User is already verified' 
          : 'No verification token found. Try resending verification email.',
      };
    }
    
    res.json(response***REMOVED***;
    
  } catch (error***REMOVED*** {
    res.status(500***REMOVED***.json({
      success: false,
      error: error.message,
    }***REMOVED***;
  }
}***REMOVED***;

// Manual verification test endpoint - POST /api/auth/test-verify
router.post('/test-verify', async (req, res***REMOVED*** => {
  try {
    const { email } = req.body;
    
    if (!email***REMOVED*** {
      return res.status(400***REMOVED***.json({
        success: false,
        error: 'Email is required',
      }***REMOVED***;
    }
    
    console.log(`🔍 [TEST] Testing verification for: ${email}`***REMOVED***;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, emailVerifiedAt: true },
    }***REMOVED***;
    
    if (!user***REMOVED*** {
      return res.json({
        success: false,
        error: 'User not found',
      }***REMOVED***;
    }
    
    // Check if already verified
    if (user.emailVerifiedAt***REMOVED*** {
      return res.json({
        success: false,
        error: 'User already verified',
        verifiedAt: user.emailVerifiedAt,
      }***REMOVED***;
    }
    
    // Create verification token
    const verificationService = await import('#services/verification.service.js'***REMOVED***;
    const result = await verificationService.default.createAndSendVerification(user***REMOVED***;
    
    res.json({
      success: true,
      message: 'Verification test completed',
      user: {
        email: user.email,
        firstName: user.firstName,
      },
      verification: result,
    }***REMOVED***;
    
  } catch (error***REMOVED*** {
    res.status(500***REMOVED***.json({
      success: false,
      error: error.message,
    }***REMOVED***;
  }
}***REMOVED***;

export default router;