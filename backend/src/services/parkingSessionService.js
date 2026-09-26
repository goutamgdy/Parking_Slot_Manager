const pool = require("../db");
const logger = require("../utils/logger");
const createParkingSession = async (vehicleId, slotId) => {
    logger.info(
        `Parking session creation started vehicleId=${vehicleId} slotId=${slotId}`
    );

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Check vehicle
        const vehicleResult = await client.query(
            `
            SELECT
                id,
                vehicle_number,
                vehicle_type
            FROM vehicles
            WHERE id = $1
            FOR UPDATE
            `,
            [vehicleId]
        );

        if (vehicleResult.rows.length === 0) {
            throw new Error("Vehicle not found");
        }

        const vehicle = vehicleResult.rows[0];

        logger.info(
            `Vehicle validated vehicleId=${vehicleId} vehicleType=${vehicle.vehicle_type}`
        );

        // 2. Check parking slot
        const slotResult = await client.query(
            `
            SELECT id, slot_number, slot_type, status
            FROM parking_slots
            WHERE id = $1
            FOR UPDATE
            `,
            [slotId]
        );

        const activeSessionResult = await client.query(
            `
            SELECT
                ps.id,
                ps.parking_slot_id,
                p.slot_number
            FROM parking_sessions ps
            JOIN parking_slots p
                ON ps.parking_slot_id = p.id
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

        logger.info(
            `Parking slot validated slotId=${slotId} slotType=${slot.slot_type} status=${slot.status}`
        );

        // 3. Check slot status
        if (slot.status !== "AVAILABLE") {
            throw new Error("Parking slot is already occupied");
        }

        // 4. Check vehicle type and slot type
        if (vehicle.vehicle_type !== slot.slot_type) {
            throw new Error(
                `Vehicle type ${vehicle.vehicle_type} cannot use ${slot.slot_type} slot`
            );
        }

        // 5. Create parking session
        const sessionResult = await client.query(
            `
            INSERT INTO parking_sessions
                (vehicle_id, parking_slot_id, entry_time, status)
            VALUES
                ($1, $2, NOW(), 'ACTIVE')
            RETURNING
                id,
                vehicle_id,
                parking_slot_id,
                entry_time,
                exit_time,
                parking_fee,
                status
            `,
            [vehicleId, slotId]
        );

        logger.info(
            `Parking session created sessionId=${sessionResult.rows[0].id}`
        );

        // 6. Mark parking slot as OCCUPIED
        await client.query(
            `
            UPDATE parking_slots
            SET status = 'OCCUPIED'
            WHERE id = $1
            `,
            [slotId]
        );

        logger.info(
            `Parking slot marked OCCUPIED slotId=${slotId}`
        );

        // 7. Commit transaction
        await client.query("COMMIT");

        logger.info(
            `Parking session creation completed sessionId=${sessionResult.rows[0].id}`
        );

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


const exitParkingSession = async (sessionId) => {
    logger.info(
        `Parking session exit started sessionId=${sessionId}`
    );

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Find active parking session
        const sessionResult = await client.query(
            `
            SELECT
                id,
                vehicle_id,
                parking_slot_id,
                entry_time,
                exit_time,
                parking_fee,
                status
            FROM parking_sessions
            WHERE id = $1
            FOR UPDATE
            `,
            [sessionId]
        );

        if (sessionResult.rows.length === 0) {
            throw new Error("Parking session not found");
        }

        const session = sessionResult.rows[0];

        logger.info(
            `Parking session validated sessionId=${sessionId} status=${session.status} slotId=${session.parking_slot_id}`
        );

        // 2. Check session status
        if (session.status !== "ACTIVE") {
            throw new Error("Parking session is already completed");
        }

        // 3. Calculate parking fee
        const feeResult = await client.query(
            `
            SELECT
                CEIL(EXTRACT(EPOCH FROM (NOW() - $1)) / 3600) AS hours
            `,
            [session.entry_time]
        );

        const hours = Math.max(1, Number(feeResult.rows[0].hours));

        // Simple pricing:
        // ₹20 per hour
        const parkingFee = hours * 20;

        logger.info(
            `Parking fee calculated sessionId=${sessionId} hours=${hours} fee=${parkingFee}`
        );

        // 4. Update parking session
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

        logger.info(
            `Parking session marked COMPLETED sessionId=${sessionId}`
        );

        // 5. Free parking slot
        await client.query(
            `
            UPDATE parking_slots
            SET status = 'AVAILABLE'
            WHERE id = $1
            `,
            [session.parking_slot_id]
        );

        logger.info(
            `Parking slot marked AVAILABLE slotId=${session.parking_slot_id}`
        );

        // 6. Commit transaction
        await client.query("COMMIT");

        logger.info(
            `Parking session exit completed sessionId=${sessionId} fee=${parkingFee}`
        );

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

const getActiveParkingSessions = async () => {
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
        JOIN vehicles v
            ON ps.vehicle_id = v.id
        JOIN parking_slots p
            ON ps.parking_slot_id = p.id
        WHERE ps.status = 'ACTIVE'
        ORDER BY ps.entry_time
        `
    );

    return result.rows;
};

const getParkingSessionHistory = async () => {
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
        JOIN vehicles v
            ON ps.vehicle_id = v.id
        JOIN parking_slots p
            ON ps.parking_slot_id = p.id
        WHERE ps.status = 'COMPLETED'
        ORDER BY ps.exit_time DESC
        `
    );

    return result.rows;
};

module.exports = {
    createParkingSession,
    exitParkingSession,
    getActiveParkingSessions,
    getParkingSessionHistory
};