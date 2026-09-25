const validateCreateParkingSession = (req, res, next) => {
    const { vehicleId, slotId } = req.body;

    // Check that both fields exist
    if (vehicleId === undefined || slotId === undefined) {
        const error = new Error("vehicleId and slotId are required");
        error.statusCode = 400;

        return next(error);
    }

    // Check that both values are integers
    if (!Number.isInteger(vehicleId) || !Number.isInteger(slotId)) {
        const error = new Error("vehicleId and slotId must be integers");
        error.statusCode = 400;

        return next(error);
    }

    // Check that IDs are positive
    if (vehicleId <= 0 || slotId <= 0) {
        const error = new Error("vehicleId and slotId must be greater than 0");
        error.statusCode = 400;

        return next(error);
    }

    next();
};


const validateSessionId = (req, res, next) => {
    const sessionId = Number(req.params.id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
        const error = new Error("Session ID must be a positive integer");
        error.statusCode = 400;

        return next(error);
    }

    next();
};


module.exports = {
    validateCreateParkingSession,
    validateSessionId
};