import { Router } from 'express';
import { PasswordController } from '#controllers/password.controller';
import { asyncHandler } from '#lib/async-handler';
import { auth } from '#middlewares/auth';

const router = Router(***REMOVED***;

// Public routes
router.post('/forgot', asyncHandler(PasswordController.forgotPassword***REMOVED******REMOVED***;
router.get('/reset', asyncHandler(PasswordController.resetPassword***REMOVED******REMOVED***; // GET with query param
router.post('/reset', asyncHandler(PasswordController.resetPassword***REMOVED******REMOVED***; // POST with body

// Protected routes (require authentication***REMOVED***
router.put('/change', auth, asyncHandler(PasswordController.changePassword***REMOVED******REMOVED***;
router.post('/set', auth, asyncHandler(PasswordController.setPassword***REMOVED******REMOVED***;

export default router;