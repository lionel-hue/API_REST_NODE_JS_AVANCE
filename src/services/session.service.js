import prisma from '#lib/prisma';

/**
 * Service for managing user sessions
 */
class SessionService {
  /**
   * Get all active sessions for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Active sessions
   */
  static async getActiveSessions(userId***REMOVED*** {
    try {
      const now = new Date(***REMOVED***;
      
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          expiresAt: {
            gt: now,
          },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          token: false, // Don't return actual token
          createdAt: true,
          expiresAt: true,
        },
      }***REMOVED***;

      return sessions;
    } catch (error***REMOVED*** {
      console.error(`Failed to get sessions for user ${userId}: ${error.message}`***REMOVED***;
      throw error;
    }
  }

  /**
   * Revoke a specific session
   * @param {number} userId - User ID
   * @param {number} sessionId - Session ID to revoke
   * @returns {Promise<Object>} Result
   */
  static async revokeSession(userId, sessionId***REMOVED*** {
    try {
      // Find the session
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      }***REMOVED***;

      if (!session***REMOVED*** {
        throw new Error('Session not found'***REMOVED***;
      }

      // Verify session belongs to user
      if (session.userId !== userId***REMOVED*** {
        throw new Error('Not authorized to revoke this session'***REMOVED***;
      }

      // Delete the session
      await prisma.session.delete({
        where: { id: sessionId },
      }***REMOVED***;

      console.log(`Session revoked: ${sessionId} for user ${userId}`***REMOVED***;
      return { success: true, message: 'Session revoked successfully' };
    } catch (error***REMOVED*** {
      console.error(`Failed to revoke session: ${error.message}`***REMOVED***;
      throw error;
    }
  }

  /**
   * Revoke all other sessions (except current***REMOVED***
   * @param {number} userId - User ID
   * @param {number} currentSessionId - Current session ID to keep
   * @returns {Promise<Object>} Result
   */
  static async revokeOtherSessions(userId, currentSessionId***REMOVED*** {
    try {
      const now = new Date(***REMOVED***;
      
      await prisma.session.deleteMany({
        where: {
          userId,
          id: { not: currentSessionId },
          expiresAt: { gt: now },
        },
      }***REMOVED***;

      console.log(`All other sessions revoked for user ${userId}`***REMOVED***;
      return { 
        success: true, 
        message: 'All other sessions have been revoked' 
      };
    } catch (error***REMOVED*** {
      console.error(`Failed to revoke other sessions: ${error.message}`***REMOVED***;
      throw error;
    }
  }
}

export default SessionService;