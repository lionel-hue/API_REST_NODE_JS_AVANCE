const express = require('express'***REMOVED***;
const twoFactorController = require('./src/controllers/two-factor.controller.cjs'***REMOVED***;
const sessionController = require('./src/controllers/session.controller.cjs'***REMOVED***;
const rateLimit = require('./src/middlewares/rate-limit.cjs'***REMOVED***;

const app = express(***REMOVED***;
app.use(express.json(***REMOVED******REMOVED***;

// Routes TOTP
app.post('/setup2FA', rateLimit, twoFactorController.setup2FA***REMOVED***;
app.post('/verify2FA', rateLimit, twoFactorController.verify2FA***REMOVED***;

// Routes sessions
app.post('/sessions', rateLimit, sessionController.create***REMOVED***;
app.get('/sessions', rateLimit, sessionController.list***REMOVED***;
app.delete('/sessions', rateLimit, sessionController.delete***REMOVED***;

// Lancer le serveur
const PORT = 3000;
app.listen(PORT, (***REMOVED*** => {
    console.log(`Serveur démarré sur http://localhost:3000`***REMOVED***;
}***REMOVED***;
