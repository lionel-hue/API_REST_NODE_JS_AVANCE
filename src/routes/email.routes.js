import { Router } from 'express';
import { EmailController } from '#controllers/email.controller';
import { asyncHandler } from '#lib/async-handler';

import prisma from '#lib/prisma';  //for testing

const router = Router(***REMOVED***;

// Email verification routes
router.get('/verify-email', asyncHandler(EmailController.verifyEmail***REMOVED******REMOVED***; // GET with query param
router.post('/verify-email', asyncHandler(EmailController.verifyEmail***REMOVED******REMOVED***; // POST with body
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
                    token: t.token, // Show full token for testing
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


export default router;