const { authenticator } = require('otplib'***REMOVED***;

// Générer un secret TOTP pour un utilisateur
function generateSecret(***REMOVED*** {
    return authenticator.generateSecret(***REMOVED***;
}

// Vérifier un code TOTP
function verifyToken(token, secret***REMOVED*** {
    return authenticator.check(token, secret***REMOVED***;
}

module.exports = { generateSecret, verifyToken };
