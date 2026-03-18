import { db } from "@/server/db";
import { connectDB } from "@/server/db";
import { User, EmailVerificationCode, PasswordResetToken } from "@/server/db/model";
import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";
import { extractLastCode, testUser } from "./utils";
import { readFileSync } from "fs";

test.beforeAll(async () => {

  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    EmailVerificationCode.deleteMany({}),
    PasswordResetToken.deleteMany({}),
  ]);
});

test.describe("signup and login", () => {
  test("signup", async ({ page }) => {
    await page.goto("/");
    await page.getByText(/sign in/i).click();
    await page.getByText(/sign up/i).click();
    await page.waitForURL("/signup");
    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Password").fill(testUser.password);
    await page.getByLabel("submit-btn").click();
    await page.waitForURL("/verify-email");
    const data = readFileSync("application.log", { encoding: "utf-8" });
    const code = extractLastCode(data);
    expect(code).not.toBeNull();
    await page.getByLabel("Verification Code").fill(code!);
    await page.getByLabel("submit-btn").click();
    await page.waitForURL("/dashboard");
  });
  test("login and logout", async ({ page }) => {
    await page.goto("/");
    await page.getByText(/sign in/i).click();
    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Password").fill(testUser.password);
    await page.getByLabel("submit-btn").click();
    await page.waitForURL("/dashboard");
    await page.getByAltText("Avatar").click();
    await page.getByText("Sign out").click();
    await page.getByText("Continue").click();
    await page.waitForURL("/");
  });
});
