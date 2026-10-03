const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
    logger.error(
        `${req.method} ${req.originalUrl} - ${err.message}`
    );

    if (err.code === "23505") {
        return res.status(409).json({
            error: "Resource already exists or conflicts with existing data"
        });
    }

    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        error: err.message || "Internal Server Error"
    });
};

module.exports = errorHandler;
