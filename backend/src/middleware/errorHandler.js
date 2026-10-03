const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
    logger.error(
        \`${req.method} ${req.originalUrl} - ${err.message}\`
    );

    if (err.code === "23505") {
        return res.status(409).json({
            error: "Resource already exists or conflicts with existing data"
        });
    }

    if (err.type === "entity.too.large") {
        return res.status(413).json({
            error: "Request body is too large"
        });
    }

    const statusCode = err.statusCode || err.status || 500;

    const isClientError = statusCode >= 400 && statusCode < 500;
    const message =
        isClientError
            ? err.message
            : process.env.NODE_ENV === "production"
                ? "Internal Server Error"
                : err.message || "Internal Server Error";

    res.status(statusCode).json({
        error: message || "Internal Server Error"
    });
};

module.exports = errorHandler;
