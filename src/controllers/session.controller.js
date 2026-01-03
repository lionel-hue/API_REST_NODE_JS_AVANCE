import SessionService from '#services/session.service';

export class SessionController {
  /**
   * Get all active sessions for current user
   * GET /api/sessions
   */
  static async getSessions(req, res***REMOVED*** {
    try {
      const userId = req.user?.id || req.user?.userId;
      
      if (!userId***REMOVED*** {
        return res.status(401***REMOVED***.json({
          success: false,
          error: 'Authentication required',
        }***REMOVED***;
      }

      const sessions = await SessionService.getActiveSessions(parseInt(userId***REMOVED******REMOVED***;
      
      res.json({
        success: true,
        sessions,
      }***REMOVED***;
    } catch (error***REMOVED*** {
      console.error(`Error getting sessions: ${error.message}`***REMOVED***;
      res.status(500***REMOVED***.json({
        success: false,
        error: 'Failed to retrieve sessions',
      }***REMOVED***;
    }
  }

  /**
   * Revoke a specific session
   * DELETE /api/sessions/:sessionId
   */
  static async revokeSession(req, res***REMOVED*** {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { sessionId } = req.params;
      
      if (!userId***REMOVED*** {
        return res.status(401***REMOVED***.json({
          success: false,
          error: 'Authentication required',
        }***REMOVED***;
      }

      const result = await SessionService.revokeSession(parseInt(userId***REMOVED***, parseInt(sessionId***REMOVED******REMOVED***;
      
      res.json({
        success: true,
        ...result,
      }***REMOVED***;
    } catch (error***REMOVED*** {
      console.error(`Error revoking session: ${error.message}`***REMOVED***;
      
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
      }***REMOVED***;
    }
  }

  /**
   * Revoke all other sessions (except current***REMOVED***
   * DELETE /api/sessions/others
   */
  static async revokeOtherSessions(req, res***REMOVED*** {
    try {
      const userId = req.user?.id || req.user?.userId;
      const currentSessionId = req.body.currentSessionId;
      
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

      const result = await SessionService.revokeOtherSessions(
        parseInt(userId***REMOVED***, 
        parseInt(currentSessionId***REMOVED***
      ***REMOVED***;
      
      res.json({
        success: true,
        ...result,
      }***REMOVED***;
    } catch (error***REMOVED*** {
      console.error(`Error revoking other sessions: ${error.message}`***REMOVED***;
      res.status(500***REMOVED***.json({
        success: false,
        error: 'Failed to revoke other sessions',
      }***REMOVED***;
    }
  }
}