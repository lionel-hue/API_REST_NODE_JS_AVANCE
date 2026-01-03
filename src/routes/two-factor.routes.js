import { Router } from 'express';
import { TwoFactorController } from '#controllers/two-factor.controller';
import { asyncHandler } from '#lib/async-handler';
import { auth } from '#middlewares/auth';
import { twoFactorLimiter } from '#middlewares/rate-limit';

const router = Router(***REMOVED***;

// All 2FA routes require authentication (except verify-login***REMOVED***
router.use(auth***REMOVED***;

// Get 2FA status
router.get('/status', asyncHandler(TwoFactorController.status***REMOVED******REMOVED***;

// Enable 2FA (generate secret & QR code***REMOVED***
router.post('/enable', asyncHandler(TwoFactorController.enable***REMOVED******REMOVED***;

// Verify 2FA token and enable
router.post('/verify', 
  twoFactorLimiter,
  asyncHandler(TwoFactorController.verify***REMOVED***
***REMOVED***;

// Disable 2FA
router.post('/disable', 
  twoFactorLimiter,
  asyncHandler(TwoFactorController.disable***REMOVED***
***REMOVED***;

export default router;