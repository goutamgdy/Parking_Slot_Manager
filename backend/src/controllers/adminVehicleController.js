const adminVehicleService =
    require("../services/adminVehicleService");


const getVehicles = async (req, res, next) => {

    try {

        const vehicles =
            await adminVehicleService.getAllVehicles();

        res.status(200).json(vehicles);

    } catch (error) {

        next(error);
    }
};


const getVehicle = async (req, res, next) => {

    try {

        const vehicle =
            await adminVehicleService.getVehicleById(
                Number(req.params.id)
            );

        res.status(200).json(vehicle);

    } catch (error) {

        next(error);
    }
};


module.exports = {
    getVehicles,
    getVehicle
};