import prisma from '#lib/prisma';
import { hashPassword, verifyPassword } from '#lib/password';
import { BadRequestException, NotFoundException, UnauthorizedException } from '#lib/exceptions';
import { logger } from '#lib/logger';
import crypto from 'crypto';
import emailService from './email.service.js';

class PasswordService {
  /**
   * Generate a secure random token
   * @returns {string} Random token
   */
  generateToken(***REMOVED*** {
    return crypto.randomBytes(32***REMOVED***.toString('hex'***REMOVED***;
  }

  /**
   * Request password reset (forgot password***REMOVED***
   * @param {string} email - User's email
   * @returns {Promise<Object>} Result with message
   */
  async forgotPassword(email***REMOVED*** {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, lastName: true },
    }***REMOVED***;

    // Don't reveal if user exists (security best practice***REMOVED***
    if (!user***REMOVED*** {
      logger.info(`Password reset requested for non-existent email: ${email}`***REMOVED***;
      return {
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.',
      };
    }

    // Generate reset token
    const token = this.generateToken(***REMOVED***;
    const expiresAt = new Date(Date.now(***REMOVED*** + 60 * 60 * 1000***REMOVED***; // 1 hour

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    }***REMOVED***;

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    }***REMOVED***;

    // Send reset email
    await emailService.sendPasswordResetEmail(
      user.email,
      token,
      user.firstName
    ***REMOVED***;

    logger.info(`Password reset token created for user: ${user.id}`***REMOVED***;

    return {
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
    };
  }

  /**
   * Reset password with token
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result with message
   */
  async resetPassword(token, newPassword***REMOVED*** {
    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    }***REMOVED***;

    if (!resetToken***REMOVED*** {
      throw new BadRequestException('Invalid or expired reset token'***REMOVED***;
    }

    // Check if token is expired
    if (new Date(***REMOVED*** > resetToken.expiresAt***REMOVED*** {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }***REMOVED***;
      throw new BadRequestException('Reset token has expired'***REMOVED***;
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword***REMOVED***;

    // Update user's password
    await prisma.user.update({
      where: { id: resetToken.user.id },
      data: { password: hashedPassword },
    }***REMOVED***;

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    }***REMOVED***;

    // Delete all refresh tokens for this user (force logout from all devices***REMOVED***
    await prisma.refreshToken.deleteMany({
      where: { userId: resetToken.user.id },
    }***REMOVED***;

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(
      resetToken.user.email,
      resetToken.user.firstName
    ***REMOVED***;

    logger.info(`Password reset successful for user: ${resetToken.user.id}`***REMOVED***;

    return {
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  /**
   * Change password for authenticated user
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result with message
   */
  async changePassword(userId, currentPassword, newPassword***REMOVED*** {
    // Find user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, password: true, firstName: true, lastName: true },
    }***REMOVED***;

    if (!user***REMOVED*** {
      throw new NotFoundException('User not found'***REMOVED***;
    }

    // Check if user has a password (OAuth users might not have one***REMOVED***
    if (!user.password***REMOVED*** {
      throw new BadRequestException('This account uses OAuth authentication. Please set a password first.'***REMOVED***;
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(user.password, currentPassword***REMOVED***;
    if (!isPasswordValid***REMOVED*** {
      throw new UnauthorizedException('Current password is incorrect'***REMOVED***;
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword***REMOVED***;

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    }***REMOVED***;

    // Delete all refresh tokens for this user (force logout from all devices***REMOVED***
    await prisma.refreshToken.deleteMany({
      where: { userId },
    }***REMOVED***;

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(user.email, user.firstName***REMOVED***;

    logger.info(`Password changed for user: ${userId}`***REMOVED***;

    return {
      success: true,
      message: 'Password changed successfully. Please log in again.',
    };
  }

  /**
   * Set password for OAuth user (first-time setup***REMOVED***
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result with message
   */
  async setPassword(userId, newPassword***REMOVED*** {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    }***REMOVED***;

    if (!user***REMOVED*** {
      throw new NotFoundException('User not found'***REMOVED***;
    }

    // Check if user already has a password
    if (user.password***REMOVED*** {
      throw new BadRequestException('Password already set. Use change password instead.'***REMOVED***;
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword***REMOVED***;

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    }***REMOVED***;

    logger.info(`Password set for OAuth user: ${userId}`***REMOVED***;

    return {
      success: true,
      message: 'Password set successfully.',
    };
  }
}

export default new PasswordService(***REMOVED***;