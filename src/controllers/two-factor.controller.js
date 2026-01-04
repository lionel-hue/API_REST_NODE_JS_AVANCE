import TwoFactorService from '#lib/two-factor';
import prisma from '#lib/prisma';

export class TwoFactorController {
  /**
   * Enable 2FA for current user
   * POST /api/2fa/enable
   * Generates secret and QR code
   */
  static async enable(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: { twoFA: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Check if 2FA is already enabled
      if (user.twoFA?.enabled) {
        return res.status(400).json({
          success: false,
          error: '2FA is already enabled',
        });
      }

      // Generate new secret
      const secretData = TwoFactorService.generateSecret(user.email);
      
      // Generate QR code
      const qrCode = await TwoFactorService.generateQRCode(secretData.otpauthUrl);
      
      // Generate recovery codes
      const recoveryCodes = TwoFactorService.generateRecoveryCodes(8);

      // Store secret temporarily (will be saved after verification)
      // For now, we'll create the TwoFA record but not enable it
      if (user.twoFA) {
        // Update existing
        await prisma.twoFA.update({
          where: { id: user.twoFA.id },
          data: {
            secret: secretData.secret,
            enabled: false,
          },
        });
      } else {
        // Create new
        await prisma.twoFA.create({
          data: {
            userId: user.id,
            secret: secretData.secret,
            enabled: false,
          },
        });
      }

      console.log(`2FA setup initiated for user: ${user.email}`);

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
      });
    } catch (error) {
      console.error(`Error enabling 2FA: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Failed to enable 2FA',
      });
    }
  }

  /**
   * Verify and enable 2FA with token
   * POST /api/2fa/verify
   * Verifies token and enables 2FA
   */
  static async verify(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { token } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      if (!token || token.length !== 6) {
        return res.status(400).json({
          success: false,
          error: 'Valid 6-digit token is required',
        });
      }

      // Get user with TwoFA
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: { twoFA: true },
      });

      if (!user || !user.twoFA) {
        return res.status(400).json({
          success: false,
          error: '2FA not set up. Please enable 2FA first.',
        });
      }

      // Check if already enabled
      if (user.twoFA.enabled) {
        return res.status(400).json({
          success: false,
          error: '2FA is already enabled',
        });
      }

      // Verify token
      const isValid = TwoFactorService.verifyToken(user.twoFA.secret, token);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid 2FA token',
        });
      }

      // Enable 2FA
      await prisma.twoFA.update({
        where: { id: user.twoFA.id },
        data: { enabled: true },
      });

      console.log(`2FA enabled for user: ${user.email}`);

      res.json({
        success: true,
        message: '2FA has been enabled successfully',
        data: {
          enabledAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`Error verifying 2FA: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Failed to verify 2FA',
      });
    }
  }

  /**
   * Disable 2FA for current user
   * POST /api/2fa/disable
   */
  static async disable(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { password, token } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      // Get user with TwoFA
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: { twoFA: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Check if 2FA is enabled
      if (!user.twoFA || !user.twoFA.enabled) {
        return res.status(400).json({
          success: false,
          error: '2FA is not enabled',
        });
      }

      // Verify password (you need to implement password verification)
      // For now, we'll require token
      if (!token) {
        return res.status(400).json({
          success: false,
          error: '2FA token is required to disable 2FA',
        });
      }

      // Verify 2FA token
      const isValid = TwoFactorService.verifyToken(user.twoFA.secret, token);
      
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid 2FA token',
        });
      }

      // Delete TwoFA record
      await prisma.twoFA.delete({
        where: { id: user.twoFA.id },
      });

      console.log(`2FA disabled for user: ${user.email}`);

      res.json({
        success: true,
        message: '2FA has been disabled successfully',
      });
    } catch (error) {
      console.error(`Error disabling 2FA: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Failed to disable 2FA',
      });
    }
  }

  /**
   * Get 2FA status for current user
   * GET /api/2fa/status
   */
  static async status(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      // Get user with TwoFA
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: { twoFA: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.json({
        success: true,
        data: {
          enabled: user.twoFA?.enabled || false,
          hasSecret: !!user.twoFA?.secret,
          setupComplete: user.twoFA?.enabled || false,
        },
      });
    } catch (error) {
      console.error(`Error getting 2FA status: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Failed to get 2FA status',
      });
    }
  }
}