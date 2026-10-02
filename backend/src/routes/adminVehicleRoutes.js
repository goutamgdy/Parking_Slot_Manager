const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/authMiddleware");

const authorize =
    require("../middleware/authorization");

const adminVehicleController =
    require("../controllers/adminVehicleController");


router.get(
    "/",
    authenticateToken,
    authorize("ADMIN"),
    adminVehicleController.getVehicles
);


router.get(
    "/:id",
    authenticateToken,
    authorize("ADMIN"),
    adminVehicleController.getVehicle
);


module.exports = router;