const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const authenticateToken = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorization");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticateToken, (req, res) => {
    res.status(200).json({
        message: "Authentication successful",
        user: req.user
    });
});

router.get(
    "/admin-test",
    authenticateToken,
    authorize("ADMIN"),
    (req, res) => {
        res.status(200).json({
            message: "Admin authorization successful",
            user: req.user
        });
    }
);
module.exports = router;