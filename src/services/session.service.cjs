let sessions = [];

function createSession(userId) {
    const session = { id: sessions.length + 1, userId, createdAt: new Date() };
    sessions.push(session);
    return session;
}

function listSessions(userId) {
    return sessions.filter(s => s.userId === userId);
}

function deleteSession(sessionId) {
    sessions = sessions.filter(s => s.id !== sessionId);
}

module.exports = { createSession, listSessions, deleteSession };
