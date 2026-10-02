const pool = require("../db");


const getAllAreas = async () => {

    const result = await pool.query(
        `
        SELECT
            pa.id,
            pa.facility_id,
            pf.name AS facility_name,
            pa.name,
            pa.capacity,
            pa.status,
            COUNT(ps.id)::INTEGER AS slot_count,
            COUNT(ps.id) FILTER (
                WHERE ps.status = 'OCCUPIED'
            )::INTEGER AS occupied_slot_count,
            pa.created_at,
            pa.updated_at
        FROM parking_areas pa

        JOIN parking_facilities pf
            ON pa.facility_id = pf.id

        LEFT JOIN parking_slots ps
            ON ps.area_id = pa.id

        GROUP BY
            pa.id,
            pa.facility_id,
            pf.name,
            pa.name,
            pa.capacity,
            pa.status,
            pa.created_at,
            pa.updated_at

        ORDER BY
            pa.id
        `
    );

    return result.rows;
};


const getAreaById = async (areaId) => {

    const result = await pool.query(
        `
        SELECT
            pa.id,
            pa.facility_id,
            pf.name AS facility_name,
            pa.name,
            pa.capacity,
            pa.status,
            COUNT(ps.id)::INTEGER AS slot_count,
            COUNT(ps.id) FILTER (
                WHERE ps.status = 'OCCUPIED'
            )::INTEGER AS occupied_slot_count,
            pa.created_at,
            pa.updated_at
        FROM parking_areas pa

        JOIN parking_facilities pf
            ON pa.facility_id = pf.id

        LEFT JOIN parking_slots ps
            ON ps.area_id = pa.id

        WHERE pa.id = $1

        GROUP BY
            pa.id,
            pa.facility_id,
            pf.name,
            pa.name,
            pa.capacity,
            pa.status,
            pa.created_at,
            pa.updated_at
        `,
        [areaId]
    );


    if (result.rows.length === 0) {

        const error = new Error(
            "Parking area not found"
        );

        error.statusCode = 404;

        throw error;
    }


    return result.rows[0];
};


const createArea = async (
    facilityId,
    name,
    capacity
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        // =================================================
        // Check facility
        // =================================================

        const facilityResult = await client.query(
            `
            SELECT
                id,
                name,
                status
            FROM parking_facilities
            WHERE id = $1
            FOR UPDATE
            `,
            [facilityId]
        );


        if (facilityResult.rows.length === 0) {

            const error = new Error(
                "Parking facility not found"
            );

            error.statusCode = 404;

            throw error;
        }


        const facility = facilityResult.rows[0];


        if (facility.status !== "ACTIVE") {

            const error = new Error(
                "Cannot create area under an inactive facility"
            );

            error.statusCode = 409;

            throw error;
        }


        // =================================================
        // Create area
        // =================================================

        const result = await client.query(
            `
            INSERT INTO parking_areas (
                facility_id,
                name,
                capacity,
                status
            )
            VALUES (
                $1,
                $2,
                $3,
                'ACTIVE'
            )
            RETURNING
                id,
                facility_id,
                name,
                capacity,
                status,
                created_at,
                updated_at
            `,
            [
                facilityId,
                name.trim(),
                capacity
            ]
        );


        await client.query("COMMIT");


        return result.rows[0];

    } catch (error) {

        await client.query("ROLLBACK");


        if (error.code === "23505") {

            const duplicateError = new Error(
                `Area '${name.trim()}' already exists in this facility`
            );

            duplicateError.statusCode = 409;

            throw duplicateError;
        }


        throw error;

    } finally {

        client.release();
    }
};


const updateArea = async (
    areaId,
    name,
    capacity
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        // =================================================
        // Lock area
        // =================================================

        const areaResult = await client.query(
            `
            SELECT
                id,
                facility_id,
                name,
                capacity,
                status
            FROM parking_areas
            WHERE id = $1
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


        // =================================================
        // Count existing slots
        // =================================================

        const slotCountResult = await client.query(
            `
            SELECT COUNT(*)::INTEGER AS slot_count
            FROM parking_slots
            WHERE area_id = $1
            `,
            [areaId]
        );


        const slotCount =
            slotCountResult.rows[0].slot_count;


        // =================================================
        // Capacity validation
        // =================================================

        if (Number(capacity) < slotCount) {

            const error = new Error(
                `Capacity cannot be less than current slot count (${slotCount})`
            );

            error.statusCode = 409;

            throw error;
        }


        // =================================================
        // Update
        // =================================================

        const result = await client.query(
            `
            UPDATE parking_areas
            SET
                name = $1,
                capacity = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING
                id,
                facility_id,
                name,
                capacity,
                status,
                created_at,
                updated_at
            `,
            [
                name.trim(),
                capacity,
                areaId
            ]
        );


        await client.query("COMMIT");


        return result.rows[0];

    } catch (error) {

        await client.query("ROLLBACK");


        if (error.code === "23505") {

            const duplicateError = new Error(
                `Area '${name.trim()}' already exists in this facility`
            );

            duplicateError.statusCode = 409;

            throw duplicateError;
        }


        throw error;

    } finally {

        client.release();
    }
};


const updateAreaStatus = async (
    areaId,
    status
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        // =================================================
        // Lock area
        // =================================================

        const areaResult = await client.query(
            `
            SELECT
                id,
                facility_id,
                name,
                status
            FROM parking_areas
            WHERE id = $1
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


        // =================================================
        // Prevent deactivating occupied area
        // =================================================

        if (status === "INACTIVE") {

            const occupiedResult = await client.query(
                `
                SELECT COUNT(*)::INTEGER AS occupied_count
                FROM parking_slots
                WHERE area_id = $1
                  AND status = 'OCCUPIED'
                `,
                [areaId]
            );


            const occupiedCount =
                occupiedResult.rows[0].occupied_count;


            if (occupiedCount > 0) {

                const error = new Error(
                    `Cannot deactivate area while ${occupiedCount} slot(s) are occupied`
                );

                error.statusCode = 409;

                throw error;
            }
        }


        // =================================================
        // Update status
        // =================================================

        const result = await client.query(
            `
            UPDATE parking_areas
            SET
                status = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING
                id,
                facility_id,
                name,
                capacity,
                status,
                created_at,
                updated_at
            `,
            [
                status,
                areaId
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
    getAllAreas,
    getAreaById,
    createArea,
    updateArea,
    updateAreaStatus
};