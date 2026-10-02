const jwt = require("jsonwebtoken");
const db = require("../db");

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            const error = new Error(
                "Authorization token is required"
            );
            error.status = 401;
            throw error;
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            const error = new Error(
                "Authorization header must use Bearer token"
            );
            error.status = 401;
            throw error;
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const result = await db.query(
            `
            SELECT
                id,
                role,
                status
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
            error.message = "Token has expired";
        }

        if (error.name === "JsonWebTokenError") {
            error.status = 401;
            error.message = "Invalid token";
        }

        next(error);
    }
};

module.exports = authenticateToken;