const rateLimitStore = {};

function rateLimit(req, res, next***REMOVED*** {
    const key = req.ip;
    rateLimitStore[key] = rateLimitStore[key] || { count: 0, lastTime: Date.now(***REMOVED*** };

    if (Date.now(***REMOVED*** - rateLimitStore[key].lastTime > 60000***REMOVED*** {
        rateLimitStore[key] = { count: 0, lastTime: Date.now(***REMOVED*** };
    }

    rateLimitStore[key].count++;

    if (rateLimitStore[key].count > 5***REMOVED*** {
        return res.status(429***REMOVED***.json({ message: 'Trop de requêtes. Attendez une minute.' }***REMOVED***;
    }

    next(***REMOVED***;
}

module.exports = rateLimit;
