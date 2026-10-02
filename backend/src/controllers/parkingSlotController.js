const parkingSlotService =
    require("../services/parkingSlotService");


/*
 * =========================================================
 * GET ALL PARKING SLOTS
 * =========================================================
 */

const getParkingSlots = async (req, res, next) => {

    try {

        const slots =
            await parkingSlotService.getAllParkingSlots();

        res.status(200).json(slots);

    } catch (error) {

        next(error);
    }
};


/*
 * =========================================================
 * GET PARKING SLOT BY ID
 * =========================================================
 */

const getParkingSlot = async (req, res, next) => {

    try {

        const slot =
            await parkingSlotService.getParkingSlotById(
                Number(req.params.id)
            );

        res.status(200).json(slot);

    } catch (error) {

        next(error);
    }
};


/*
 * =========================================================
 * CREATE PARKING SLOT
 * ADMIN ONLY
 * =========================================================
 */

const createParkingSlot = async (req, res, next) => {

    try {

        const {
            areaId,
            slotNumber,
            slotType
        } = req.body;


        const slot =
            await parkingSlotService.createParkingSlot(
                Number(areaId),
                slotNumber,
                slotType
            );


        res.status(201).json(slot);

    } catch (error) {

        next(error);
    }
};


/*
 * =========================================================
 * UPDATE PARKING SLOT
 * ADMIN ONLY
 * =========================================================
 */

const updateParkingSlot = async (req, res, next) => {

    try {

        const {
            slotNumber,
            slotType
        } = req.body;


        const slot =
            await parkingSlotService.updateParkingSlot(
                Number(req.params.id),
                slotNumber,
                slotType
            );


        res.status(200).json(slot);

    } catch (error) {

        next(error);
    }
};


/*
 * =========================================================
 * UPDATE PARKING SLOT STATUS
 * ADMIN ONLY
 * =========================================================
 */

const updateParkingSlotStatus = async (
    req,
    res,
    next
) => {

    try {

        const { status } = req.body;


        const slot =
            await parkingSlotService.updateParkingSlotStatus(
                Number(req.params.id),
                status
            );


        res.status(200).json(slot);

    } catch (error) {

        next(error);
    }
};


module.exports = {
    getParkingSlots,
    getParkingSlot,
    createParkingSlot,
    updateParkingSlot,
    updateParkingSlotStatus
};