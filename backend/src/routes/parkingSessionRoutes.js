const express = require("express");

const router = express.Router();

const parkingSessionController = require("../controllers/parkingSessionController");

const {
    validateCreateParkingSession,
    validateSessionId
} = require("../middleware/validation");

router.get(
    "/",
    parkingSessionController.getActiveParkingSessions
);

router.get(
    "/history",
    parkingSessionController.getParkingSessionHistory
);

router.post(
    "/",
    validateCreateParkingSession,
    parkingSessionController.createParkingSession
);


router.post(
    "/:id/exit",
    validateSessionId,
    parkingSessionController.exitParkingSession
);

module.exports = router;