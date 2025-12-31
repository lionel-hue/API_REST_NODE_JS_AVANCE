const rateLimitStore = {};

function rateLimit(req, res, next***REMOVED*** {
    const key = req.ip;
    const now = Date.now(***REMOVED***;
    
    // --- 1. LOGIQUE DE RATE LIMIT 
    rateLimitStore[key] = rateLimitStore[key] || { count: 0, lastTime: now };

    if (now - rateLimitStore[key].lastTime > 60000***REMOVED*** {
        rateLimitStore[key] = { count: 0, lastTime: now };
    }

    rateLimitStore[key].count++;

    // --- 2. LOGIQUE D'HISTORIQUE (Journalisation***REMOVED*** ---
    const logEntry = {
        timestamp: new Date(***REMOVED***.toISOString(***REMOVED***,
        ip: key,
        path: req.path,
        attemptNumber: rateLimitStore[key].count,
        status: rateLimitStore[key].count > 5 ? 'BLOCKED' : 'ALLOWED'
    };
    
    // On affiche la tentative dans le terminal (Journalisation***REMOVED***
    console.log(`[LOG CONNEXION] :`, JSON.stringify(logEntry***REMOVED******REMOVED***;

    // --- 3. BLOCAGE ---
    if (rateLimitStore[key].count > 5***REMOVED*** {
        return res.status(429***REMOVED***.json({ 
            message: 'Trop de requêtes. Attendez une minute.',
            details: logEntry 
        }***REMOVED***;
    }

    next(***REMOVED***;
}

module.exports = rateLimit;