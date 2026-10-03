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
    await expect(page.getByText("Your Vehicles")).toBeVisible();

    await page.getByLabel("Vehicle Number").fill(vehicleNumber);
    await page.getByLabel("Vehicle Type").selectOption("CAR");
    await page.getByRole("button", { name: "Add Vehicle" }).click();

    await expect(page.getByText(vehicleNumber)).toBeVisible();

    const vehicleSelect = page.getByLabel("Vehicle");
    await vehicleSelect.selectOption({ label: new RegExp(vehicleNumber) });

    const slotSelect = page.getByLabel("Parking Slot");
    await expect(slotSelect).toBeEnabled();
    await expect(slotSelect.locator("option").nth(1)).toBeAttached();

    await slotSelect.selectOption({ index: 1 });
    await page.getByRole("button", { name: "Park Vehicle" }).click();

    await expect(page.getByText(/Parking session \d+ created successfully/)).toBeVisible();

    const activeHeading = page.getByRole("heading", { name: "Active Parking Sessions" });
    const activeSection = activeHeading.locator("..");
    await expect(activeSection.getByText(vehicleNumber)).toBeVisible();

    await activeSection.getByRole("button", { name: "Exit Vehicle" }).click();

    await expect(page.getByText(/Parking session \d+ completed successfully/)).toBeVisible();
    const historySection = page.getByRole("heading", { name: "Parking Session History" }).locator("..");
    await expect(historySection.getByText(vehicleNumber)).toBeVisible();
});