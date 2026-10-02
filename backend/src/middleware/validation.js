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
    const { vehicleNumber, vehicleType } = req.body;

    if (
        vehicleNumber === undefined ||
        vehicleType === undefined
    ) {
        const error = new Error(
            "vehicleNumber and vehicleType are required"
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

const validateParkingAreaId = (req, res, next) => {

    const areaId = Number(req.params.id);

    if (!Number.isInteger(areaId) || areaId <= 0) {

        const error = new Error(
            "Area id must be a positive integer"
        );

        error.statusCode = 400;

        return next(error);
    }

    next();
};


const validateCreateParkingArea = (req, res, next) => {

    const {
        facilityId,
        name,
        capacity
    } = req.body;


    if (
        facilityId === undefined ||
        name === undefined ||
        capacity === undefined
    ) {

        const error = new Error(
            "facilityId, name and capacity are required"
        );

        error.statusCode = 400;

        return next(error);
    }


    if (
        !Number.isInteger(Number(facilityId)) ||
        Number(facilityId) <= 0
    ) {

        const error = new Error(
            "facilityId must be a positive integer"
        );

        error.statusCode = 400;

        return next(error);
    }


    if (
        typeof name !== "string" ||
        name.trim().length === 0
    ) {

        const error = new Error(
            "name must be a non-empty string"
        );

        error.statusCode = 400;

        return next(error);
    }


    if (
        !Number.isInteger(Number(capacity)) ||
        Number(capacity) < 0
    ) {

        const error = new Error(
            "capacity must be a non-negative integer"
        );

        error.statusCode = 400;

        return next(error);
    }


    next();
};


const validateUpdateParkingArea = (req, res, next) => {

    const {
        name,
        capacity
    } = req.body;


    if (
        name === undefined ||
        capacity === undefined
    ) {

        const error = new Error(
            "name and capacity are required"
        );

        error.statusCode = 400;

        return next(error);
    }


    if (
        typeof name !== "string" ||
        name.trim().length === 0
    ) {

        const error = new Error(
            "name must be a non-empty string"
        );

        error.statusCode = 400;

        return next(error);
    }


    if (
        !Number.isInteger(Number(capacity)) ||
        Number(capacity) < 0
    ) {

        const error = new Error(
            "capacity must be a non-negative integer"
        );

        error.statusCode = 400;

        return next(error);
    }


    next();
};


const validateParkingAreaStatus = (req, res, next) => {

    const { status } = req.body;


    if (!["ACTIVE", "INACTIVE"].includes(status)) {

        const error = new Error(
            "status must be ACTIVE or INACTIVE"
        );

        error.statusCode = 400;

        return next(error);
    }


    next();
};

const validateCreateParkingSlot = (req, res, next) => {

    const {
        areaId,
        slotNumber,
        slotType
    } = req.body;


    if (
        areaId === undefined ||
        slotNumber === undefined ||
        slotType === undefined
    ) {

        const error = new Error(
            "areaId, slotNumber and slotType are required"
        );

        error.statusCode = 400;

        return next(error);
    }


    if (
        !Number.isInteger(Number(areaId)) ||
        Number(areaId) <= 0
    ) {

        const error = new Error(
            "areaId must be a positive integer"
        );

        error.statusCode = 400;

        return next(error);
    }


    if (
        typeof slotNumber !== "string" ||
        slotNumber.trim().length === 0
    ) {

        const error = new Error(
            "slotNumber must be a non-empty string"
        );

        error.statusCode = 400;

        return next(error);
    }


    if (
        !["CAR", "BIKE"].includes(slotType)
    ) {

        const error = new Error(
            "slotType must be CAR or BIKE"
        );

        error.statusCode = 400;

        return next(error);
    }


    next();
};


const validateUpdateParkingSlot = (req, res, next) => {

    const {
        slotNumber,
        slotType
    } = req.body;


    if (
        slotNumber === undefined ||
        slotType === undefined
    ) {

        const error = new Error(
            "slotNumber and slotType are required"
        );

        error.statusCode = 400;

        return next(error);
    }


    if (
        typeof slotNumber !== "string" ||
        slotNumber.trim().length === 0
    ) {

        const error = new Error(
            "slotNumber must be a non-empty string"
        );

        error.statusCode = 400;

        return next(error);
    }


    if (
        !["CAR", "BIKE"].includes(slotType)
    ) {

        const error = new Error(
            "slotType must be CAR or BIKE"
        );

        error.statusCode = 400;

        return next(error);
    }


    next();
};

const validateParkingSlotStatus = (req, res, next) => {

    const { status } = req.body;


    if (
        ![
            "AVAILABLE",
            "OCCUPIED",
            "MAINTENANCE",
            "INACTIVE"
        ].includes(status)
    ) {

        const error = new Error(
            "status must be AVAILABLE, OCCUPIED, MAINTENANCE or INACTIVE"
        );

        error.statusCode = 400;

        return next(error);
    }


    next();
};
module.exports = {
    validateCreateParkingSession,
    validateSessionId,
    validateCreateVehicle,

    validateParkingAreaId,
    validateCreateParkingArea,
    validateUpdateParkingArea,
    validateParkingAreaStatus,

    validateCreateParkingSlot,
    validateUpdateParkingSlot,
    validateParkingSlotStatus
};
