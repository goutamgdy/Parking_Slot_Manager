const { registerUser, loginUser } = require("../services/authService");

const AUTH_COOKIE = "psm_session";

const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 1000
});

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

        const user = await registerUser(name, email, password);

        res.status(201).json({
            message: "User registered successfully",
            user
        });
    } catch (error) {
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

        const result = await loginUser(email, password);

        res.cookie(AUTH_COOKIE, result.token, cookieOptions());

        res.status(200).json({
            message: "Login successful",
            user: result.user
        });
    } catch (error) {
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