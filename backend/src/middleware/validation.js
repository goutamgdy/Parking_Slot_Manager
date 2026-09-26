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

const validateCreateVehicle = (req, res, next) => {
    const { userId, vehicleNumber, vehicleType } = req.body;

    if (
        userId === undefined ||
        vehicleNumber === undefined ||
        vehicleType === undefined
    ) {
        const error = new Error(
            "userId, vehicleNumber and vehicleType are required"
        );

        error.statusCode = 400;

        return next(error);
    }

    if (!Number.isInteger(userId) || userId <= 0) {
        const error = new Error(
            "userId must be a positive integer"
        );

        error.statusCode = 400;

        return next(error);
    }

    if (
        typeof vehicleNumber !== "string" ||
        vehicleNumber.trim().length === 0
    ) {
        const error = new Error(
            "vehicleNumber must be a non-empty string"
        );

        error.statusCode = 400;

        return next(error);
    }

    if (!["CAR", "BIKE"].includes(vehicleType)) {
        const error = new Error(
            "vehicleType must be CAR or BIKE"
        );

        error.statusCode = 400;

        return next(error);
    }

    next();
};

module.exports = {
    validateCreateParkingSession,
    validateSessionId,
    validateCreateVehicle
};