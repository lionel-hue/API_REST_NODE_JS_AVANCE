import { Router } from 'express';
import { EmailController } from '#controllers/email.controller';
import { asyncHandler } from '#lib/async-handler';

const router = Router(***REMOVED***;

// Email verification routes
router.get('/verify-email', asyncHandler(EmailController.verifyEmail***REMOVED******REMOVED***; // GET with query param
router.post('/verify-email', asyncHandler(EmailController.verifyEmail***REMOVED******REMOVED***; // POST with body
router.post('/resend-verification', asyncHandler(EmailController.resendVerification***REMOVED******REMOVED***;

export default router;