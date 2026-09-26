const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {

    logger.error(
        `${req.method} ${req.originalUrl} - ${err.message}`
    );

    if (err.code === "23505") {

        return res.status(409).json({
            error: "Parking session conflicts with an existing active session"
        });
    }

    res.status(err.statusCode || 500).json({
        error: err.message || "Internal Server Error"
    });
};

module.exports = errorHandler;