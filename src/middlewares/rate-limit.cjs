const rateLimitStore = {};

function rateLimit(req, res, next) {
    const key = req.ip;
    const now = Date.now();
    
    // --- 1. LOGIQUE DE RATE LIMIT 
    rateLimitStore[key] = rateLimitStore[key] || { count: 0, lastTime: now };

    if (now - rateLimitStore[key].lastTime > 60000) {
        rateLimitStore[key] = { count: 0, lastTime: now };
    }

    rateLimitStore[key].count++;

    // --- 2. LOGIQUE D'HISTORIQUE (Journalisation) ---
    const logEntry = {
        timestamp: new Date().toISOString(),
        ip: key,
        path: req.path,
        attemptNumber: rateLimitStore[key].count,
        status: rateLimitStore[key].count > 5 ? 'BLOCKED' : 'ALLOWED'
    };
    
    // On affiche la tentative dans le terminal (Journalisation)
    console.log(`[LOG CONNEXION] :`, JSON.stringify(logEntry));

    // --- 3. BLOCAGE ---
    if (rateLimitStore[key].count > 5) {
        return res.status(429).json({ 
            message: 'Trop de requêtes. Attendez une minute.',
            details: logEntry 
        });
    }

    next();
}

module.exports = rateLimit;