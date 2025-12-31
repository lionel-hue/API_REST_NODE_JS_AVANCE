const { createSession, listSessions, deleteSession } = require('../services/session.service.cjs');

// Créer une session (POST)
exports.create = (req, res) => {
    // On ajoute un '?' après req.body pour éviter le crash si c'est vide
    const userId = req.body?.userId || 1; 
    const session = createSession(userId);
    res.json(session);
};

// Lister les sessions (GET)
exports.list = (req, res) => {
    // Pour un GET, on regarde d'abord dans les paramètres d'URL (query) puis dans le body
    const userId = req.query?.userId || req.body?.userId || 1;
    
    const sessions = listSessions(userId);
    res.json(sessions);
};

// Supprimer une session (DELETE)
exports.delete = (req, res) => {
    const sessionId = req.body?.sessionId;
    if (!sessionId) {
        return res.status(400).json({ message: 'sessionId manquant' });
    }
    deleteSession(sessionId);
    res.json({ message: 'Session supprimée' });
};