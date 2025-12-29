let sessions = [];

function createSession(userId***REMOVED*** {
    const session = { id: sessions.length + 1, userId, createdAt: new Date(***REMOVED*** };
    sessions.push(session***REMOVED***;
    return session;
}

function listSessions(userId***REMOVED*** {
    return sessions.filter(s => s.userId === userId***REMOVED***;
}

function deleteSession(sessionId***REMOVED*** {
    sessions = sessions.filter(s => s.id !== sessionId***REMOVED***;
}

module.exports = { createSession, listSessions, deleteSession };
