const pool = require("../db");


const getAllUsers = async () => {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            role,
            status,
            created_at
        FROM users
        ORDER BY id
        `
    );

    return result.rows;
};


const getUserById = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            role,
            status,
            created_at
        FROM users
        WHERE id = $1
        `,
        [userId]
    );

    if (result.rows.length === 0) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};


const updateUserRole = async (userId, role, requestingUserId) => {

    if (!["USER", "ADMIN"].includes(role)) {
        const error = new Error(
            "role must be USER or ADMIN"
        );
        error.statusCode = 400;
        throw error;
    }

    if (userId === requestingUserId) {
        const error = new Error(
            "You cannot change your own role"
        );
        error.statusCode = 403;
        throw error;
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const userResult = await client.query(
            `
            SELECT
                id,
                name,
                email,
                role,
                status
            FROM users
            WHERE id = $1
            FOR UPDATE
            `,
            [userId]
        );

        if (userResult.rows.length === 0) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const user = userResult.rows[0];

        if (
            user.role === "ADMIN" &&
            role === "USER" &&
            user.status === "ACTIVE"
        ) {

            const adminCountResult = await client.query(
                `
                SELECT COUNT(*)::int AS count
                FROM users
                WHERE role = 'ADMIN'
                AND status = 'ACTIVE'
                `
            );

            const activeAdminCount =
                adminCountResult.rows[0].count;

            if (activeAdminCount <= 1) {
                const error = new Error(
                    "Cannot remove the last active administrator"
                );
                error.statusCode = 409;
                throw error;
            }
        }

        const result = await client.query(
            `
            UPDATE users
            SET role = $1
            WHERE id = $2
            RETURNING
                id,
                name,
                email,
                role,
                status,
                created_at
            `,
            [role, userId]
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


const updateUserStatus = async (
    userId,
    status,
    requestingUserId
) => {

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
        const error = new Error(
            "status must be ACTIVE or INACTIVE"
        );
        error.statusCode = 400;
        throw error;
    }

    if (userId === requestingUserId) {
        const error = new Error(
            "You cannot change your own account status"
        );
        error.statusCode = 403;
        throw error;
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const userResult = await client.query(
            `
            SELECT
                id,
                name,
                email,
                role,
                status
            FROM users
            WHERE id = $1
            FOR UPDATE
            `,
            [userId]
        );

        if (userResult.rows.length === 0) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const user = userResult.rows[0];

        if (
            user.role === "ADMIN" &&
            user.status === "ACTIVE" &&
            status === "INACTIVE"
        ) {

            const adminCountResult = await client.query(
                `
                SELECT COUNT(*)::int AS count
                FROM users
                WHERE role = 'ADMIN'
                AND status = 'ACTIVE'
                `
            );

            const activeAdminCount =
                adminCountResult.rows[0].count;

            if (activeAdminCount <= 1) {
                const error = new Error(
                    "Cannot deactivate the last active administrator"
                );
                error.statusCode = 409;
                throw error;
            }
        }

        const result = await client.query(
            `
            UPDATE users
            SET status = $1
            WHERE id = $2
            RETURNING
                id,
                name,
                email,
                role,
                status,
                created_at
            `,
            [status, userId]
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
    getAllUsers,
    getUserById,
    updateUserRole,
    updateUserStatus
};