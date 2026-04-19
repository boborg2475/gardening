/**
 * Tests for north orientation UX — validation, error feedback,
 * updating values, and placeholder display.
 */

import { expect, test } from '@playwright/test';

async function createPropertyViaForm(
	page: import('@playwright/test').Page,
	options: { name: string; width?: string; length?: string }
) {
	await page.getByLabel(/property name/i).fill(options.name);
	if (options.width) await page.getByLabel(/width/i).fill(options.width);
	if (options.length) await page.getByLabel(/length/i).fill(options.length);
	await page.getByRole('button', { name: /create property/i }).click();
	await expect(page.getByRole('heading', { name: options.name })).toBeVisible();
}

test.describe('North Orientation UX', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => indexedDB.deleteDatabase('gardening'));
		await page.reload();
		await expect(page.getByRole('heading', { name: /create your property/i })).toBeVisible();
		await createPropertyViaForm(page, { name: 'North Test', width: '50', length: '100' });
	});

	test('setting north orientation shows value in placeholder', async ({ page }) => {
		const northInput = page.getByLabel(/north orientation/i);
		await northInput.fill('45');
		await page.getByRole('button', { name: /set north/i }).click();

		// Wait for the orientation to persist
		await page.waitForFunction(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getNorthIndicatorState()?.degrees === 45;
		});

		// Input should be cleared and placeholder should show the saved value
		await expect(northInput).toHaveValue('');
		const placeholder = await northInput.getAttribute('placeholder');
		expect(placeholder).toBe('45°');
	});

	test('updating north orientation changes placeholder to new value', async ({ page }) => {
		const northInput = page.getByLabel(/north orientation/i);

		// Set initial value
		await northInput.fill('90');
		await page.getByRole('button', { name: /set north/i }).click();
		await page.waitForFunction(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getNorthIndicatorState()?.degrees === 90;
		});

		// Update to new value
		await northInput.fill('180');
		await page.getByRole('button', { name: /set north/i }).click();
		await page.waitForFunction(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getNorthIndicatorState()?.degrees === 180;
		});

		const placeholder = await northInput.getAttribute('placeholder');
		expect(placeholder).toBe('180°');
	});

	test('invalid value shows error and clears input', async ({ page }) => {
		const northInput = page.getByLabel(/north orientation/i);

		// Enter an out-of-range value
		await northInput.fill('400');
		await page.getByRole('button', { name: /set north/i }).click();

		// Error should appear
		const error = page.locator('[data-testid="north-error"]');
		await expect(error).toBeVisible();
		await expect(error).toHaveText('Enter a value between 0 and 359');

		// Input should be cleared
		await expect(northInput).toHaveValue('');
	});

	test('negative value shows error', async ({ page }) => {
		const northInput = page.getByLabel(/north orientation/i);

		await northInput.fill('-10');
		await page.getByRole('button', { name: /set north/i }).click();

		const error = page.locator('[data-testid="north-error"]');
		await expect(error).toBeVisible();
	});

	test('error clears when user starts typing', async ({ page }) => {
		const northInput = page.getByLabel(/north orientation/i);

		// Trigger error
		await northInput.fill('999');
		await page.getByRole('button', { name: /set north/i }).click();
		const error = page.locator('[data-testid="north-error"]');
		await expect(error).toBeVisible();

		// Start typing — error should clear
		await northInput.fill('4');
		await expect(error).not.toBeVisible();
	});

	test('invalid value does not overwrite previously saved orientation', async ({ page }) => {
		const northInput = page.getByLabel(/north orientation/i);

		// Set a valid value first
		await northInput.fill('120');
		await page.getByRole('button', { name: /set north/i }).click();
		await page.waitForFunction(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getNorthIndicatorState()?.degrees === 120;
		});

		// Try an invalid value
		await northInput.fill('500');
		await page.getByRole('button', { name: /set north/i }).click();

		// Original value should be preserved
		const degrees = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getNorthIndicatorState()?.degrees;
		});
		expect(degrees).toBe(120);

		// Placeholder should still show original value
		const placeholder = await northInput.getAttribute('placeholder');
		expect(placeholder).toBe('120°');
	});
});
