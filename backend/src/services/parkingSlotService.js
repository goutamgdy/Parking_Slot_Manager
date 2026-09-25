const pool = require("../db");

const getAllParkingSlots = async () => {
    const result = await pool.query(`
        SELECT
            id,
            slot_number,
            slot_type,
            status
        FROM parking_slots
        ORDER BY id
    `);

    return result.rows;
};

module.exports = {
    getAllParkingSlots
};