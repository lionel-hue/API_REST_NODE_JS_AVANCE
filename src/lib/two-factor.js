import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

/**
 * Two-Factor Authentication (2FA/TOTP***REMOVED*** Service
 * Uses Time-based One-Time Password (TOTP***REMOVED*** algorithm
 */
class TwoFactorService {
  /**
   * Generate a new 2FA secret for a user
   * @param {string} email - User's email (for QR code label***REMOVED***
   * @returns {Object} Secret and QR code data
   */
  static generateSecret(email***REMOVED*** {
    try {
      const secret = speakeasy.generateSecret({
        name: `AuthAPI:${email}`,
        issuer: 'Auth API',
        length: 20,
      }***REMOVED***;

      console.log(`Generated 2FA secret for user: ${email}`***REMOVED***;

      return {
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url,
      };
    } catch (error***REMOVED*** {
      console.error(`Error generating 2FA secret: ${error.message}`***REMOVED***;
      throw new Error('Failed to generate 2FA secret'***REMOVED***;
    }
  }

  /**
   * Generate QR code URL for the secret
   * @param {string} otpauthUrl - OTP Auth URL
   * @returns {Promise<string>} Data URL for QR code
   */
  static async generateQRCode(otpauthUrl***REMOVED*** {
    try {
      return await qrcode.toDataURL(otpauthUrl***REMOVED***;
    } catch (error***REMOVED*** {
      console.error(`Error generating QR code: ${error.message}`***REMOVED***;
      throw new Error('Failed to generate QR code'***REMOVED***;
    }
  }

  /**
   * Verify a TOTP token against a secret
   * @param {string} secret - Base32 encoded secret
   * @param {string} token - 6-digit TOTP token from user
   * @returns {boolean} Whether token is valid
   */
  static verifyToken(secret, token***REMOVED*** {
    try {
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1, // Allow 1 step (30 seconds***REMOVED*** in either direction
      }***REMOVED***;

      console.log(`2FA verification for secret: ${verified ? 'PASS' : 'FAIL'}`***REMOVED***;
      return verified;
    } catch (error***REMOVED*** {
      console.error(`Error verifying 2FA token: ${error.message}`***REMOVED***;
      return false;
    }
  }

  /**
   * Generate backup/recovery codes for 2FA
   * @param {number} count - Number of recovery codes (default: 8***REMOVED***
   * @returns {Array<string>} Array of recovery codes
   */
  static generateRecoveryCodes(count = 8***REMOVED*** {
    const codes = [];
    for (let i = 0; i < count; i++***REMOVED*** {
      // Generate 10-character alphanumeric codes
      const code = Array.from({ length: 10 }, (***REMOVED*** => 
        Math.random(***REMOVED***.toString(36***REMOVED***[2]
      ***REMOVED***.join(''***REMOVED***.toUpperCase(***REMOVED***;
      codes.push(code***REMOVED***;
    }
    
    console.log(`Generated ${count} 2FA recovery codes`***REMOVED***;
    return codes;
  }
}

export default TwoFactorService;