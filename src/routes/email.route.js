import { Router } from 'express';
import { EmailController } from '#controllers/email.controller';
import { asyncHandler } from '#lib/async-handler';

const router = Router();

// Email verification routes
router.get('/verify-email', asyncHandler(EmailController.verifyEmail)); // GET with query param
router.post('/verify-email', asyncHandler(EmailController.verifyEmail)); // POST with body
router.post('/resend-verification', asyncHandler(EmailController.resendVerification));

export default router;