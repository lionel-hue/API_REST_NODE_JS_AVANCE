import prisma from '#lib/prisma';

/**
 * Service for managing user sessions
 */
class SessionService {
  /**
   * Get all active sessions (refresh tokens***REMOVED*** for a user
   * @param {number|string} userId - User ID
   * @returns {Promise<Array>} Active sessions
   */
  static async getActiveSessions(userId***REMOVED*** {
    try {
      const now = new Date(***REMOVED***;
      console.log(`[SESSION SERVICE] Getting active sessions for user: ${userId}, type: ${typeof userId}`***REMOVED***;
      
      // Get all active refresh tokens (non-revoked, not expired***REMOVED***
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
      }***REMOVED***;
      
      console.log(`[SESSION SERVICE] Found ${sessions.length} active sessions`***REMOVED***;
      return sessions;
    } catch (error***REMOVED*** {
      console.error(`[SESSION SERVICE] Failed to get sessions for user ${userId}: ${error.message}`***REMOVED***;
      console.error(error.stack***REMOVED***;
      throw error;
    }
  }

  /**
   * Revoke a specific session (refresh token***REMOVED***
   * @param {number|string} userId - User ID
   * @param {number|string} sessionId - Session ID to revoke
   * @returns {Promise<Object>} Result
   */
  static async revokeSession(userId, sessionId***REMOVED*** {
    try {
      console.log(`[SESSION SERVICE] Revoking session ${sessionId} for user ${userId}`***REMOVED***;
      
      // Find the refresh token
      const refreshToken = await prisma.refreshToken.findUnique({
        where: { id: sessionId },
      }***REMOVED***;
      
      if (!refreshToken***REMOVED*** {
        throw new Error('Session not found'***REMOVED***;
      }
      
      // Verify session belongs to user
      if (refreshToken.userId !== userId***REMOVED*** {
        throw new Error('Not authorized to revoke this session'***REMOVED***;
      }
      
      // Revoke the refresh token
      await prisma.refreshToken.update({
        where: { id: sessionId },
        data: { revokedAt: new Date(***REMOVED*** },
      }***REMOVED***;
      
      console.log(`[SESSION SERVICE] Session revoked: ${sessionId} for user ${userId}`***REMOVED***;
      return { success: true, message: 'Session revoked successfully' };
    } catch (error***REMOVED*** {
      console.error(`[SESSION SERVICE] Failed to revoke session: ${error.message}`***REMOVED***;
      throw error;
    }
  }

  /**
   * Revoke all other sessions (except current***REMOVED***
   * @param {number|string} userId - User ID
   * @param {number|string} currentSessionId - Current session ID to keep
   * @returns {Promise<Object>} Result
   */
  static async revokeOtherSessions(userId, currentSessionId***REMOVED*** {
    try {
      console.log(`[SESSION SERVICE] Revoking all other sessions for user ${userId}, keeping ${currentSessionId}`***REMOVED***;
      
      const now = new Date(***REMOVED***;
      await prisma.refreshToken.updateMany({
        where: {
          userId: userId,
          id: { not: currentSessionId },
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: { revokedAt: new Date(***REMOVED*** },
      }***REMOVED***;
      
      console.log(`[SESSION SERVICE] All other sessions revoked for user ${userId}`***REMOVED***;
      return { success: true, message: 'All other sessions have been revoked' };
    } catch (error***REMOVED*** {
      console.error(`[SESSION SERVICE] Failed to revoke other sessions: ${error.message}`***REMOVED***;
      throw error;
    }
  }
}

export default SessionService;