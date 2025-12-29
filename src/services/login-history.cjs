// src/services/login-history.cjs

let loginHistory = [];

// Ajouter une tentative de connexion
function logAttempt({ userId, success, ip }***REMOVED*** {
    loginHistory.push({
        userId,
        success,
        ip,
        timestamp: new Date(***REMOVED***
    }***REMOVED***;
}

// Récupérer l’historique pour un utilisateur
function getHistory(userId***REMOVED*** {
    return loginHistory.filter(entry => entry.userId === userId***REMOVED***;
}

module.exports = { logAttempt, getHistory };
