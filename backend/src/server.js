require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./db");

const config = require("./config");

const logger = require("./utils/logger");

const errorHandler = require("./middleware/errorHandler");
const parkingSessionRoutes = require("./routes/parkingSessionRoutes");
const parkingSlotRoutes = require("./routes/parkingSlotRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const authRoutes = require("./routes/authRoutes");
const parkingFacilityRoutes = require("./routes/parkingFacilityRoutes");
const parkingAreaRoutes = require("./routes/parkingAreaRoutes");
const adminUserRoutes =
    require("./routes/adminUserRoutes");


const adminVehicleRoutes =
    require("./routes/adminVehicleRoutes");
    
const adminParkingSessionRoutes =
    require("./routes/adminParkingSessionRoutes"); 
const app = express();
const PORT = config.server.port;

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true
    })
);


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
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/auth", authRoutes);
app.use(
    "/api/parking-facilities",
    parkingFacilityRoutes
);

app.use(
    "/api/admin/users",
    adminUserRoutes
);

app.use(
    "/api/admin/vehicles",
    adminVehicleRoutes
);
app.use(
    "/api/parking-areas",
    parkingAreaRoutes
);
app.use(
    "/api/admin/parking-sessions",
    adminParkingSessionRoutes
);
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