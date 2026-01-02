import { Router } from 'express';
import { EmailController } from '#controllers/email.controller';
import { asyncHandler } from '#lib/async-handler';
import prisma from '#lib/prisma';
import { config } from '#config/env';

const router = Router();

// Email verification routes
router.get('/verify-email', asyncHandler(EmailController.verifyEmail));
router.post('/verify-email', asyncHandler(EmailController.verifyEmail));
router.post('/resend-verification', asyncHandler(EmailController.resendVerification));

// Debug route - GET /api/auth/debug/verification-tokens
router.get('/debug/verification-tokens', async (req, res) => {
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
    });

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });

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
        })),
      },
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        emailVerifiedAt: u.emailVerifiedAt,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get verification token for a specific email - GET /api/auth/get-token/:email
router.get('/get-token/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log(`🔍 [DEBUG] Getting token for: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerifiedAt: true, firstName: true },
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { userId: user.id },
    });
    
    const response = {
      success: true,
      user: {
        email: user.email,
        firstName: user.firstName,
        verified: user.emailVerifiedAt ? 'YES' : 'NO',
        verifiedAt: user.emailVerifiedAt,
      },
    };
    
    if (verificationToken) {
      response.verificationToken = {
        exists: true,
        token: verificationToken.token,
        expiresAt: verificationToken.expiresAt,
        expiresIn: Math.round((verificationToken.expiresAt - new Date()) / (1000 * 60 * 60)) + ' hours',
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
    
    res.json(response);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Manual verification test endpoint - POST /api/auth/test-verify
router.post('/test-verify', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }
    
    console.log(`🔍 [TEST] Testing verification for: ${email}`);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, emailVerifiedAt: true },
    });
    
    if (!user) {
      return res.json({
        success: false,
        error: 'User not found',
      });
    }
    
    // Check if already verified
    if (user.emailVerifiedAt) {
      return res.json({
        success: false,
        error: 'User already verified',
        verifiedAt: user.emailVerifiedAt,
      });
    }
    
    // Create verification token
    const verificationService = await import('#services/verification.service.js');
    const result = await verificationService.default.createAndSendVerification(user);
    
    res.json({
      success: true,
      message: 'Verification test completed',
      user: {
        email: user.email,
        firstName: user.firstName,
      },
      verification: result,
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;