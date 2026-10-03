const { test, expect } = require("@playwright/test");

const apiURL = process.env.API_URL || "http://localhost:5000/api";

test("backend liveness and readiness endpoints are healthy", async ({ request }) => {
    const live = await request.get(`${apiURL}/health/live`);
    expect(live.status()).toBe(200);
    await expect(live.json()).resolves.toMatchObject({ status: "UP" });

    const ready = await request.get(`${apiURL}/health/ready`);
    expect(ready.status()).toBe(200);
    await expect(ready.json()).resolves.toMatchObject({
        status: "READY",
        database: "CONNECTED"
    });
});