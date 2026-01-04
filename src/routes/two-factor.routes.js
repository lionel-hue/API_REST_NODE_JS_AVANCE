import { Router } from 'express';
import { TwoFactorController } from '#controllers/two-factor.controller';
import { asyncHandler } from '#lib/async-handler';
import { auth } from '#middlewares/auth';
import { twoFactorLimiter } from '#middlewares/rate-limit';

const router = Router();

// All 2FA routes require authentication (except verify-login)
router.use(auth);

// Get 2FA status
router.get('/status', asyncHandler(TwoFactorController.status));

// Enable 2FA (generate secret & QR code)
router.post('/enable', asyncHandler(TwoFactorController.enable));

// Verify 2FA token and enable
router.post('/verify', 
  twoFactorLimiter,
  asyncHandler(TwoFactorController.verify)
);

// Disable 2FA
router.post('/disable', 
  twoFactorLimiter,
  asyncHandler(TwoFactorController.disable)
);

export default router;