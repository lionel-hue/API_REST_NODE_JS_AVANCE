import SessionService from '#services/session.service';

export class SessionController {
  /**
   * Get all active sessions for current user
   * GET /api/sessions
   */
  static async getSessions(req, res) {
    try {
      console.log('[SESSION CONTROLLER] Getting sessions request received');
      console.log('[SESSION CONTROLLER] User from req.user:', req.user);
      
      const userId = req.user?.id || req.user?.userId;
      console.log('[SESSION CONTROLLER] Extracted userId:', userId);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }
      
      const sessions = await SessionService.getActiveSessions(userId);
      console.log('[SESSION CONTROLLER] Sessions retrieved:', sessions);
      
      res.json({
        success: true,
        sessions,
      });
    } catch (error) {
      console.error(`[SESSION CONTROLLER] Error getting sessions: ${error.message}`);
      console.error(error.stack);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve sessions',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Revoke a specific session
   * DELETE /api/sessions/:sessionId
   */
  static async revokeSession(req, res) {
    try {
      console.log('[SESSION CONTROLLER] Revoke session request');
      const userId = req.user?.id || req.user?.userId;
      const { sessionId } = req.params;
      
      console.log(`[SESSION CONTROLLER] UserId: ${userId}, SessionId: ${sessionId}`);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }
      
      const result = await SessionService.revokeSession(userId, sessionId);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(`[SESSION CONTROLLER] Error revoking session: ${error.message}`);
      console.error(error.stack);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      if (error.message.includes('Not authorized')) {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to revoke session',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Revoke all other sessions (except current)
   * DELETE /api/sessions/others
   */
  static async revokeOtherSessions(req, res) {
    try {
      console.log('[SESSION CONTROLLER] Revoke other sessions request');
      const userId = req.user?.id || req.user?.userId;
      const currentSessionId = req.body.currentSessionId;
      
      console.log(`[SESSION CONTROLLER] UserId: ${userId}, CurrentSessionId: ${currentSessionId}`);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }
      
      if (!currentSessionId) {
        return res.status(400).json({
          success: false,
          error: 'Current session ID is required',
        });
      }
      
      const result = await SessionService.revokeOtherSessions(userId, currentSessionId);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(`[SESSION CONTROLLER] Error revoking other sessions: ${error.message}`);
      console.error(error.stack);
      res.status(500).json({
        success: false,
        error: 'Failed to revoke other sessions',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}