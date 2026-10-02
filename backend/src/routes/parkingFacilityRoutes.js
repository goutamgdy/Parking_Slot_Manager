const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/authMiddleware");

const authorize =
    require("../middleware/authorization");

const parkingFacilityController =
    require("../controllers/parkingFacilityController");


/*
 * USER + ADMIN
 */

router.get(
    "/",
    authenticateToken,
    authorize("USER", "ADMIN"),
    parkingFacilityController.getFacilities
);


router.get(
    "/:id",
    authenticateToken,
    authorize("USER", "ADMIN"),
    parkingFacilityController.getFacility
);


/*
 * ADMIN ONLY
 */

router.post(
    "/",
    authenticateToken,
    authorize("ADMIN"),
    parkingFacilityController.createFacility
);


router.put(
    "/:id",
    authenticateToken,
    authorize("ADMIN"),
    parkingFacilityController.updateFacility
);


router.patch(
    "/:id/status",
    authenticateToken,
    authorize("ADMIN"),
    parkingFacilityController.updateFacilityStatus
);


module.exports = router;