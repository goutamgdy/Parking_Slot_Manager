function uniqueId(prefix = "PW") {
    return `${prefix}${Date.now()}`;
}

function uniqueEmail(prefix = "playwright-user") {
    return `${prefix}-${Date.now()}@example.com`;
}

module.exports = { uniqueId, uniqueEmail };