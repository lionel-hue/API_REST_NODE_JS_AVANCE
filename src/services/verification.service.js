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
  generateToken(***REMOVED*** {
    return crypto.randomBytes(32***REMOVED***.toString('hex'***REMOVED***;
  }

  /**
   * Create and send verification token
   * @param {Object} user - User object
   * @returns {Promise<Object>} Result with token
   */
  async createAndSendVerification(user***REMOVED*** {
    // Check if user is already verified
    if (user.emailVerifiedAt***REMOVED*** {
      throw new BadRequestException('Email is already verified'***REMOVED***;
    }

    // Generate verification token
    const token = this.generateToken(***REMOVED***;
    const expiresAt = new Date(Date.now(***REMOVED*** + 24 * 60 * 60 * 1000***REMOVED***; // 24 hours

    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    }***REMOVED***;

    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    }***REMOVED***;

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(
      user.email,
      token,
      user.firstName
    ***REMOVED***;

    if (!emailSent && process.env.NODE_ENV === 'production'***REMOVED*** {
      logger.warn(`Failed to send verification email to ${user.email}`***REMOVED***;
    }

    logger.info(`Verification token created for user: ${user.id}`***REMOVED***;

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
  async verifyEmail(token***REMOVED*** {
    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    }***REMOVED***;

    if (!verificationToken***REMOVED*** {
      throw new BadRequestException('Invalid verification token'***REMOVED***;
    }

    // Check if token is expired
    if (new Date(***REMOVED*** > verificationToken.expiresAt***REMOVED*** {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      }***REMOVED***;
      throw new BadRequestException('Verification token has expired'***REMOVED***;
    }

    // Check if user is already verified
    if (verificationToken.user.emailVerifiedAt***REMOVED*** {
      // Clean up token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      }***REMOVED***;
      throw new BadRequestException('Email is already verified'***REMOVED***;
    }

    // Update user's email verification status
    await prisma.user.update({
      where: { id: verificationToken.user.id },
      data: { emailVerifiedAt: new Date(***REMOVED*** },
    }***REMOVED***;

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    }***REMOVED***;

    logger.info(`Email verified for user: ${verificationToken.user.id}`***REMOVED***;

    return {
      success: true,
      message: 'Email verified successfully!',
      user: {
        id: verificationToken.user.id,
        email: verificationToken.user.email,
        emailVerifiedAt: new Date(***REMOVED***,
      },
    };
  }

  /**
   * Resend verification email
   * @param {string} email - User's email
   * @returns {Promise<Object>} Result with message
   */
  async resendVerification(email***REMOVED*** {
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
    }***REMOVED***;

    if (!user***REMOVED*** {
      // Don't reveal if user exists (security best practice***REMOVED***
      return {
        success: true,
        message: 'If an account exists with this email, you will receive verification instructions.',
      };
    }

    // Create and send verification
    const result = await this.createAndSendVerification(user***REMOVED***;

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
  needsVerification(user***REMOVED*** {
    return !user.emailVerifiedAt;
  }
}

export default new VerificationService(***REMOVED***;