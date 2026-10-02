const vehicleService = require("../services/vehicleService");

const getVehicles = async (req, res, next) => {
    try {
        const vehicles =
            await vehicleService.getVehiclesByUser(
            req.user.userId
        );

        res.status(200).json(vehicles);

    } catch (error) {
        next(error);
    }
};

const createVehicle = async (req, res, next) => {
    try {
        const {
            vehicleNumber,
            vehicleType
        } = req.body;

        const vehicle =
            await vehicleService.createVehicle(
                req.user.userId,
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