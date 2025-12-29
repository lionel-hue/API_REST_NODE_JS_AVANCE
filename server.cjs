const express = require('express');
const twoFactorController = require('./src/controllers/two-factor.controller.cjs');
const sessionController = require('./src/controllers/session.controller.cjs');
const rateLimit = require('./src/middlewares/rate-limit.cjs');

const app = express();
app.use(express.json());

// Routes TOTP
app.post('/setup2FA', rateLimit, twoFactorController.setup2FA);
app.post('/verify2FA', rateLimit, twoFactorController.verify2FA);

// Routes sessions
app.post('/sessions', rateLimit, sessionController.create);
app.get('/sessions', rateLimit, sessionController.list);
app.delete('/sessions', rateLimit, sessionController.delete);
app.get('/login-history', twoFactorController.getLoginHistory);

// Lancer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:3000`);
});
