const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {

    logger.error(
        `${req.method} ${req.originalUrl} - ${err.message}`
    );

    res.status(err.statusCode || 500).json({
        error: err.message || "Internal Server Error"
    });
};

module.exports = errorHandler;