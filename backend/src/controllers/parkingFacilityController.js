const parkingFacilityService =
    require("../services/parkingFacilityService");


const getFacilities = async (req, res, next) => {

    try {

        const facilities =
            await parkingFacilityService.getAllFacilities();

        res.status(200).json(facilities);

    } catch (error) {
        next(error);
    }
};


const getFacility = async (req, res, next) => {

    try {

        const facility =
            await parkingFacilityService.getFacilityById(
                req.params.id
            );

        res.status(200).json(facility);

    } catch (error) {
        next(error);
    }
};


const createFacility = async (req, res, next) => {

    try {

        const {
            name,
            location
        } = req.body;

        const facility =
            await parkingFacilityService.createFacility(
                name,
                location
            );

        res.status(201).json(facility);

    } catch (error) {
        next(error);
    }
};


const updateFacility = async (req, res, next) => {

    try {

        const {
            name,
            location
        } = req.body;

        const facility =
            await parkingFacilityService.updateFacility(
                req.params.id,
                name,
                location
            );

        res.status(200).json(facility);

    } catch (error) {
        next(error);
    }
};


const updateFacilityStatus = async (req, res, next) => {

    try {

        const { status } = req.body;

        const facility =
            await parkingFacilityService.updateFacilityStatus(
                req.params.id,
                status
            );

        res.status(200).json(facility);

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getFacilities,
    getFacility,
    createFacility,
    updateFacility,
    updateFacilityStatus
};