const { createSession, listSessions, deleteSession } = require('../services/session.service.cjs');

// Créer une session
exports.create = (req, res) => {
    const userId = req.body.userId || 1;
    const session = createSession(userId);
    res.json(session);
};

// Lister les sessions
exports.list = (req, res) => {
    const userId = req.body.userId || 1;
    res.json(listSessions(userId));
};

// Supprimer une session
exports.delete = (req, res) => {
    const sessionId = req.body.sessionId;
    if (!sessionId) return res.status(400).json({ message: 'sessionId manquant' });
    deleteSession(sessionId);
    res.json({ message: 'Session supprimée' });
};
