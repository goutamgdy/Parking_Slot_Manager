const express = require("express");

const router = express.Router();

const vehicleController = require("../controllers/vehicleController");

const {
    validateCreateVehicle
} = require("../middleware/validation");

router.get(
    "/",
    vehicleController.getVehicles
);

router.post(
    "/",
    validateCreateVehicle,
    vehicleController.createVehicle
);

module.exports = router;