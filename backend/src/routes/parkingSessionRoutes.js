const express = require("express");

const router = express.Router();

const parkingSessionController = require("../controllers/parkingSessionController");

const {
    validateCreateParkingSession,
    validateSessionId
} = require("../middleware/validation");
const authenticateToken = require("../middleware/authMiddleware");
router.get(
    "/",
    authenticateToken,
    parkingSessionController.getActiveParkingSessions
);

router.get(
    "/history",
    authenticateToken,
    parkingSessionController.getParkingSessionHistory
);

router.post(
    "/",
    authenticateToken,
    validateCreateParkingSession,
    parkingSessionController.createParkingSession
);


router.post(
    "/:id/exit",
    authenticateToken,
    validateSessionId,
    parkingSessionController.exitParkingSession
);

module.exports = router;