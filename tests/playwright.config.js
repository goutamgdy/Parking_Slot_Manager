const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
    testDir: ".",
    timeout: 60000,
    expect: { timeout: 10000 },
    fullyParallel: false,
    workers: 1,
    retries: process.env.CI ? 2 : 0,
    reporter: [
        ["list"],
        ["html", { outputFolder: "playwright-report", open: "never" }]
    ],
    use: {
        baseURL: process.env.FRONTEND_URL || "http://localhost:3000",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure"
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } }
    ]
});