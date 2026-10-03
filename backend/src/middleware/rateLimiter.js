const { rateLimit } = require("express-rate-limit");

const commonOptions = {
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: "Too many requests. Please try again later."
        });
    }
};

const apiLimiter = rateLimit({
    ...commonOptions,
    windowMs: 15 * 60 * 1000,
    limit: 300,
    skip: (req) => req.path.startsWith("/health")
});

const loginLimiter = rateLimit({
    ...commonOptions,
    windowMs: 15 * 60 * 1000,
    limit: 10
});

const registerLimiter = rateLimit({
    ...commonOptions,
    windowMs: 60 * 60 * 1000,
    limit: 20
});

module.exports = {
    apiLimiter,
    loginLimiter,
    registerLimiter
};
