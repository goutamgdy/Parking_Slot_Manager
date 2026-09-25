require("dotenv").config();

const express = require("express");
const pool = require("./db");

const config = require("./config");

const logger = require("./utils/logger");

const errorHandler = require("./middleware/errorHandler");
const parkingSessionRoutes = require("./routes/parkingSessionRoutes");
const parkingSlotRoutes = require("./routes/parkingSlotRoutes");

const app = express();

const PORT = config.server.port;

app.use(express.json());

app.get("/", (req, res) => {
    logger.info("GET / - API root requested");

    res.json({
        message: "Parking Slot Manager API is running"
    });
});

app.get("/api/health/live", (req, res) => {
    logger.info("GET /api/health/live - Application is alive");

    res.status(200).json({
        status: "UP"
    });
});


app.get("/api/health/ready", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        logger.info(
            "GET /api/health/ready - Application is ready"
        );

        res.status(200).json({
            status: "READY",
            database: "CONNECTED"
        });

    } catch (error) {

        logger.error(
            `GET /api/health/ready - Application is not ready: ${error.message}`
        );

        res.status(503).json({
            status: "NOT_READY",
            database: "NOT_CONNECTED"
        });
    }
});

app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        logger.info("GET /api/health - Database connected");

        res.status(200).json({
            status: "UP",
            database: "CONNECTED",
            time: result.rows[0].now
        });

    } catch (error) {
        logger.error(
            `GET /api/health - Database connection failed: ${error.message}`
        );

        res.status(500).json({
            status: "DOWN",
            database: "NOT CONNECTED"
        });
    }
});

app.use("/api/parking-slots", parkingSlotRoutes);
app.use("/api/parking-sessions", parkingSessionRoutes);

app.use(errorHandler);

const server = app.listen(PORT, () => {
    logger.info(`Server started on http://localhost:${PORT}`);
});

const shutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
        logger.info("HTTP server closed");

        try {
            await pool.end();

            logger.info("Database connection pool closed");

            process.exit(0);

        } catch (error) {

            logger.error(
                `Error closing database pool: ${error.message}`
            );

            process.exit(1);
        }
    });
};

process.on("SIGTERM", () => {
    shutdown("SIGTERM");
});

process.on("SIGINT", () => {
    shutdown("SIGINT");
});