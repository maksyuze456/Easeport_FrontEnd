import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

test.describe("Login flow", () => {

    test('successful login redirects to dashboard', async ({ page }) => {
        await page.goto('/login');

        await page.getByLabel('Username').fill(process.env.E2E_USERNAME!);
        await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!);

        await page.getByRole('button', { name : /Login/i}).click();

        await expect(page).toHaveURL('/dashboard');

        await page.getByRole('link', { name: /Logout/i }).click();

        await expect(page).toHaveURL('/login');


    })

})