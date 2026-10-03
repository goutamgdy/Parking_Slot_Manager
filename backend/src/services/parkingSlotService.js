const pool = require("../db");


/*
 * =========================================================
 * GET ALL PARKING SLOTS
 * =========================================================
 */

const getAllParkingSlots = async (role) => {

    const result = await pool.query(
        `
        SELECT
            ps.id,
            ps.area_id,
            pa.name AS area_name,
            pa.facility_id,
            pf.name AS facility_name,
            ps.slot_number,
            ps.slot_type,
            ps.status,
            ps.created_at,
            ps.updated_at
        FROM parking_slots ps

        JOIN parking_areas pa
            ON ps.area_id = pa.id

        JOIN parking_facilities pf
            ON pa.facility_id = pf.id

        WHERE
            $1 = 'ADMIN'
            OR (
                pa.status = 'ACTIVE'
                AND pf.status = 'ACTIVE'
            )
        ORDER BY
            ps.id
        `
    , [role || "USER"]
    );

    return result.rows;
};


/*
 * =========================================================
 * GET PARKING SLOT BY ID
 * =========================================================
 */

const getParkingSlotById = async (slotId) => {

    const result = await pool.query(
        `
        SELECT
            ps.id,
            ps.area_id,
            pa.name AS area_name,
            pa.facility_id,
            pf.name AS facility_name,
            ps.slot_number,
            ps.slot_type,
            ps.status,
            ps.created_at,
            ps.updated_at
        FROM parking_slots ps

        JOIN parking_areas pa
            ON ps.area_id = pa.id

        JOIN parking_facilities pf
            ON pa.facility_id = pf.id

        WHERE ps.id = $1
        `,
        [slotId]
    );


    if (result.rows.length === 0) {

        const error = new Error(
            "Parking slot not found"
        );

        error.statusCode = 404;

        throw error;
    }


    return result.rows[0];
};


/*
 * =========================================================
 * CREATE PARKING SLOT
 * =========================================================
 *
 * Important business rules:
 *
 * 1. Area must exist
 * 2. Area must be ACTIVE
 * 3. Facility must be ACTIVE
 * 4. Area capacity cannot be exceeded
 * 5. Duplicate slot number is rejected by DB
 *
 * Transaction + row lock prevents two admins from
 * simultaneously exceeding the same area's capacity.
 *
 * =========================================================
 */

const createParkingSlot = async (
    areaId,
    slotNumber,
    slotType
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        /*
         * Lock the Area row.
         */

        const areaResult = await client.query(
            `
            SELECT
                pa.id,
                pa.facility_id,
                pa.name,
                pa.capacity,
                pa.status,
                pf.status AS facility_status
            FROM parking_areas pa

            JOIN parking_facilities pf
                ON pa.facility_id = pf.id

            WHERE pa.id = $1

            FOR UPDATE
            `,
            [areaId]
        );


        if (areaResult.rows.length === 0) {

            const error = new Error(
                "Parking area not found"
            );

            error.statusCode = 404;

            throw error;
        }


        const area = areaResult.rows[0];


        /*
         * Area must be active.
         */

        if (area.status !== "ACTIVE") {

            const error = new Error(
                "Cannot create slot under an inactive area"
            );

            error.statusCode = 409;

            throw error;
        }


        /*
         * Facility must also be active.
         */

        if (area.facility_status !== "ACTIVE") {

            const error = new Error(
                "Cannot create slot under an inactive facility"
            );

            error.statusCode = 409;

            throw error;
        }


        /*
         * Count existing slots.
         */

        const slotCountResult = await client.query(
            `
            SELECT
                COUNT(*)::INTEGER AS slot_count
            FROM parking_slots
            WHERE area_id = $1
            `,
            [areaId]
        );


        const slotCount =
            slotCountResult.rows[0].slot_count;


        /*
         * Capacity check.
         */

        if (slotCount >= area.capacity) {

            const error = new Error(
                `Parking area capacity has been reached (${area.capacity})`
            );

            error.statusCode = 409;

            throw error;
        }


        /*
         * Create slot.
         */

        const result = await client.query(
            `
            INSERT INTO parking_slots (
                area_id,
                slot_number,
                slot_type,
                status
            )
            VALUES (
                $1,
                $2,
                $3,
                'AVAILABLE'
            )
            RETURNING
                id,
                area_id,
                slot_number,
                slot_type,
                status,
                created_at,
                updated_at
            `,
            [
                areaId,
                slotNumber.trim(),
                slotType
            ]
        );


        await client.query("COMMIT");


        return result.rows[0];

    } catch (error) {

        await client.query("ROLLBACK");


        /*
         * PostgreSQL unique constraint violation.
         */

        if (error.code === "23505") {

            const duplicateError = new Error(
                `Parking slot '${slotNumber.trim()}' already exists in this area`
            );

            duplicateError.statusCode = 409;

            throw duplicateError;
        }


        throw error;

    } finally {

        client.release();
    }
};


/*
 * =========================================================
 * UPDATE PARKING SLOT
 * =========================================================
 */

const updateParkingSlot = async (
    slotId,
    slotNumber,
    slotType
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        /*
         * Lock slot row.
         */

        const slotResult = await client.query(
            `
            SELECT
                id,
                area_id,
                status
            FROM parking_slots
            WHERE id = $1
            FOR UPDATE
            `,
            [slotId]
        );


        if (slotResult.rows.length === 0) {

            const error = new Error(
                "Parking slot not found"
            );

            error.statusCode = 404;

            throw error;
        }


        const slot = slotResult.rows[0];


        /*
         * Do not modify an occupied slot's configuration.
         *
         * This prevents changing the identity/type of a slot
         * while a vehicle is currently parked there.
         */

        if (slot.status === "OCCUPIED") {

            const error = new Error(
                "Cannot update an occupied parking slot"
            );

            error.statusCode = 409;

            throw error;
        }


        const result = await client.query(
            `
            UPDATE parking_slots
            SET
                slot_number = $1,
                slot_type = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING
                id,
                area_id,
                slot_number,
                slot_type,
                status,
                created_at,
                updated_at
            `,
            [
                slotNumber.trim(),
                slotType,
                slotId
            ]
        );


        await client.query("COMMIT");


        return result.rows[0];

    } catch (error) {

        await client.query("ROLLBACK");


        if (error.code === "23505") {

            const duplicateError = new Error(
                `Parking slot '${slotNumber.trim()}' already exists in this area`
            );

            duplicateError.statusCode = 409;

            throw duplicateError;
        }


        throw error;

    } finally {

        client.release();
    }
};


/*
 * =========================================================
 * UPDATE PARKING SLOT STATUS
 * =========================================================
 */

const updateParkingSlotStatus = async (
    slotId,
    status
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        /*
         * Lock slot row.
         */

        const slotResult = await client.query(
            `
            SELECT
                id,
                area_id,
                status
            FROM parking_slots
            WHERE id = $1
            FOR UPDATE
            `,
            [slotId]
        );


        if (slotResult.rows.length === 0) {

            const error = new Error(
                "Parking slot not found"
            );

            error.statusCode = 404;

            throw error;
        }


        const slot = slotResult.rows[0];


        /*
         * Never manually change an occupied slot.
         */

        if (
            slot.status === "OCCUPIED" &&
            status !== "OCCUPIED"
        ) {

            const error = new Error(
                "Cannot change the status of an occupied parking slot"
            );

            error.statusCode = 409;

            throw error;
        }


        /*
         * Prevent manually setting a slot to OCCUPIED.
         *
         * OCCUPIED should be controlled by parking-session
         * entry/exit transactions.
         */

        if (
            status === "OCCUPIED" &&
            slot.status !== "OCCUPIED"
        ) {

            const error = new Error(
                "Parking slot occupancy is managed by parking sessions"
            );

            error.statusCode = 409;

            throw error;
        }


        const result = await client.query(
            `
            UPDATE parking_slots
            SET
                status = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING
                id,
                area_id,
                slot_number,
                slot_type,
                status,
                created_at,
                updated_at
            `,
            [
                status,
                slotId
            ]
        );


        await client.query("COMMIT");


        return result.rows[0];

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();
    }
};


module.exports = {
    getAllParkingSlots,
    getParkingSlotById,
    createParkingSlot,
    updateParkingSlot,
    updateParkingSlotStatus
};