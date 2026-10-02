const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/authMiddleware");

const authorize =
    require("../middleware/authorization");

const adminUserController =
    require("../controllers/adminUserController");


router.get(
    "/",
    authenticateToken,
    authorize("ADMIN"),
    adminUserController.getUsers
);


router.get(
    "/:id",
    authenticateToken,
    authorize("ADMIN"),
    adminUserController.getUser
);


router.patch(
    "/:id/role",
    authenticateToken,
    authorize("ADMIN"),
    adminUserController.updateUserRole
);


router.patch(
    "/:id/status",
    authenticateToken,
    authorize("ADMIN"),
    adminUserController.updateUserStatus
);


module.exports = router;