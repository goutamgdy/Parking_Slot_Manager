const db = require("../db");
const { hashPassword, verifyPassword } = require("../utils/password");
const jwt = require("jsonwebtoken");


const registerUser = async (name, email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await db.query(
        "SELECT id FROM users WHERE email = $1",
        [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
        const error = new Error("Email is already registered");
        error.status = 409;
        throw error;
    }

    const passwordHash = await hashPassword(password);

    const result = await db.query(
        `INSERT INTO users
            (name, email, password_hash)
         VALUES
            ($1, $2, $3)
         RETURNING id, name, email, role, created_at`,
        [name.trim(), normalizedEmail, passwordHash]
    );

    return result.rows[0];
};


const loginUser = async (email, password) => {

    const normalizedEmail = email.trim().toLowerCase();

    const result = await db.query(
        `SELECT id, name, email, password_hash, role, status
        FROM users
        WHERE email = $1`,
        [normalizedEmail]
    );

    if (result.rows.length === 0) {
        const error = new Error("Invalid email or password");
        error.status = 401;
        throw error;
    }

    const user = result.rows[0];
    if (user.status !== "ACTIVE") {
        const error = new Error("User account is inactive");
        error.status = 403;
        throw error;
    }
    if (!user.password_hash) {
        const error = new Error("Invalid email or password");
        error.status = 401;
        throw error;
    }

    const passwordValid = await verifyPassword(
        password,
        user.password_hash
    );

    if (!passwordValid) {
        const error = new Error("Invalid email or password");
        error.status = 401;
        throw error;
    }

    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};


module.exports = {
    registerUser,
    loginUser
};