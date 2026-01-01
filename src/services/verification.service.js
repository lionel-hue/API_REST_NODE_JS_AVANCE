import prisma from '#lib/prisma';
import { BadRequestException, NotFoundException } from '#lib/exceptions';
import { logger } from '#lib/logger';
import crypto from 'crypto';
import emailService from './email.service.js';

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
    // Check if user is already verified
    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate verification token
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(
      user.email,
      token,
      user.firstName
    );

    if (!emailSent && process.env.NODE_ENV === 'production') {
      logger.warn(`Failed to send verification email to ${user.email}`);
    }

    logger.info(`Verification token created for user: ${user.id}`);

    return {
      success: true,
      message: 'Verification email sent. Please check your inbox.',
      token: process.env.NODE_ENV === 'development' ? token : undefined, // Only return in dev
    };
  }

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Result with message
   */
  async verifyEmail(token) {
    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    // Check if token is expired
    if (new Date() > verificationToken.expiresAt) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      throw new BadRequestException('Verification token has expired');
    }

    // Check if user is already verified
    if (verificationToken.user.emailVerifiedAt) {
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
      // Don't reveal if user exists (security best practice)
      return {
        success: true,
        message: 'If an account exists with this email, you will receive verification instructions.',
      };
    }

    // Create and send verification
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