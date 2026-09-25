require("dotenv").config();

const express = require("express");
const pool = require("./db");

const errorHandler = require("./middleware/errorHandler");
const parkingSessionRoutes = require("./routes/parkingSessionRoutes");
const parkingSlotRoutes = require("./routes/parkingSlotRoutes");

const app = express();
app.use(express.json());
app.use("/api/parking-slots", parkingSlotRoutes);
app.use("/api/parking-sessions", parkingSessionRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;


app.get("/", (req, res) => {
    res.json({
        message: "Parking Slot Manager API is running"
    });
});

app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.status(200).json({
            status: "UP",
            database: "CONNECTED",
            time: result.rows[0].now
        });

    } catch (error) {
        console.error("Database connection failed:", error.message);

        res.status(500).json({
            status: "DOWN",
            database: "NOT CONNECTED"
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});