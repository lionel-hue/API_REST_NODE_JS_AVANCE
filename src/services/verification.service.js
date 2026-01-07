import prisma from '#lib/prisma';
import { BadRequestException, NotFoundException } from '#lib/exceptions';
import { logger } from '#lib/logger';
import crypto from 'crypto';
import emailService from './email.service.js';
import { config } from '#config/env';
import os from 'os';

class VerificationService {
  /** * Generate a secure random token * @returns {string} Random token */
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /** * Get server URL dynamically * @param {Object} req - Express request object (optional) * @returns {string} Server URL */
  getServerUrl(req = null) {
    let serverUrl;
    
    // Priority 1: Use request host if available
    if (req) {
      const protocol = req.protocol || 'http';
      const host = req.get('host');
      serverUrl = `${protocol}://${host}`;
      console.log(`🔗 [VERIFICATION] Using request host: ${serverUrl}`);
    } 
    // Priority 2: Use environment variable
    else if (config.APP_URL) {
      serverUrl = config.APP_URL;
      console.log(`🔗 [VERIFICATION] Using config.APP_URL: ${serverUrl}`);
    }
    // Priority 3: Auto-detect IP
    else {
      // Auto-detect server IP
      const interfaces = os.networkInterfaces();
      let serverIP = 'localhost';
      
      for (const interfaceName in interfaces) {
        for (const iface of interfaces[interfaceName]) {
          if (!iface.internal && iface.family === 'IPv4') {
            serverIP = iface.address;
            break;
          }
        }
        if (serverIP !== 'localhost') break;
      }
      
      const port = config.PORT || 3000;
      serverUrl = `http://${serverIP}:${port}`;
      console.log(`🔗 [VERIFICATION] Auto-detected IP: ${serverUrl}`);
    }
    
    return serverUrl;
  }

  /** * Create and send verification token * @param {Object} user - User object * @param {Object} req - Express request object (optional) * @returns {Promise<Object>} Result with message */
  async createAndSendVerification(user, req = null) {
    console.log(`\n🔵 [VERIFICATION] Starting email verification for: ${user.email}`);
    
    // Check if user is already verified
    if (user.emailVerifiedAt) {
      console.log(`❌ [VERIFICATION] User ${user.email} is already verified at ${user.emailVerifiedAt}`);
      throw new BadRequestException('Email is already verified');
    }
    
    // Get server URL dynamically
    const serverUrl = this.getServerUrl(req);
    console.log(`✅ [VERIFICATION] Server URL for verification: ${serverUrl}`);
    
    // Generate verification token
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    console.log(`✅ [VERIFICATION] Generated token: ${token}`);
    console.log(`✅ [VERIFICATION] Expires at: ${expiresAt.toISOString()}`);
    console.log(`✅ [VERIFICATION] Current time: ${new Date().toISOString()}`);
    
    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });
    
    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });
    
    console.log(`✅ [VERIFICATION] Token saved to database`);
    
    // Send verification email with dynamic server URL
    console.log(`🔵 [VERIFICATION] Sending verification email...`);
    const emailSent = await emailService.sendVerificationEmail(
      user.email,
      token,
      user.firstName,
      serverUrl  // Pass the server URL
    );
    
    console.log(`✅ [VERIFICATION] Email sending result: ${emailSent ? 'SUCCESS' : 'FAILED'}`);
    
    if (!emailSent && config.NODE_ENV === 'production') {
      logger.warn(`Failed to send verification email to ${user.email}`);
    }
    
    logger.info(`Verification token created for user: ${user.id}`);
    
    return {
      success: true,
      message: 'Verification email sent. Please check your inbox.',
      // 🔒 SECURITÉ: NE JAMAIS renvoyer le token dans la réponse (EXIGENCE)
      // Le token doit être uniquement dans l'email
    };
  }

  /** * Verify email with token * @param {string} token - Verification token * @returns {Promise<Object>} Result with message */
  async verifyEmail(token) {
    console.log(`\n🔵 [VERIFICATION] Verifying token: ${token}`);
    
    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });
    
    if (!verificationToken) {
      console.log(`❌ [VERIFICATION] Token not found in database`);
      
      // Debug: List all tokens to help debugging
      const allTokens = await prisma.verificationToken.findMany({
        select: { token: true, userId: true },
      });
      
      console.log(`🔍 [VERIFICATION] Available tokens: ${allTokens.length}`);
      throw new BadRequestException('Invalid verification token');
    }
    
    console.log(`✅ [VERIFICATION] Token found for user: ${verificationToken.user.email}`);
    console.log(`✅ [VERIFICATION] Token expiry: ${verificationToken.expiresAt.toISOString()}`);
    console.log(`✅ [VERIFICATION] Current time: ${new Date().toISOString()}`);
    
    // FIXED: Check if token is expired - CORRECT COMPARISON
    if (new Date() > new Date(verificationToken.expiresAt)) {
      console.log(`❌ [VERIFICATION] Token expired at ${verificationToken.expiresAt}`);
      
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      
      throw new BadRequestException('Verification token has expired');
    }
    
    // Check if user is already verified
    if (verificationToken.user.emailVerifiedAt) {
      console.log(`❌ [VERIFICATION] User already verified at ${verificationToken.user.emailVerifiedAt}`);
      
      // Clean up token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      
      throw new BadRequestException('Email is already verified');
    }
    
    // Update user's email verification status
    await prisma.user.update({
      where: { id: verificationToken.user.id },
      data: { emailVerifiedAt: new Date() },
    });
    
    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    
    console.log(`✅ [VERIFICATION] Email verified for: ${verificationToken.user.email}`);
    console.log(`✅ [VERIFICATION] Token deleted from database`);
    
    logger.info(`Email verified for user: ${verificationToken.user.id}`);
    
    return {
      success: true,
      message: 'Email verified successfully!',
      user: {
        id: verificationToken.user.id,
        email: verificationToken.user.email,
        emailVerifiedAt: new Date(),
      },
    };
  }

  /** * Resend verification email * @param {string} email - User's email * @param {Object} req - Express request object (optional) * @returns {Promise<Object>} Result with message */
  async resendVerification(email, req = null) {
    console.log(`\n🔵 [VERIFICATION] Resending verification for: ${email}`);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerifiedAt: true,
      },
    });
    
    if (!user) {
      console.log(`❌ [VERIFICATION] User not found: ${email}`);
      
      // Don't reveal if user exists (security best practice)
      return {
        success: true,
        message: 'If an account exists with this email, you will receive verification instructions.',
      };
    }
    
    // Get server URL
    const serverUrl = this.getServerUrl(req);
    
    console.log(`✅ [VERIFICATION] User found: ${user.email}`);
    console.log(`✅ [VERIFICATION] Using server URL: ${serverUrl}`);
    
    // Create and send verification with server URL
    const result = await this.createAndSendVerification(user, req);
    
    return {
      ...result,
      message: 'If an account exists with this email, you will receive verification instructions.',
    };
  }

  /** * Check if user needs email verification * @param {Object} user - User object * @returns {boolean} Whether verification is needed */
  needsVerification(user) {
    return !user.emailVerifiedAt;
  }
}

export default new VerificationService();