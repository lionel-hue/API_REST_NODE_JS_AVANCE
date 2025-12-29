const { authenticator } = require('otplib');

// Générer un secret TOTP pour un utilisateur
function generateSecret() {
    return authenticator.generateSecret();
}

// Vérifier un code TOTP
function verifyToken(token, secret) {
    return authenticator.check(token, secret);
}

module.exports = { generateSecret, verifyToken };
