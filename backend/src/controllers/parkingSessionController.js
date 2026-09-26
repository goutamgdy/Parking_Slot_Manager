const parkingSessionService = require("../services/parkingSessionService");

const getActiveParkingSessions = async (req, res, next) => {
    try {
        const sessions =
            await parkingSessionService.getActiveParkingSessions();

        res.status(200).json(sessions);

    } catch (error) {
        next(error);
    }
};

const createParkingSession = async (req, res, next) => {
    try {
        const { vehicleId, slotId } = req.body;

        const session =
            await parkingSessionService.createParkingSession(
                vehicleId,
                slotId
            );

        res.status(201).json(session);

    } catch (error) {
        next(error);
    }
};

const exitParkingSession = async (req, res, next) => {
    try {
        const sessionId = req.params.id;

        const session =
            await parkingSessionService.exitParkingSession(
                sessionId
            );

        res.status(200).json(session);

    } catch (error) {
        next(error);
    }
};

const getParkingSessionHistory = async (req, res, next) => {
    try {
        const sessions =
            await parkingSessionService.getParkingSessionHistory();

        res.status(200).json(sessions);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getActiveParkingSessions,
    createParkingSession,
    exitParkingSession,
    getParkingSessionHistory
};
