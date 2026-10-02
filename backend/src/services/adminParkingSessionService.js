const pool = require("../db");
const logger = require("../utils/logger");

const getAllParkingSessions = async () => {
    const result = await pool.query(
        `
        SELECT
            ps.id,
            ps.vehicle_id,
            v.vehicle_number,
            v.vehicle_type,
            v.user_id,
            u.name AS user_name,
            u.email AS user_email,
            ps.parking_slot_id,
            psl.slot_number,
            pa.name AS area_name,
            pf.name AS facility_name,
            ps.entry_time,
            ps.exit_time,
            ps.status,
            ps.parking_fee
        FROM parking_sessions ps
        JOIN vehicles v
            ON v.id = ps.vehicle_id
        JOIN users u
            ON u.id = v.user_id
        JOIN parking_slots psl
            ON psl.id = ps.parking_slot_id
        JOIN parking_areas pa
            ON pa.id = psl.area_id
        JOIN parking_facilities pf
            ON pf.id = pa.facility_id
        ORDER BY ps.id DESC
        `
    );

    return result.rows;
};


const getParkingSessionById = async (sessionId) => {
    const result = await pool.query(
        `
        SELECT
            ps.id,
            ps.vehicle_id,
            v.vehicle_number,
            v.vehicle_type,
            v.user_id,
            u.name AS user_name,
            u.email AS user_email,
            ps.parking_slot_id,
            psl.slot_number,
            pa.name AS area_name,
            pf.name AS facility_name,
            ps.entry_time,
            ps.exit_time,
            ps.status,
            ps.parking_fee
        FROM parking_sessions ps
        JOIN vehicles v
            ON v.id = ps.vehicle_id
        JOIN users u
            ON u.id = v.user_id
        JOIN parking_slots psl
            ON psl.id = ps.parking_slot_id
        JOIN parking_areas pa
            ON pa.id = psl.area_id
        JOIN parking_facilities pf
            ON pf.id = pa.facility_id
        WHERE ps.id = $1
        `,
        [sessionId]
    );

    if (result.rows.length === 0) {
        const error = new Error(
            "Parking session not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return result.rows[0];
};


const exitParkingSession = async (sessionId) => {
    logger.info(
        `ADMIN parking session exit started sessionId=${sessionId}`
    );

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Lock the parking session
        const sessionResult = await client.query(
            `
            SELECT
                ps.id,
                ps.vehicle_id,
                ps.parking_slot_id,
                ps.entry_time,
                ps.exit_time,
                ps.parking_fee,
                ps.status
            FROM parking_sessions ps
            WHERE ps.id = $1
            FOR UPDATE
            `,
            [sessionId]
        );

        if (sessionResult.rows.length === 0) {
            const error = new Error(
                "Parking session not found"
            );

            error.statusCode = 404;

            throw error;
        }

        const session = sessionResult.rows[0];

        // 2. Check session status
        if (session.status !== "ACTIVE") {
            const error = new Error(
                "Parking session is already completed"
            );

            error.statusCode = 409;

            throw error;
        }

        // 3. Calculate parking fee
        const feeResult = await client.query(
            `
            SELECT
                CEIL(
                    EXTRACT(
                        EPOCH FROM (NOW() - $1)
                    ) / 3600
                ) AS hours
            `,
            [session.entry_time]
        );

        const hours = Math.max(
            1,
            Number(feeResult.rows[0].hours)
        );

        const parkingFee = hours * 20;

        logger.info(
            `ADMIN parking fee calculated sessionId=${sessionId} hours=${hours} fee=${parkingFee}`
        );

        // 4. Mark session COMPLETED
        const updatedSessionResult = await client.query(
            `
            UPDATE parking_sessions
            SET
                exit_time = NOW(),
                parking_fee = $1,
                status = 'COMPLETED'
            WHERE id = $2
            RETURNING
                id,
                vehicle_id,
                parking_slot_id,
                entry_time,
                exit_time,
                parking_fee,
                status
            `,
            [parkingFee, sessionId]
        );

        // 5. Free the parking slot
        await client.query(
            `
            UPDATE parking_slots
            SET status = 'AVAILABLE'
            WHERE id = $1
            `,
            [session.parking_slot_id]
        );

        // 6. Commit transaction
        await client.query("COMMIT");

        logger.info(
            `ADMIN parking session exit completed sessionId=${sessionId} fee=${parkingFee}`
        );

        return updatedSessionResult.rows[0];

    } catch (error) {
        await client.query("ROLLBACK");

        logger.error(
            `ADMIN parking session exit failed sessionId=${sessionId} error=${error.message}`
        );

        throw error;

    } finally {
        client.release();
    }
};


module.exports = {
    getAllParkingSessions,
    getParkingSessionById,
    exitParkingSession
};
