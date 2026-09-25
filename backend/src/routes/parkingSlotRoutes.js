const express = require("express");

const router = express.Router();

const parkingSlotController = require("../controllers/parkingSlotController");

router.get("/", parkingSlotController.getParkingSlots);

module.exports = router;