import { Router } from 'express';
import { SessionController } from '#controllers/session.controller';
import { asyncHandler } from '#lib/async-handler';
import { auth } from '#middlewares/auth';

const router = Router(***REMOVED***;

// All session routes require authentication
router.use(auth***REMOVED***;

// Get active sessions
router.get('/', asyncHandler(SessionController.getSessions***REMOVED******REMOVED***;

// Revoke a specific session
router.delete('/:sessionId', asyncHandler(SessionController.revokeSession***REMOVED******REMOVED***;

// Revoke all other sessions
router.delete('/others', asyncHandler(SessionController.revokeOtherSessions***REMOVED******REMOVED***;

export default router;