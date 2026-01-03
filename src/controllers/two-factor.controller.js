import TwoFactorService from '#lib/two-factor';
import prisma from '#lib/prisma';

export class TwoFactorController {
  /**
   * Enable 2FA for current user
   * POST /api/2fa/enable
   * Generates secret and QR code
   */
  static async enable(req, res***REMOVED*** {
    try {
      const userId = req.user?.id || req.user?.userId;
      
      if (!userId***REMOVED*** {
        return res.status(401***REMOVED***.json({
          success: false,
          error: 'Authentication required',
        }***REMOVED***;
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId***REMOVED*** },
        include: { twoFA: true },
      }***REMOVED***;

      if (!user***REMOVED*** {
        return res.status(404***REMOVED***.json({
          success: false,
          error: 'User not found',
        }***REMOVED***;
      }

      // Check if 2FA is already enabled
      if (user.twoFA?.enabled***REMOVED*** {
        return res.status(400***REMOVED***.json({
          success: false,
          error: '2FA is already enabled',
        }***REMOVED***;
      }

      // Generate new secret
      const secretData = TwoFactorService.generateSecret(user.email***REMOVED***;
      
      // Generate QR code
      const qrCode = await TwoFactorService.generateQRCode(secretData.otpauthUrl***REMOVED***;
      
      // Generate recovery codes
      const recoveryCodes = TwoFactorService.generateRecoveryCodes(8***REMOVED***;

      // Store secret temporarily (will be saved after verification***REMOVED***
      // For now, we'll create the TwoFA record but not enable it
      if (user.twoFA***REMOVED*** {
        // Update existing
        await prisma.twoFA.update({
          where: { id: user.twoFA.id },
          data: {
            secret: secretData.secret,
            enabled: false,
          },
        }***REMOVED***;
      } else {
        // Create new
        await prisma.twoFA.create({
          data: {
            userId: user.id,
            secret: secretData.secret,
            enabled: false,
          },
        }***REMOVED***;
      }

      console.log(`2FA setup initiated for user: ${user.email}`***REMOVED***;

      res.json({
        success: true,
        message: '2FA setup initiated. Scan QR code and verify with token.',
        data: {
          secret: secretData.secret, // Only for manual entry
          qrCode,
          recoveryCodes, // Show to user once
          manualEntryKey: `otpauth://totp/AuthAPI:${user.email}?secret=${secretData.secret}&issuer=AuthAPI`,
          note: 'Save recovery codes in a secure place. They will not be shown again.',
        },
      }***REMOVED***;
    } catch (error***REMOVED*** {
      console.error(`Error enabling 2FA: ${error.message}`***REMOVED***;
      res.status(500***REMOVED***.json({
        success: false,
        error: 'Failed to enable 2FA',
      }***REMOVED***;
    }
  }

  /**
   * Verify and enable 2FA with token
   * POST /api/2fa/verify
   * Verifies token and enables 2FA
   */
  static async verify(req, res***REMOVED*** {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { token } = req.body;

      if (!userId***REMOVED*** {
        return res.status(401***REMOVED***.json({
          success: false,
          error: 'Authentication required',
        }***REMOVED***;
      }

      if (!token || token.length !== 6***REMOVED*** {
        return res.status(400***REMOVED***.json({
          success: false,
          error: 'Valid 6-digit token is required',
        }***REMOVED***;
      }

      // Get user with TwoFA
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId***REMOVED*** },
        include: { twoFA: true },
      }***REMOVED***;

      if (!user || !user.twoFA***REMOVED*** {
        return res.status(400***REMOVED***.json({
          success: false,
          error: '2FA not set up. Please enable 2FA first.',
        }***REMOVED***;
      }

      // Check if already enabled
      if (user.twoFA.enabled***REMOVED*** {
        return res.status(400***REMOVED***.json({
          success: false,
          error: '2FA is already enabled',
        }***REMOVED***;
      }

      // Verify token
      const isValid = TwoFactorService.verifyToken(user.twoFA.secret, token***REMOVED***;
      
      if (!isValid***REMOVED*** {
        return res.status(400***REMOVED***.json({
          success: false,
          error: 'Invalid 2FA token',
        }***REMOVED***;
      }

      // Enable 2FA
      await prisma.twoFA.update({
        where: { id: user.twoFA.id },
        data: { enabled: true },
      }***REMOVED***;

      console.log(`2FA enabled for user: ${user.email}`***REMOVED***;

      res.json({
        success: true,
        message: '2FA has been enabled successfully',
        data: {
          enabledAt: new Date(***REMOVED***,
        },
      }***REMOVED***;
    } catch (error***REMOVED*** {
      console.error(`Error verifying 2FA: ${error.message}`***REMOVED***;
      res.status(500***REMOVED***.json({
        success: false,
        error: 'Failed to verify 2FA',
      }***REMOVED***;
    }
  }

  /**
   * Disable 2FA for current user
   * POST /api/2fa/disable
   */
  static async disable(req, res***REMOVED*** {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { password, token } = req.body;

      if (!userId***REMOVED*** {
        return res.status(401***REMOVED***.json({
          success: false,
          error: 'Authentication required',
        }***REMOVED***;
      }

      // Get user with TwoFA
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId***REMOVED*** },
        include: { twoFA: true },
      }***REMOVED***;

      if (!user***REMOVED*** {
        return res.status(404***REMOVED***.json({
          success: false,
          error: 'User not found',
        }***REMOVED***;
      }

      // Check if 2FA is enabled
      if (!user.twoFA || !user.twoFA.enabled***REMOVED*** {
        return res.status(400***REMOVED***.json({
          success: false,
          error: '2FA is not enabled',
        }***REMOVED***;
      }

      // Verify password (you need to implement password verification***REMOVED***
      // For now, we'll require token
      if (!token***REMOVED*** {
        return res.status(400***REMOVED***.json({
          success: false,
          error: '2FA token is required to disable 2FA',
        }***REMOVED***;
      }

      // Verify 2FA token
      const isValid = TwoFactorService.verifyToken(user.twoFA.secret, token***REMOVED***;
      
      if (!isValid***REMOVED*** {
        return res.status(401***REMOVED***.json({
          success: false,
          error: 'Invalid 2FA token',
        }***REMOVED***;
      }

      // Delete TwoFA record
      await prisma.twoFA.delete({
        where: { id: user.twoFA.id },
      }***REMOVED***;

      console.log(`2FA disabled for user: ${user.email}`***REMOVED***;

      res.json({
        success: true,
        message: '2FA has been disabled successfully',
      }***REMOVED***;
    } catch (error***REMOVED*** {
      console.error(`Error disabling 2FA: ${error.message}`***REMOVED***;
      res.status(500***REMOVED***.json({
        success: false,
        error: 'Failed to disable 2FA',
      }***REMOVED***;
    }
  }

  /**
   * Get 2FA status for current user
   * GET /api/2fa/status
   */
  static async status(req, res***REMOVED*** {
    try {
      const userId = req.user?.id || req.user?.userId;
      
      if (!userId***REMOVED*** {
        return res.status(401***REMOVED***.json({
          success: false,
          error: 'Authentication required',
        }***REMOVED***;
      }

      // Get user with TwoFA
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId***REMOVED*** },
        include: { twoFA: true },
      }***REMOVED***;

      if (!user***REMOVED*** {
        return res.status(404***REMOVED***.json({
          success: false,
          error: 'User not found',
        }***REMOVED***;
      }

      res.json({
        success: true,
        data: {
          enabled: user.twoFA?.enabled || false,
          hasSecret: !!user.twoFA?.secret,
          setupComplete: user.twoFA?.enabled || false,
        },
      }***REMOVED***;
    } catch (error***REMOVED*** {
      console.error(`Error getting 2FA status: ${error.message}`***REMOVED***;
      res.status(500***REMOVED***.json({
        success: false,
        error: 'Failed to get 2FA status',
      }***REMOVED***;
    }
  }
}