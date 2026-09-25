const parkingSlotService = require("../services/parkingSlotService");

const getParkingSlots = async (req, res, next) => {
    try {
        const slots = await parkingSlotService.getAllParkingSlots();

        res.status(200).json(slots);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getParkingSlots
};