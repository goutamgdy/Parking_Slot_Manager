const jwt = require("jsonwebtoken");
const db = require("../db");

const AUTH_COOKIE = "psm_session";

const getCookieToken = (req) => {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
        return null;
    }

    for (const cookie of cookieHeader.split(";")) {
        const separatorIndex = cookie.indexOf("=");

        if (separatorIndex === -1) {
            continue;
        }

        const name = cookie.slice(0, separatorIndex).trim();
        const value = cookie.slice(separatorIndex + 1).trim();

        if (name === AUTH_COOKIE) {
            return decodeURIComponent(value);
        }
    }

    return null;
};

const authenticateToken = async (req, res, next) => {
    try {
        const token = getCookieToken(req);

        if (!token) {
            const error = new Error("Authentication is required");
            error.status = 401;
            throw error;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await db.query(
            `
            SELECT id, role, status
            FROM users
            WHERE id = $1
            `,
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            const error = new Error("User not found");
            error.status = 401;
            throw error;
        }

        const user = result.rows[0];

        if (user.status !== "ACTIVE") {
            const error = new Error("User account is inactive");
            error.status = 403;
            throw error;
        }

        req.user = {
            userId: user.id,
            role: user.role
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            error.status = 401;
            error.message = "Session has expired";
        }

        if (error.name === "JsonWebTokenError") {
            error.status = 401;
            error.message = "Invalid session";
        }

        next(error);
    }
};

module.exports = authenticateToken;