import { Router } from 'express';
import { PasswordController } from '#controllers/password.controller';
import { asyncHandler } from '#lib/async-handler';
import { auth } from '#middlewares/auth';

const router = Router();

// Public routes
router.post('/forgot', asyncHandler(PasswordController.forgotPassword));
router.get('/reset', asyncHandler(PasswordController.resetPassword)); // GET with query param
router.post('/reset', asyncHandler(PasswordController.resetPassword)); // POST with body

// Protected routes (require authentication)
router.put('/change', auth, asyncHandler(PasswordController.changePassword));
router.post('/set', auth, asyncHandler(PasswordController.setPassword));

export default router;