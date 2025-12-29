const { generateSecret, verifyToken } = require('../lib/two-factor.cjs'***REMOVED***;
const { logAttempt, getHistory } = require('../services/login-history.cjs'***REMOVED***;

let mockUser = { id: 1, totpSecret: null };

// Générer un secret TOTP pour l'utilisateur
exports.setup2FA = (req, res***REMOVED*** => {
    mockUser.totpSecret = generateSecret(***REMOVED***;
    res.json({ message: 'TOTP secret généré', secret: mockUser.totpSecret }***REMOVED***;
};

// Vérifier un code TOTP fourni
exports.verify2FA = (req, res***REMOVED*** => {
    const { token } = req.body;
    if (!mockUser.totpSecret***REMOVED*** {
        logAttempt({ userId: mockUser.id, success: false, ip: req.ip }***REMOVED***;
        return res.status(400***REMOVED***.json({ message: 'TOTP non configuré' }***REMOVED***;
    }

    const valid = verifyToken(token, mockUser.totpSecret***REMOVED***;

    // Log de la tentative
    logAttempt({ userId: mockUser.id, success: valid, ip: req.ip }***REMOVED***;

    res.json({ valid }***REMOVED***;
};

// Endpoint optionnel pour consulter l'historique
exports.getLoginHistory = (req, res***REMOVED*** => {
    const history = getHistory(mockUser.id***REMOVED***;
    res.json(history***REMOVED***;
};
