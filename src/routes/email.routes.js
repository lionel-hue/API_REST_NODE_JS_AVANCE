import { Router } from 'express';
import { EmailController } from '#controllers/email.controller';
import { asyncHandler } from '#lib/async-handler';

import prisma from '#lib/prisma';  //for testing

const router = Router();

// Email verification routes
router.get('/verify-email', asyncHandler(EmailController.verifyEmail)); // GET with query param
router.post('/verify-email', asyncHandler(EmailController.verifyEmail)); // POST with body
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
                    token: t.token, // Show full token for testing
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


export default router;