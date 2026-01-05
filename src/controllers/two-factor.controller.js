import prisma from '#lib/prisma';
import { BadRequestException, NotFoundException, UnauthorizedException } from '#lib/exceptions';
import { verifyPassword } from '#lib/password';

// Import the TwoFactorService correctly (assuming it's in lib/two-factor.js)
import TwoFactorService from '#lib/two-factor';

export class TwoFactorController {
  /**
   * Get 2FA status for current user
   * GET /api/2fa/status
   */
  static async status(req, res) {
    try {
      console.log('[2FA CONTROLLER] Getting 2FA status');
      const userId = req.user?.id || req.user?.userId;
      
      if (!userId) {
        console.log('[2FA CONTROLLER] No user ID found');
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      console.log(`[2FA CONTROLLER] Getting user: ${userId}`);
      
      // Get user with two-factor fields
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          twoFactorSecret: true,
          twoFactorEnabledAt: true,
        },
      });

      if (!user) {
        console.log(`[2FA CONTROLLER] User not found: ${userId}`);
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      console.log(`[2FA CONTROLLER] User found: ${user.email}`);
      console.log(`[2FA CONTROLLER] 2FA Secret exists: ${!!user.twoFactorSecret}`);
      console.log(`[2FA CONTROLLER] 2FA Enabled At: ${user.twoFactorEnabledAt}`);

      res.json({
        success: true,
        data: {
          enabled: !!user.twoFactorSecret && !!user.twoFactorEnabledAt,
          hasSecret: !!user.twoFactorSecret,
          setupComplete: !!user.twoFactorSecret && !!user.twoFactorEnabledAt,
          // Additional info for debugging
          _debug: {
            secretExists: !!user.twoFactorSecret,
            enabledAt: user.twoFactorEnabledAt,
            isEnabled: !!user.twoFactorSecret && !!user.twoFactorEnabledAt,
          }
        },
      });
    } catch (error) {
      console.error(`[2FA CONTROLLER] Error getting 2FA status:`, error);
      console.error(error.stack);
      res.status(500).json({
        success: false,
        error: 'Failed to get 2FA status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Enable 2FA for current user
   * POST /api/2fa/enable
   * Generates secret and QR code
   */
  static async enable(req, res) {
    try {
      console.log('[2FA CONTROLLER] Enabling 2FA');
      const userId = req.user?.id || req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          twoFactorSecret: true,
          twoFactorEnabledAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Check if 2FA is already enabled
      if (user.twoFactorSecret && user.twoFactorEnabledAt) {
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

      // Store secret temporarily (will be enabled after verification)
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorSecret: secretData.secret,
          twoFactorEnabledAt: null, // Not enabled until verified
        },
      });

      console.log(`[2FA CONTROLLER] 2FA setup initiated for user: ${user.email}`);

      res.json({
        success: true,
        message: '2FA setup initiated. Scan QR code and verify with token.',
        data: {
          secret: secretData.secret, // Only for manual entry
          qrCode,
          recoveryCodes,
          manualEntryKey: `otpauth://totp/AuthAPI:${user.email}?secret=${secretData.secret}&issuer=AuthAPI`,
          note: 'Save recovery codes in a secure place. They will not be shown again.',
        },
      });
    } catch (error) {
      console.error(`[2FA CONTROLLER] Error enabling 2FA:`, error);
      console.error(error.stack);
      res.status(500).json({
        success: false,
        error: 'Failed to enable 2FA',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
      console.log('[2FA CONTROLLER] Verifying 2FA token');
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

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          twoFactorSecret: true,
          twoFactorEnabledAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Check if 2FA secret exists
      if (!user.twoFactorSecret) {
        return res.status(400).json({
          success: false,
          error: '2FA not set up. Please enable 2FA first.',
        });
      }

      // Check if already enabled
      if (user.twoFactorEnabledAt) {
        return res.status(400).json({
          success: false,
          error: '2FA is already enabled',
        });
      }

      // Verify token
      const isValid = TwoFactorService.verifyToken(user.twoFactorSecret, token);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid 2FA token',
        });
      }

      // Enable 2FA
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabledAt: new Date(),
        },
      });

      console.log(`[2FA CONTROLLER] 2FA enabled for user: ${user.email}`);

      res.json({
        success: true,
        message: '2FA has been enabled successfully',
        data: {
          enabledAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`[2FA CONTROLLER] Error verifying 2FA:`, error);
      console.error(error.stack);
      res.status(500).json({
        success: false,
        error: 'Failed to verify 2FA',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Disable 2FA for current user
   * POST /api/2fa/disable
   */
  static async disable(req, res) {
    try {
      console.log('[2FA CONTROLLER] Disabling 2FA');
      const userId = req.user?.id || req.user?.userId;
      const { token, password } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      // Get user with password for verification
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          password: true,
          twoFactorSecret: true,
          twoFactorEnabledAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Check if 2FA is enabled
      if (!user.twoFactorSecret || !user.twoFactorEnabledAt) {
        return res.status(400).json({
          success: false,
          error: '2FA is not enabled',
        });
      }

      // If user has password, verify it
      if (user.password) {
        if (!password) {
          return res.status(400).json({
            success: false,
            error: 'Password is required to disable 2FA',
          });
        }
        
        const isPasswordValid = await verifyPassword(user.password, password);
        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            error: 'Invalid password',
          });
        }
      } else {
        // For OAuth users without password, require token
        if (!token) {
          return res.status(400).json({
            success: false,
            error: '2FA token is required to disable 2FA',
          });
        }
        
        const isValid = TwoFactorService.verifyToken(user.twoFactorSecret, token);
        if (!isValid) {
          return res.status(401).json({
            success: false,
            error: 'Invalid 2FA token',
          });
        }
      }

      // Disable 2FA by clearing the fields
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorSecret: null,
          twoFactorEnabledAt: null,
        },
      });

      console.log(`[2FA CONTROLLER] 2FA disabled for user: ${user.email}`);

      res.json({
        success: true,
        message: '2FA has been disabled successfully',
      });
    } catch (error) {
      console.error(`[2FA CONTROLLER] Error disabling 2FA:`, error);
      console.error(error.stack);
      res.status(500).json({
        success: false,
        error: 'Failed to disable 2FA',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}