const { test, expect } = require("@playwright/test");

// This test assumes backend and frontend dev server are running.
// It performs a login and verifies Dashboard appears.

test("login smoke test", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[type="password"]', "adminpass");
  await page.click("text=Sign in");
  // wait for navigation to dashboard
  await page.waitForURL("**/dashboard", { timeout: 5000 });
  await expect(page.locator("text=Apps")).toBeVisible();
});
