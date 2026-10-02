const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

const vehicleController = require("../controllers/vehicleController");

const {
    validateCreateVehicle
} = require("../middleware/validation");

router.get(
    "/",
    authenticateToken,
    vehicleController.getVehicles
);

router.post(
    "/",
    authenticateToken,
    validateCreateVehicle,
    vehicleController.createVehicle
);

module.exports = router;