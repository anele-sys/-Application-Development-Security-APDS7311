const crypto = require("crypto");

function requestIdTracker(req, res, next) {
    const requestId = crypto.randomUUID();

    req.requestId = requestId;
    res.setHeader("X-Request-ID", requestId);

    console.log(`[${requestId}] ${req.method} ${req.originalUrl}`);

    next();
}

module.exports = requestIdTracker;