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

test("USER data is isolated and cross-user vehicle/session access is denied", async ({ request }) => {
    const password = "Playwright@123";
    const userAEmail = uniqueEmail("isolation-a");
    const userBEmail = uniqueEmail("isolation-b");
    const vehicleNumber = uniqueEmail("ISO").split("@")[0].toUpperCase();

    for (const [email, name] of [
        [userAEmail, "Isolation User A"],
        [userBEmail, "Isolation User B"]
    ]) {
        const register = await request.post(`${apiURL}/auth/register`, {
            data: { name, email, password }
        });
        expect(register.status()).toBe(201);
    }

    const userAToken = await login(request, userAEmail, password);
    const userBToken = await login(request, userBEmail, password);
    const userAHeaders = { Authorization: `Bearer ${userAToken}` };
    const userBHeaders = { Authorization: `Bearer ${userBToken}` };

    const createVehicle = await request.post(`${apiURL}/vehicles`, {
        headers: userAHeaders,
        data: { vehicleNumber, vehicleType: "CAR" }
    });
    expect(createVehicle.status()).toBe(201);
    const vehicle = (await createVehicle.json()).vehicle;

    const userBVehicles = await request.get(`${apiURL}/vehicles`, {
        headers: userBHeaders
    });
    expect(userBVehicles.status()).toBe(200);
    expect((await userBVehicles.json()).vehicles).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: vehicle.id })])
    );

    const slotsResponse = await request.get(`${apiURL}/parking-slots`, {
        headers: userAHeaders
    });
    expect(slotsResponse.status()).toBe(200);

    const slots = (await slotsResponse.json()).slots;
    const availableCarSlot = slots.find(
        (slot) => slot.status === "AVAILABLE" && slot.slot_type === "CAR"
    );
    expect(availableCarSlot).toBeTruthy();

    const createSession = await request.post(`${apiURL}/parking-sessions`, {
        headers: userAHeaders,
        data: { vehicleId: vehicle.id, slotId: availableCarSlot.id }
    });
    expect(createSession.status()).toBe(201);
    const session = (await createSession.json()).session;

    const userBActive = await request.get(`${apiURL}/parking-sessions`, {
        headers: userBHeaders
    });
    expect(userBActive.status()).toBe(200);
    expect((await userBActive.json()).sessions).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: session.id })])
    );

    const userBHistory = await request.get(
        `${apiURL}/parking-sessions/history`,
        { headers: userBHeaders }
    );
    expect(userBHistory.status()).toBe(200);
    expect((await userBHistory.json()).sessions).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: session.id })])
    );

    const crossUserPark = await request.post(
        `${apiURL}/parking-sessions`,
        {
            headers: userBHeaders,
            data: { vehicleId: vehicle.id, slotId: availableCarSlot.id }
        }
    );
    expect(crossUserPark.status()).toBe(403);

    const crossUserExit = await request.post(
        `${apiURL}/parking-sessions/${session.id}/exit`,
        { headers: userBHeaders }
    );
    expect(crossUserExit.status()).toBe(403);

    const userAExit = await request.post(
        `${apiURL}/parking-sessions/${session.id}/exit`,
        { headers: userAHeaders }
    );
    expect(userAExit.status()).toBe(200);
});
