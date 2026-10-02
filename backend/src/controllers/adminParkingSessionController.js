const adminParkingSessionService =
    require("../services/adminParkingSessionService");


const getParkingSessions = async (req, res, next) => {
    try {
        const sessions =
            await adminParkingSessionService
                .getAllParkingSessions();

        res.status(200).json(sessions);

    } catch (error) {
        next(error);
    }
};


const getParkingSession = async (req, res, next) => {
    try {
        const session =
            await adminParkingSessionService
                .getParkingSessionById(
                    Number(req.params.id)
                );

        res.status(200).json(session);

    } catch (error) {
        next(error);
    }
};


const exitParkingSession = async (req, res, next) => {
    try {
        const session =
            await adminParkingSessionService
                .exitParkingSession(
                    Number(req.params.id)
                );

        res.status(200).json({
            message: "Parking session exited successfully",
            session
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getParkingSessions,
    getParkingSession,
    exitParkingSession
};
