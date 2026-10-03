const pool = require("../db");
const logger = require("../utils/logger");

const createParkingSession = async (userId, vehicleId, slotId) => {
    logger.info(`Parking session creation started vehicleId=${vehicleId} slotId=${slotId}`);

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const vehicleResult = await client.query(
            `
            SELECT id, vehicle_number, vehicle_type
            FROM vehicles
            WHERE id = $1
            AND user_id = $2
            FOR UPDATE
            `,
            [vehicleId, userId]
        );

        if (vehicleResult.rows.length === 0) {
            const error = new Error(
                "Vehicle not found or does not belong to the authenticated user"
            );
            error.statusCode = 403;
            throw error;
        }

        const vehicle = vehicleResult.rows[0];

        const slotResult = await client.query(
            `
            SELECT
                ps.id,
                ps.slot_number,
                ps.slot_type,
                ps.status,
                pa.status AS area_status,
                pf.status AS facility_status
            FROM parking_slots ps
            JOIN parking_areas pa ON ps.area_id = pa.id
            JOIN parking_facilities pf ON pa.facility_id = pf.id
            WHERE ps.id = $1
            FOR UPDATE
            `,
            [slotId]
        );

        const activeSessionResult = await client.query(
            `
            SELECT ps.id, ps.parking_slot_id, p.slot_number
            FROM parking_sessions ps
            JOIN parking_slots p ON ps.parking_slot_id = p.id
            WHERE ps.vehicle_id = $1
            AND ps.status = 'ACTIVE'
            LIMIT 1
            `,
            [vehicleId]
        );

        if (activeSessionResult.rows.length > 0) {
            const activeSession = activeSessionResult.rows[0];
            const error = new Error(
                `Vehicle ${vehicle.vehicle_number} is already parked in slot ${activeSession.slot_number}`
            );
            error.statusCode = 409;
            throw error;
        }

        if (slotResult.rows.length === 0) {
            throw new Error("Parking slot not found");
        }

        const slot = slotResult.rows[0];

        if (slot.area_status !== "ACTIVE" || slot.facility_status !== "ACTIVE") {
            const error = new Error(
                "Parking slot is not available because its parking area or facility is inactive"
            );
            error.statusCode = 409;
            throw error;
        }

        if (slot.status !== "AVAILABLE") {
            throw new Error("Parking slot is already occupied");
        }

        if (vehicle.vehicle_type !== slot.slot_type) {
            throw new Error(
                `Vehicle type ${vehicle.vehicle_type} cannot use ${slot.slot_type} slot`
            );
        }

        const sessionResult = await client.query(
            `
            INSERT INTO parking_sessions
                (vehicle_id, parking_slot_id, entry_time, status)
            VALUES ($1, $2, NOW(), 'ACTIVE')
            RETURNING
                id, vehicle_id, parking_slot_id, entry_time,
                exit_time, parking_fee, status
            `,
            [vehicleId, slotId]
        );

        await client.query(
            `
            UPDATE parking_slots
            SET status = 'OCCUPIED'
            WHERE id = $1
            `,
            [slotId]
        );

        await client.query("COMMIT");

        return sessionResult.rows[0];

    } catch (error) {
        await client.query("ROLLBACK");
        logger.error(
            `Parking session creation failed vehicleId=${vehicleId} slotId=${slotId} error=${error.message}`
        );
        throw error;
    } finally {
        client.release();
    }
};

const exitParkingSession = async (userId, sessionId) => {
    logger.info(`Parking session exit started sessionId=${sessionId}`);

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

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
            JOIN vehicles v ON ps.vehicle_id = v.id
            WHERE ps.id = $1
            AND v.user_id = $2
            FOR UPDATE
            `,
            [sessionId, userId]
        );

        if (sessionResult.rows.length === 0) {
            const error = new Error(
                "Parking session not found or does not belong to the authenticated user"
            );
            error.statusCode = 403;
            throw error;
        }

        const session = sessionResult.rows[0];

        if (session.status !== "ACTIVE") {
            throw new Error("Parking session is already completed");
        }

        const feeResult = await client.query(
            `
            SELECT CEIL(EXTRACT(EPOCH FROM (NOW() - $1)) / 3600) AS hours
            `,
            [session.entry_time]
        );

        const hours = Math.max(1, Number(feeResult.rows[0].hours));
        const parkingFee = hours * 20;

        const updatedSessionResult = await client.query(
            `
            UPDATE parking_sessions
            SET
                exit_time = NOW(),
                parking_fee = $1,
                status = 'COMPLETED'
            WHERE id = $2
            RETURNING
                id, vehicle_id, parking_slot_id, entry_time,
                exit_time, parking_fee, status
            `,
            [parkingFee, sessionId]
        );

        await client.query(
            `
            UPDATE parking_slots
            SET status = 'AVAILABLE'
            WHERE id = $1
            `,
            [session.parking_slot_id]
        );

        await client.query("COMMIT");

        return updatedSessionResult.rows[0];

    } catch (error) {
        await client.query("ROLLBACK");
        logger.error(
            `Parking session exit failed sessionId=${sessionId} error=${error.message}`
        );
        throw error;
    } finally {
        client.release();
    }
};

const getActiveParkingSessions = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            ps.id,
            ps.vehicle_id,
            v.vehicle_number,
            v.vehicle_type,
            ps.parking_slot_id,
            p.slot_number,
            ps.entry_time,
            ps.status
        FROM parking_sessions ps
        JOIN vehicles v ON ps.vehicle_id = v.id
        JOIN parking_slots p ON ps.parking_slot_id = p.id
        WHERE ps.status = 'ACTIVE'
        AND v.user_id = $1
        ORDER BY ps.entry_time
        `,
        [userId]
    );

    return result.rows;
};

const getParkingSessionHistory = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            ps.id,
            ps.vehicle_id,
            v.vehicle_number,
            v.vehicle_type,
            ps.parking_slot_id,
            p.slot_number,
            ps.entry_time,
            ps.exit_time,
            ps.parking_fee,
            ps.status
        FROM parking_sessions ps
        JOIN vehicles v ON ps.vehicle_id = v.id
        JOIN parking_slots p ON ps.parking_slot_id = p.id
        WHERE ps.status = 'COMPLETED'
        AND v.user_id = $1
        ORDER BY ps.exit_time DESC
        `,
        [userId]
    );

    return result.rows;
};

module.exports = {
    createParkingSession,
    exitParkingSession,
    getActiveParkingSessions,
    getParkingSessionHistory
};
