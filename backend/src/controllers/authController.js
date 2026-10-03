const { registerUser, loginUser } = require("../services/authService");
const logger = require("../utils/logger");

const AUTH_COOKIE = "psm_session";

const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 1000
});

const validateRegistrationInput = (name, email, password) => {
    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return "Name, email and password must be strings";
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
        return "Name must be between 2 and 100 characters";
    }

    if (email.trim().length > 150) {
        return "Email must not exceed 150 characters";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
        return "Please provide a valid email address";
    }

    if (password.length < 8 || password.length > 128) {
        return "Password must be between 8 and 128 characters";
    }

    return null;
};

const validateLoginInput = (email, password) => {
    if (
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return "Email and password must be strings";
    }

    if (email.trim().length === 0 || email.trim().length > 150) {
        return "Please provide a valid email address";
    }

    if (password.length === 0 || password.length > 128) {
        return "Invalid email or password";
    }

    return null;
};

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            const error = new Error(
                "Name, email and password are required"
            );
            error.status = 400;
            throw error;
        }

        const validationError = validateRegistrationInput(
            name,
            email,
            password
        );

        if (validationError) {
            const error = new Error(validationError);
            error.status = 400;
            throw error;
        }

        const user = await registerUser(name, email, password);

        logger.info(
            `AUTH_REGISTER_SUCCESS userId=${user.id}`
        );

        res.status(201).json({
            message: "User registered successfully",
            user
        });
    } catch (error) {
        logger.warn(
            `AUTH_REGISTER_FAILED reason=${error.message}`
        );
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const error = new Error(
                "Email and password are required"
            );
            error.status = 400;
            throw error;
        }

        const validationError = validateLoginInput(
            email,
            password
        );

        if (validationError) {
            const error = new Error(validationError);
            error.status = 400;
            throw error;
        }

        const result = await loginUser(email, password);

        res.cookie(AUTH_COOKIE, result.token, cookieOptions());

        logger.info(
            `AUTH_LOGIN_SUCCESS userId=${result.user.id}`
        );

        res.status(200).json({
            message: "Login successful",
            user: result.user
        });
    } catch (error) {
        logger.warn(
            "AUTH_LOGIN_FAILED"
        );
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        res.clearCookie(AUTH_COOKIE, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        logger.info("AUTH_LOGOUT");

        res.status(200).json({
            message: "Logout successful"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    logout
};
