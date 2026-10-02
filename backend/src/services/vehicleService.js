const pool = require("../db");

const getVehiclesByUser = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            id,
            user_id,
            vehicle_number,
            vehicle_type,
            created_at
        FROM vehicles
        WHERE user_id = $1
        ORDER BY id
        `,
        [userId]
    );

    return result.rows;
};

const createVehicle = async (
    userId,
    vehicleNumber,
    vehicleType
) => {
    try {
        const result = await pool.query(
            `
            INSERT INTO vehicles (
                user_id,
                vehicle_number,
                vehicle_type
            )
            VALUES ($1, $2, $3)
            RETURNING
                id,
                user_id,
                vehicle_number,
                vehicle_type,
                created_at
            `,
            [
                userId,
                vehicleNumber.trim().toUpperCase(),
                vehicleType
            ]
        );

        return result.rows[0];

    } catch (error) {

        if (error.code === "23505") {
            const duplicateError = new Error(
                `Vehicle ${vehicleNumber.trim().toUpperCase()} already exists`
            );

            duplicateError.statusCode = 409;

            throw duplicateError;
        }

        throw error;
    }
};

module.exports = {
    getVehiclesByUser,
    createVehicle
};