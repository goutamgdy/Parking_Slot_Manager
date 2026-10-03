const { test, expect } = require("@playwright/test");
const { uniqueEmail } = require("../helpers/test-data");

const apiURL = process.env.API_URL || "http://localhost:5000/api";

async function login(request, email, password) {
    const response = await request.post(`${apiURL}/auth/login`, {
        data: { email, password }
    });

    expect(response.status()).toBe(200);
    return (await response.json()).token;
}

test("USER is denied ADMIN endpoints while ADMIN is allowed", async ({ request }) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    test.skip(
        !adminEmail || !adminPassword,
        "Set ADMIN_EMAIL and ADMIN_PASSWORD to run security API tests."
    );

    const userEmail = uniqueEmail("api-user");
    const userPassword = "Playwright@123";

    const register = await request.post(`${apiURL}/auth/register`, {
        data: {
            name: "Playwright API User",
            email: userEmail,
            password: userPassword
        }
    });

    expect(register.status()).toBe(201);

    const userToken = await login(request, userEmail, userPassword);
    const adminToken = await login(request, adminEmail, adminPassword);

    for (const endpoint of [
        "/admin/users",
        "/admin/vehicles",
        "/admin/parking-sessions"
    ]) {
        const userResponse = await request.get(`${apiURL}${endpoint}`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        expect(userResponse.status()).toBe(403);
    }

    for (const endpoint of [
        "/admin/users",
        "/admin/vehicles",
        "/admin/parking-sessions"
    ]) {
        const adminResponse = await request.get(`${apiURL}${endpoint}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        expect(adminResponse.status()).toBe(200);
    }
});