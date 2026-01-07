import prisma from '#lib/prisma';
import { BadRequestException, NotFoundException } from '#lib/exceptions';
import { logger } from '#lib/logger';
import crypto from 'crypto';
import emailService from './email.service.js';
import { config } from '#config/env';

class VerificationService {
  /**
   * Generate a secure random token
   * @returns {string} Random token
   */
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create and send verification token
   * @param {Object} user - User object
   * @returns {Promise<Object>} Result with token
   */
  async createAndSendVerification(user) {
    console.log(`\n🔵 [VERIFICATION] Starting email verification for: ${user.email}`);

    // Check if user is already verified
    if (user.emailVerifiedAt) {
      console.log(`❌ [VERIFICATION] User ${user.email} is already verified at ${user.emailVerifiedAt}`);
      throw new BadRequestException('Email is already verified');
    }

    // Generate verification token
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log(`✅ [VERIFICATION] Generated token: ${token}`);
    console.log(`✅ [VERIFICATION] Expires at: ${expiresAt}`);

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

    // Send verification email
    console.log(`🔵 [VERIFICATION] Sending verification email...`);
    const emailSent = await emailService.sendVerificationEmail(
      user.email,
      token,
      user.firstName
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

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Result with message
   */
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

    // Check if token is expired
    if (new Date() > verificationToken.expiresAt) {
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

  /**
   * Resend verification email
   * @param {string} email - User's email
   * @returns {Promise<Object>} Result with message
   */
  async resendVerification(email) {
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

    // Create and send verification
    console.log(`✅ [VERIFICATION] User found: ${user.email}`);
    const result = await this.createAndSendVerification(user);

    return {
      ...result,
      message: 'If an account exists with this email, you will receive verification instructions.',
    };
  }

  /**
   * Check if user needs email verification
   * @param {Object} user - User object
   * @returns {boolean} Whether verification is needed
   */
  needsVerification(user) {
    return !user.emailVerifiedAt;
  }
}

export default new VerificationService();