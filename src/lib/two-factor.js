import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

/**
 * Two-Factor Authentication (2FA/TOTP) Service
 * Uses Time-based One-Time Password (TOTP) algorithm
 */
class TwoFactorService {
  /**
   * Generate a new 2FA secret for a user
   * @param {string} email - User's email (for QR code label)
   * @returns {Object} Secret and QR code data
   */
  static generateSecret(email) {
    try {
      const secret = speakeasy.generateSecret({
        name: `AuthAPI:${email}`,
        issuer: 'Auth API',
        length: 20,
      });

      console.log(`Generated 2FA secret for user: ${email}`);

      return {
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url,
      };
    } catch (error) {
      console.error(`Error generating 2FA secret: ${error.message}`);
      throw new Error('Failed to generate 2FA secret');
    }
  }

  /**
   * Generate QR code URL for the secret
   * @param {string} otpauthUrl - OTP Auth URL
   * @returns {Promise<string>} Data URL for QR code
   */
  static async generateQRCode(otpauthUrl) {
    try {
      return await qrcode.toDataURL(otpauthUrl);
    } catch (error) {
      console.error(`Error generating QR code: ${error.message}`);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify a TOTP token against a secret
   * @param {string} secret - Base32 encoded secret
   * @param {string} token - 6-digit TOTP token from user
   * @returns {boolean} Whether token is valid
   */
  static verifyToken(secret, token) {
    try {
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1, // Allow 1 step (30 seconds) in either direction
      });

      console.log(`2FA verification for secret: ${verified ? 'PASS' : 'FAIL'}`);
      return verified;
    } catch (error) {
      console.error(`Error verifying 2FA token: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate backup/recovery codes for 2FA
   * @param {number} count - Number of recovery codes (default: 8)
   * @returns {Array<string>} Array of recovery codes
   */
  static generateRecoveryCodes(count = 8) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Generate 10-character alphanumeric codes
      const code = Array.from({ length: 10 }, () => 
        Math.random().toString(36)[2]
      ).join('').toUpperCase();
      codes.push(code);
    }
    
    console.log(`Generated ${count} 2FA recovery codes`);
    return codes;
  }
}

export default TwoFactorService;