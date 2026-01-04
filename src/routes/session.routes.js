import { Router } from 'express';
import { SessionController } from '#controllers/session.controller';
import { asyncHandler } from '#lib/async-handler';
import { auth } from '#middlewares/auth';

const router = Router();

// All session routes require authentication
router.use(auth);

// Get active sessions
router.get('/', asyncHandler(SessionController.getSessions));

// Revoke a specific session
router.delete('/:sessionId', asyncHandler(SessionController.revokeSession));

// Revoke all other sessions
router.delete('/others', asyncHandler(SessionController.revokeOtherSessions));

export default router;