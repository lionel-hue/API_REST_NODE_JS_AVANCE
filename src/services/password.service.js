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
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Request password reset (forgot password)
   * @param {string} email - User's email
   * @returns {Promise<Object>} Result with message
   */
  async forgotPassword(email) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return {
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.',
      };
    }

    // Generate reset token
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(
      user.email,
      token,
      user.firstName
    );

    logger.info(`Password reset token created for user: ${user.id}`);

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
  async resetPassword(token, newPassword) {
    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      throw new BadRequestException('Reset token has expired');
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user's password
    await prisma.user.update({
      where: { id: resetToken.user.id },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // Delete all refresh tokens for this user (force logout from all devices)
    await prisma.refreshToken.deleteMany({
      where: { userId: resetToken.user.id },
    });

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(
      resetToken.user.email,
      resetToken.user.firstName
    );

    logger.info(`Password reset successful for user: ${resetToken.user.id}`);

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
  async changePassword(userId, currentPassword, newPassword) {
    // Find user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, password: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      throw new BadRequestException('This account uses OAuth authentication. Please set a password first.');
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(user.password, currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Delete all refresh tokens for this user (force logout from all devices)
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(user.email, user.firstName);

    logger.info(`Password changed for user: ${userId}`);

    return {
      success: true,
      message: 'Password changed successfully. Please log in again.',
    };
  }

  /**
   * Set password for OAuth user (first-time setup)
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result with message
   */
  async setPassword(userId, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has a password
    if (user.password) {
      throw new BadRequestException('Password already set. Use change password instead.');
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`Password set for OAuth user: ${userId}`);

    return {
      success: true,
      message: 'Password set successfully.',
    };
  }
}

export default new PasswordService();