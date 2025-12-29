const rateLimitStore = {};

function rateLimit(req, res, next) {
    const key = req.ip;
    rateLimitStore[key] = rateLimitStore[key] || { count: 0, lastTime: Date.now() };

    if (Date.now() - rateLimitStore[key].lastTime > 60000) {
        rateLimitStore[key] = { count: 0, lastTime: Date.now() };
    }

    rateLimitStore[key].count++;

    if (rateLimitStore[key].count > 5) {
        return res.status(429).json({ message: 'Trop de requêtes. Attendez une minute.' });
    }

    next();
}

module.exports = rateLimit;
