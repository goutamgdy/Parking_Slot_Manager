const REQUIRED_ENV_VARS = [
    "JWT_SECRET",
    "DB_HOST",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD"
];

const validateEnvironment = () => {
    const missing = REQUIRED_ENV_VARS.filter(
        (name) => !process.env[name] || !process.env[name].trim()
    );

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`
        );
    }

    if (process.env.NODE_ENV === "production") {
        if (process.env.JWT_SECRET.length < 32) {
            throw new Error(
                "JWT_SECRET must contain at least 32 characters in production"
            );
        }

        if (!process.env.FRONTEND_URL) {
            throw new Error(
                "FRONTEND_URL is required in production"
            );
        }

        let frontendUrl;

        try {
            frontendUrl = new URL(process.env.FRONTEND_URL);
        } catch {
            throw new Error("FRONTEND_URL must be a valid URL");
        }

        if (frontendUrl.protocol !== "https:") {
            throw new Error(
                "FRONTEND_URL must use HTTPS in production"
            );
        }
    }
};

module.exports = validateEnvironment;
