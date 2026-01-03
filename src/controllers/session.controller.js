import SessionService from '#services/session.service';

export class SessionController {
  /**
   * Get all active sessions for current user
   * GET /api/sessions
   */
  static async getSessions(req, res***REMOVED*** {
    try {
      console.log('[SESSION CONTROLLER] Getting sessions request received'***REMOVED***;
      console.log('[SESSION CONTROLLER] User from req.user:', req.user***REMOVED***;
      
      const userId = req.user?.id || req.user?.userId;
      console.log('[SESSION CONTROLLER] Extracted userId:', userId***REMOVED***;
      
      if (!userId***REMOVED*** {
        return res.status(401***REMOVED***.json({
          success: false,
          error: 'Authentication required',
        }***REMOVED***;
      }
      
      const sessions = await SessionService.getActiveSessions(userId***REMOVED***;
      console.log('[SESSION CONTROLLER] Sessions retrieved:', sessions***REMOVED***;
      
      res.json({
        success: true,
        sessions,
      }***REMOVED***;
    } catch (error***REMOVED*** {
      console.error(`[SESSION CONTROLLER] Error getting sessions: ${error.message}`***REMOVED***;
      console.error(error.stack***REMOVED***;
      res.status(500***REMOVED***.json({
        success: false,
        error: 'Failed to retrieve sessions',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }***REMOVED***;
    }
  }

  /**
   * Revoke a specific session
   * DELETE /api/sessions/:sessionId
   */
  static async revokeSession(req, res***REMOVED*** {
    try {
      console.log('[SESSION CONTROLLER] Revoke session request'***REMOVED***;
      const userId = req.user?.id || req.user?.userId;
      const { sessionId } = req.params;
      
      console.log(`[SESSION CONTROLLER] UserId: ${userId}, SessionId: ${sessionId}`***REMOVED***;
      
      if (!userId***REMOVED*** {
        return res.status(401***REMOVED***.json({
          success: false,
          error: 'Authentication required',
        }***REMOVED***;
      }
      
      const result = await SessionService.revokeSession(userId, sessionId***REMOVED***;
      res.json({
        success: true,
        ...result,
      }***REMOVED***;
    } catch (error***REMOVED*** {
      console.error(`[SESSION CONTROLLER] Error revoking session: ${error.message}`***REMOVED***;
      console.error(error.stack***REMOVED***;
      
      if (error.message.includes('not found'***REMOVED******REMOVED*** {
        return res.status(404***REMOVED***.json({
          success: false,
          error: error.message,
        }***REMOVED***;
      }
      if (error.message.includes('Not authorized'***REMOVED******REMOVED*** {
        return res.status(403***REMOVED***.json({
          success: false,
          error: error.message,
        }***REMOVED***;
      }
      res.status(500***REMOVED***.json({
        success: false,
        error: 'Failed to revoke session',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }***REMOVED***;
    }
  }

  /**
   * Revoke all other sessions (except current***REMOVED***
   * DELETE /api/sessions/others
   */
  static async revokeOtherSessions(req, res***REMOVED*** {
    try {
      console.log('[SESSION CONTROLLER] Revoke other sessions request'***REMOVED***;
      const userId = req.user?.id || req.user?.userId;
      const currentSessionId = req.body.currentSessionId;
      
      console.log(`[SESSION CONTROLLER] UserId: ${userId}, CurrentSessionId: ${currentSessionId}`***REMOVED***;
      
      if (!userId***REMOVED*** {
        return res.status(401***REMOVED***.json({
          success: false,
          error: 'Authentication required',
        }***REMOVED***;
      }
      
      if (!currentSessionId***REMOVED*** {
        return res.status(400***REMOVED***.json({
          success: false,
          error: 'Current session ID is required',
        }***REMOVED***;
      }
      
      const result = await SessionService.revokeOtherSessions(userId, currentSessionId***REMOVED***;
      res.json({
        success: true,
        ...result,
      }***REMOVED***;
    } catch (error***REMOVED*** {
      console.error(`[SESSION CONTROLLER] Error revoking other sessions: ${error.message}`***REMOVED***;
      console.error(error.stack***REMOVED***;
      res.status(500***REMOVED***.json({
        success: false,
        error: 'Failed to revoke other sessions',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }***REMOVED***;
    }
  }
}