const pool = require("../db");


const getAllFacilities = async () => {

    const result = await pool.query(
        `
        SELECT
            id,
            name,
            location,
            status,
            created_at,
            updated_at
        FROM parking_facilities
        ORDER BY id
        `
    );

    return result.rows;
};


const getFacilityById = async (facilityId) => {

    const result = await pool.query(
        `
        SELECT
            id,
            name,
            location,
            status,
            created_at,
            updated_at
        FROM parking_facilities
        WHERE id = $1
        `,
        [facilityId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Parking facility not found");
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};


const createFacility = async (
    name,
    location
) => {

    const result = await pool.query(
        `
        INSERT INTO parking_facilities (
            name,
            location,
            status
        )
        VALUES (
            $1,
            $2,
            'ACTIVE'
        )
        RETURNING
            id,
            name,
            location,
            status,
            created_at,
            updated_at
        `,
        [
            name.trim(),
            location ? location.trim() : null
        ]
    );

    return result.rows[0];
};


const updateFacility = async (
    facilityId,
    name,
    location
) => {

    const result = await pool.query(
        `
        UPDATE parking_facilities
        SET
            name = $1,
            location = $2,
            updated_at = NOW()
        WHERE id = $3
        RETURNING
            id,
            name,
            location,
            status,
            created_at,
            updated_at
        `,
        [
            name.trim(),
            location ? location.trim() : null,
            facilityId
        ]
    );

    if (result.rows.length === 0) {
        const error = new Error("Parking facility not found");
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};


const updateFacilityStatus = async (
    facilityId,
    status
) => {

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const facilityResult = await client.query(
            `
            SELECT id, status
            FROM parking_facilities
            WHERE id = $1
            FOR UPDATE
            `,
            [facilityId]
        );

        if (facilityResult.rows.length === 0) {
            const error = new Error("Parking facility not found");
            error.statusCode = 404;
            throw error;
        }

        if (status === "INACTIVE") {
            const activeAreaResult = await client.query(
                `
                SELECT COUNT(*)::INTEGER AS active_area_count
                FROM parking_areas
                WHERE facility_id = $1
                  AND status = 'ACTIVE'
                `,
                [facilityId]
            );

            const activeAreaCount =
                activeAreaResult.rows[0].active_area_count;

            if (activeAreaCount > 0) {
                const error = new Error(
                    `Cannot deactivate facility while ${activeAreaCount} active area(s) exist`
                );
                error.statusCode = 409;
                throw error;
            }
        }

        const result = await client.query(
            `
            UPDATE parking_facilities
            SET
                status = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING
                id,
                name,
                location,
                status,
                created_at,
                updated_at
            `,
            [status, facilityId]
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
    getAllFacilities,
    getFacilityById,
    createFacility,
    updateFacility,
    updateFacilityStatus
};