const { generateSecret, verifyToken } = require('../lib/two-factor.cjs');
const { logAttempt, getHistory } = require('../services/login-history.cjs');

let mockUser = { id: 1, totpSecret: null };

// Générer un secret TOTP pour l'utilisateur
exports.setup2FA = (req, res) => {
    mockUser.totpSecret = generateSecret();
    res.json({ message: 'TOTP secret généré', secret: mockUser.totpSecret });
};

// Vérifier un code TOTP fourni
exports.verify2FA = (req, res) => {
    const { token } = req.body;
    if (!mockUser.totpSecret) {
        logAttempt({ userId: mockUser.id, success: false, ip: req.ip });
        return res.status(400).json({ message: 'TOTP non configuré' });
    }

    const valid = verifyToken(token, mockUser.totpSecret);

    // Log de la tentative
    logAttempt({ userId: mockUser.id, success: valid, ip: req.ip });

    res.json({ valid });
};

// Endpoint optionnel pour consulter l'historique
exports.getLoginHistory = (req, res) => {
    const history = getHistory(mockUser.id);
    res.json(history);
};
