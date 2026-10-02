const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/authMiddleware");

const authorize =
    require("../middleware/authorization");

const adminParkingSessionController =
    require("../controllers/adminParkingSessionController");


router.get(
    "/",
    authenticateToken,
    authorize("ADMIN"),
    adminParkingSessionController.getParkingSessions
);


router.get(
    "/:id",
    authenticateToken,
    authorize("ADMIN"),
    adminParkingSessionController.getParkingSession
);


router.post(
    "/:id/exit",
    authenticateToken,
    authorize("ADMIN"),
    adminParkingSessionController.exitParkingSession
);


module.exports = router;
