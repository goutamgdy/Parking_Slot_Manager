const pool = require("../db");

const createParkingSession = async (vehicleId, slotId) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Check vehicle
        const vehicleResult = await client.query(
            `
            SELECT id, vehicle_number, vehicle_type
            FROM vehicles
            WHERE id = $1
            `,
            [vehicleId]
        );

        if (vehicleResult.rows.length === 0) {
            throw new Error("Vehicle not found");
        }

        const vehicle = vehicleResult.rows[0];

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

        if (slotResult.rows.length === 0) {
            throw new Error("Parking slot not found");
        }

        const slot = slotResult.rows[0];

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

        // 6. Mark parking slot as OCCUPIED
        await client.query(
            `
            UPDATE parking_slots
            SET status = 'OCCUPIED'
            WHERE id = $1
            `,
            [slotId]
        );

        // 7. Commit transaction
        await client.query("COMMIT");

        return sessionResult.rows[0];

    } catch (error) {

        // Rollback everything if anything fails
        await client.query("ROLLBACK");

        throw error;

    } finally {
        client.release();
    }
};



const exitParkingSession = async (sessionId) => {
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

        // 5. Free parking slot
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

        return updatedSessionResult.rows[0];

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {
        client.release();
    }
};

module.exports = {
    createParkingSession,
    exitParkingSession
};