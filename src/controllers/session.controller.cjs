const { createSession, listSessions, deleteSession } = require('../services/session.service.cjs'***REMOVED***;

// Créer une session (POST***REMOVED***
exports.create = (req, res***REMOVED*** => {
    // On ajoute un '?' après req.body pour éviter le crash si c'est vide
    const userId = req.body?.userId || 1; 
    const session = createSession(userId***REMOVED***;
    res.json(session***REMOVED***;
};

// Lister les sessions (GET***REMOVED***
exports.list = (req, res***REMOVED*** => {
    // Pour un GET, on regarde d'abord dans les paramètres d'URL (query***REMOVED*** puis dans le body
    const userId = req.query?.userId || req.body?.userId || 1;
    
    const sessions = listSessions(userId***REMOVED***;
    res.json(sessions***REMOVED***;
};

// Supprimer une session (DELETE***REMOVED***
exports.delete = (req, res***REMOVED*** => {
    const sessionId = req.body?.sessionId;
    if (!sessionId***REMOVED*** {
        return res.status(400***REMOVED***.json({ message: 'sessionId manquant' }***REMOVED***;
    }
    deleteSession(sessionId***REMOVED***;
    res.json({ message: 'Session supprimée' }***REMOVED***;
};