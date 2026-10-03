const { test, expect } = require("@playwright/test");
const { uniqueEmail } = require("../helpers/test-data");

test("USER can register and login", async ({ page }) => {
    const email = uniqueEmail();
    const password = "Playwright@123";
    const name = "Playwright User";

    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();

    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(`Welcome, ${name}`)).toBeVisible();
    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
});

test("invalid USER login shows an error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("does-not-exist@example.com");
    await page.getByLabel("Password").fill("WrongPassword@123");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
});