// src/services/login-history.cjs

let loginHistory = [];

// Ajouter une tentative de connexion
function logAttempt({ userId, success, ip }) {
    loginHistory.push({
        userId,
        success,
        ip,
        timestamp: new Date()
    });
}

// Récupérer l’historique pour un utilisateur
function getHistory(userId) {
    return loginHistory.filter(entry => entry.userId === userId);
}

module.exports = { logAttempt, getHistory };
