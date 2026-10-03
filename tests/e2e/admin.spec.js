const { test, expect } = require("@playwright/test");

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

test.beforeEach(async ({ page }) => {
    test.skip(
        !adminEmail || !adminPassword,
        "Set ADMIN_EMAIL and ADMIN_PASSWORD to run admin UI tests."
    );

    await page.goto("/login");
    await page.getByLabel("Email").fill(adminEmail);
    await page.getByLabel("Password").fill(adminPassword);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
});

test("ADMIN can navigate the complete management hierarchy", async ({ page }) => {
    const pages = [
        { path: "/admin", heading: "Admin Dashboard" },
        { path: "/admin/facilities", heading: "Parking Facilities" },
        { path: "/admin/areas", heading: "Parking Areas" },
        { path: "/admin/slots", heading: "Parking Slots" },
        { path: "/admin/sessions", heading: "Parking Sessions" },
        { path: "/admin/users", heading: "User Management" },
        { path: "/admin/vehicles", heading: "Vehicles" }
    ];

    for (const item of pages) {
        await page.goto(item.path);
        await expect(page).toHaveURL(new RegExp(item.path.replace("/", "\\/") + "$"));
        await expect(page.getByRole("heading", { name: item.heading })).toBeVisible();
    }
});

test("ADMIN sees the expected navigation groups", async ({ page }) => {
    await expect(page.getByRole("navigation", { name: "Administration navigation" }).getByText("Parking Management")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Administration navigation" }).getByText("People & Vehicles")).toBeVisible();

    for (const label of ["Facilities", "Areas", "Slots", "Parking Sessions", "Users", "Vehicles"]) {
        await expect(page.getByRole("button", { name: label })).toBeVisible();
    }
});