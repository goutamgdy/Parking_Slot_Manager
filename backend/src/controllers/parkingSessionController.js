const parkingSessionService = require("../services/parkingSessionService");

const createParkingSession = async (req, res, next) => {
    try {
        const { vehicleId, slotId } = req.body;

        const session = await parkingSessionService.createParkingSession(
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

        const session = await parkingSessionService.exitParkingSession(
            sessionId
        );

        res.status(200).json(session);

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createParkingSession,
    exitParkingSession
};