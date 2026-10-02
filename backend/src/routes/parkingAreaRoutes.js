const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/authMiddleware");

const authorize =
    require("../middleware/authorization");

const parkingAreaController =
    require("../controllers/parkingAreaController");

const {
    validateParkingAreaId,
    validateCreateParkingArea,
    validateUpdateParkingArea,
    validateParkingAreaStatus
} = require("../middleware/validation");


// =========================================================
// USER + ADMIN
// =========================================================

router.get(
    "/",
    authenticateToken,
    authorize("USER", "ADMIN"),
    parkingAreaController.getAreas
);


router.get(
    "/:id",
    authenticateToken,
    authorize("USER", "ADMIN"),
    validateParkingAreaId,
    parkingAreaController.getArea
);


// =========================================================
// ADMIN ONLY
// =========================================================

router.post(
    "/",
    authenticateToken,
    authorize("ADMIN"),
    validateCreateParkingArea,
    parkingAreaController.createArea
);


router.put(
    "/:id",
    authenticateToken,
    authorize("ADMIN"),
    validateParkingAreaId,
    validateUpdateParkingArea,
    parkingAreaController.updateArea
);


router.patch(
    "/:id/status",
    authenticateToken,
    authorize("ADMIN"),
    validateParkingAreaId,
    validateParkingAreaStatus,
    parkingAreaController.updateAreaStatus
);


module.exports = router;