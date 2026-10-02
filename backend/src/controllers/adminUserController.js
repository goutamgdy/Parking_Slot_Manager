const adminUserService =
    require("../services/adminUserService");


const getUsers = async (req, res, next) => {
    try {

        const users =
            await adminUserService.getAllUsers();

        res.status(200).json(users);

    } catch (error) {
        next(error);
    }
};


const getUser = async (req, res, next) => {
    try {

        const user =
            await adminUserService.getUserById(
                Number(req.params.id)
            );

        res.status(200).json(user);

    } catch (error) {
        next(error);
    }
};


const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        const user =
            await adminUserService.updateUserRole(
                Number(req.params.id),
                role,
                req.user.userId
            );

        res.status(200).json(user);

    } catch (error) {
        next(error);
    }
};


const updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const user =
            await adminUserService.updateUserStatus(
                Number(req.params.id),
                status,
                req.user.userId
            );

        res.status(200).json(user);

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getUsers,
    getUser,
    updateUserRole,
    updateUserStatus
};