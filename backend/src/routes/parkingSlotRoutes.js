const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/authMiddleware");

const authorize =
    require("../middleware/authorization");

const parkingSlotController =
    require("../controllers/parkingSlotController");

const {
    validateParkingAreaId,
    validateCreateParkingSlot,
    validateUpdateParkingSlot,
    validateParkingSlotStatus
} = require("../middleware/validation");


/*
 * =========================================================
 * USER + ADMIN
 * =========================================================
 */


/*
 * GET ALL PARKING SLOTS
 */

router.get(
    "/",
    authenticateToken,
    authorize("USER", "ADMIN"),
    parkingSlotController.getParkingSlots
);


/*
 * GET PARKING SLOT BY ID
 */

router.get(
    "/:id",
    authenticateToken,
    authorize("USER", "ADMIN"),
    validateParkingAreaId,
    parkingSlotController.getParkingSlot
);


/*
 * =========================================================
 * ADMIN ONLY
 * =========================================================
 */


/*
 * CREATE PARKING SLOT
 */

router.post(
    "/",
    authenticateToken,
    authorize("ADMIN"),
    validateCreateParkingSlot,
    parkingSlotController.createParkingSlot
);


/*
 * UPDATE PARKING SLOT
 */

router.put(
    "/:id",
    authenticateToken,
    authorize("ADMIN"),
    validateParkingAreaId,
    validateUpdateParkingSlot,
    parkingSlotController.updateParkingSlot
);


/*
 * UPDATE PARKING SLOT STATUS
 */

router.patch(
    "/:id/status",
    authenticateToken,
    authorize("ADMIN"),
    validateParkingAreaId,
    validateParkingSlotStatus,
    parkingSlotController.updateParkingSlotStatus
);


module.exports = router;