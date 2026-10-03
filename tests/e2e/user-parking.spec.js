const { test, expect } = require("@playwright/test");
const { uniqueEmail, uniqueId } = require("../helpers/test-data");

test("USER can add a vehicle, park, exit, and see history", async ({ page }) => {
    const email = uniqueEmail("parking-user");
    const password = "Playwright@123";
    const vehicleNumber = uniqueId("PW");

    await page.goto("/register");
    await page.getByLabel("Name").fill("Playwright Parking User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Add Vehicle" })).toBeVisible();

    await page.locator('input[placeholder="MH12AB1234"]').fill(vehicleNumber);
    await page.locator("select").nth(2).selectOption("CAR");
    await page.getByRole("button", { name: "Add Vehicle" }).click();

    await expect(page.getByText(vehicleNumber, { exact: true })).toBeVisible();

    const vehicleSelect = page.locator("select").nth(0);
    const slotSelect = page.locator("select").nth(1);

    await vehicleSelect.selectOption({ label: new RegExp(vehicleNumber) });
    await expect(slotSelect).toBeEnabled();
    await expect(slotSelect.locator("option").nth(1)).toBeAttached();

    await slotSelect.selectOption({ index: 1 });
    await page.getByRole("button", { name: "Park Vehicle" }).click();

    await expect(page.getByText(/Parking session \d+ created successfully/)).toBeVisible();

    const activeHeading = page.getByRole("heading", { name: "Active Parking Sessions" });
    const activeSection = activeHeading.locator("..");
    await expect(activeSection.getByText(vehicleNumber, { exact: true })).toBeVisible();

    await activeSection.getByRole("button", { name: "Exit Vehicle" }).click();

    await expect(page.getByText(/Parking session \d+ completed successfully/)).toBeVisible();

    const historySection = page.getByRole("heading", { name: "Parking Session History" }).locator("..");
    await expect(historySection.getByText(vehicleNumber, { exact: true })).toBeVisible();
});