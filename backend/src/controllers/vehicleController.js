const vehicleService = require("../services/vehicleService");

const getVehicles = async (req, res, next) => {
    try {
        const vehicles = await vehicleService.getAllVehicles();

        res.status(200).json(vehicles);

    } catch (error) {
        next(error);
    }
};

const createVehicle = async (req, res, next) => {
    try {
        const {
            userId,
            vehicleNumber,
            vehicleType
        } = req.body;

        const vehicle =
            await vehicleService.createVehicle(
                userId,
                vehicleNumber,
                vehicleType
            );

        res.status(201).json(vehicle);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVehicles,
    createVehicle
};