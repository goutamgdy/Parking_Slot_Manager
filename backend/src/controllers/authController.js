const { registerUser, loginUser } = require("../services/authService");

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

        const user = await registerUser(
            name,
            email,
            password
        );

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

        res.status(200).json({
            message: "Login successful",
            ...result
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login
};