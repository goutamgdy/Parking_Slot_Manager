const parkingAreaService =
    require("../services/parkingAreaService");


const getAreas = async (req, res, next) => {

    try {

        const areas =
            await parkingAreaService.getAllAreas();

        res.status(200).json(areas);

    } catch (error) {

        next(error);
    }
};


const getArea = async (req, res, next) => {

    try {

        const area =
            await parkingAreaService.getAreaById(
                Number(req.params.id)
            );

        res.status(200).json(area);

    } catch (error) {

        next(error);
    }
};


const createArea = async (req, res, next) => {

    try {

        const {
            facilityId,
            name,
            capacity
        } = req.body;


        const area =
            await parkingAreaService.createArea(
                Number(facilityId),
                name,
                Number(capacity)
            );


        res.status(201).json(area);

    } catch (error) {

        next(error);
    }
};


const updateArea = async (req, res, next) => {

    try {

        const {
            name,
            capacity
        } = req.body;


        const area =
            await parkingAreaService.updateArea(
                Number(req.params.id),
                name,
                Number(capacity)
            );


        res.status(200).json(area);

    } catch (error) {

        next(error);
    }
};


const updateAreaStatus = async (req, res, next) => {

    try {

        const { status } = req.body;


        const area =
            await parkingAreaService.updateAreaStatus(
                Number(req.params.id),
                status
            );


        res.status(200).json(area);

    } catch (error) {

        next(error);
    }
};


module.exports = {
    getAreas,
    getArea,
    createArea,
    updateArea,
    updateAreaStatus
};