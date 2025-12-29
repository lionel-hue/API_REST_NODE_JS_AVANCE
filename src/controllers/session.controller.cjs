const { createSession, listSessions, deleteSession } = require('../services/session.service.cjs'***REMOVED***;

// Créer une session
exports.create = (req, res***REMOVED*** => {
    const userId = req.body.userId || 1;
    const session = createSession(userId***REMOVED***;
    res.json(session***REMOVED***;
};

// Lister les sessions
exports.list = (req, res***REMOVED*** => {
    const userId = req.body.userId || 1;
    res.json(listSessions(userId***REMOVED******REMOVED***;
};

// Supprimer une session
exports.delete = (req, res***REMOVED*** => {
    const sessionId = req.body.sessionId;
    if (!sessionId***REMOVED*** return res.status(400***REMOVED***.json({ message: 'sessionId manquant' }***REMOVED***;
    deleteSession(sessionId***REMOVED***;
    res.json({ message: 'Session supprimée' }***REMOVED***;
};
