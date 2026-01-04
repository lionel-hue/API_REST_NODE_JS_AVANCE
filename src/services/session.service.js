import prisma from '#lib/prisma';

/**
 * Service for managing user sessions
 */
class SessionService {
  /**
   * Get all active sessions (refresh tokens) for a user
   * @param {number|string} userId - User ID
   * @returns {Promise<Array>} Active sessions
   */
  static async getActiveSessions(userId) {
    try {
      const now = new Date();
      console.log(`[SESSION SERVICE] Getting active sessions for user: ${userId}, type: ${typeof userId}`);
      
      // Get all active refresh tokens (non-revoked, not expired)
      const sessions = await prisma.refreshToken.findMany({
        where: {
          userId: userId,
          revokedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          userAgent: true,
          ipAddress: true,
          createdAt: true,
          expiresAt: true,
        },
      });
      
      console.log(`[SESSION SERVICE] Found ${sessions.length} active sessions`);
      return sessions;
    } catch (error) {
      console.error(`[SESSION SERVICE] Failed to get sessions for user ${userId}: ${error.message}`);
      console.error(error.stack);
      throw error;
    }
  }

  /**
   * Revoke a specific session (refresh token)
   * @param {number|string} userId - User ID
   * @param {number|string} sessionId - Session ID to revoke
   * @returns {Promise<Object>} Result
   */
  static async revokeSession(userId, sessionId) {
    try {
      console.log(`[SESSION SERVICE] Revoking session ${sessionId} for user ${userId}`);
      
      // Find the refresh token
      const refreshToken = await prisma.refreshToken.findUnique({
        where: { id: sessionId },
      });
      
      if (!refreshToken) {
        throw new Error('Session not found');
      }
      
      // Verify session belongs to user
      if (refreshToken.userId !== userId) {
        throw new Error('Not authorized to revoke this session');
      }
      
      // Revoke the refresh token
      await prisma.refreshToken.update({
        where: { id: sessionId },
        data: { revokedAt: new Date() },
      });
      
      console.log(`[SESSION SERVICE] Session revoked: ${sessionId} for user ${userId}`);
      return { success: true, message: 'Session revoked successfully' };
    } catch (error) {
      console.error(`[SESSION SERVICE] Failed to revoke session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Revoke all other sessions (except current)
   * @param {number|string} userId - User ID
   * @param {number|string} currentSessionId - Current session ID to keep
   * @returns {Promise<Object>} Result
   */
  static async revokeOtherSessions(userId, currentSessionId) {
    try {
      console.log(`[SESSION SERVICE] Revoking all other sessions for user ${userId}, keeping ${currentSessionId}`);
      
      const now = new Date();
      await prisma.refreshToken.updateMany({
        where: {
          userId: userId,
          id: { not: currentSessionId },
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: { revokedAt: new Date() },
      });
      
      console.log(`[SESSION SERVICE] All other sessions revoked for user ${userId}`);
      return { success: true, message: 'All other sessions have been revoked' };
    } catch (error) {
      console.error(`[SESSION SERVICE] Failed to revoke other sessions: ${error.message}`);
      throw error;
    }
  }
}

export default SessionService;