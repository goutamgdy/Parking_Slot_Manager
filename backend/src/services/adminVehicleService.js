const pool = require("../db");


const getAllVehicles = async () => {

    const result = await pool.query(
        `
        SELECT
            v.id,
            v.vehicle_number,
            v.vehicle_type,
            v.created_at,
            u.id AS user_id,
            u.name AS user_name,
            u.email AS user_email
        FROM vehicles v
        JOIN users u
            ON u.id = v.user_id
        ORDER BY v.id
        `
    );

    return result.rows;
};


const getVehicleById = async (vehicleId) => {

    const result = await pool.query(
        `
        SELECT
            v.id,
            v.vehicle_number,
            v.vehicle_type,
            v.created_at,
            u.id AS user_id,
            u.name AS user_name,
            u.email AS user_email
        FROM vehicles v
        JOIN users u
            ON u.id = v.user_id
        WHERE v.id = $1
        `,
        [vehicleId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Vehicle not found");
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};


module.exports = {
    getAllVehicles,
    getVehicleById
};