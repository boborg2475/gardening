import { expect, test } from '@playwright/test';

test('home page loads and shows property creation form', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: /create your property/i })).toBeVisible();
	await expect(page.getByLabel(/property name/i)).toBeVisible();
	await expect(page.getByRole('button', { name: /create property/i })).toBeVisible();
});
