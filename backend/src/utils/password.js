const argon2 = require("argon2");

const hashPassword = async (password) => {
    return await argon2.hash(password);
};

const verifyPassword = async (password, passwordHash) => {
    return await argon2.verify(passwordHash, password);
};

module.exports = {
    hashPassword,
    verifyPassword
};