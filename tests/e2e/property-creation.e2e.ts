import { expect, test } from '@playwright/test';

test.describe('Property Creation', () => {
	test.beforeEach(async ({ page }) => {
		// Clear IndexedDB before each test to start fresh
		await page.goto('/');
		await page.evaluate(() => indexedDB.deleteDatabase('gardening'));
		await page.reload();
		await expect(page.getByRole('heading', { name: /create your property/i })).toBeVisible();
	});

	test('creates a property with name only and shows header (AC #1, #2)', async ({ page }) => {
		await page.getByLabel(/property name/i).fill('My Garden');
		await page.getByRole('button', { name: /create property/i }).click();

		// Form should disappear, header should appear
		await expect(page.getByRole('heading', { name: /create your property/i })).not.toBeVisible();
		await expect(page.getByRole('heading', { name: 'My Garden' })).toBeVisible();
	});

	test('creates a property with name and dimensions (AC #3)', async ({ page }) => {
		await page.getByLabel(/property name/i).fill('Back Yard');
		await page.getByLabel(/width/i).fill('50');
		await page.getByLabel(/length/i).fill('100');

		await page.getByRole('button', { name: /create property/i }).click();

		await expect(page.getByRole('heading', { name: 'Back Yard' })).toBeVisible();
		await expect(page.getByText('50 × 100 ft')).toBeVisible();
	});

	test('creates a property with metric dimensions', async ({ page }) => {
		await page.getByLabel(/property name/i).fill('Jardin');
		await page.getByLabel(/width/i).fill('15');
		await page.getByLabel(/length/i).fill('30');
		await page.getByLabel(/unit/i).selectOption('m');

		await page.getByRole('button', { name: /create property/i }).click();

		await expect(page.getByRole('heading', { name: 'Jardin' })).toBeVisible();
		await expect(page.getByText('15 × 30 m')).toBeVisible();
	});

	test('shows validation error for empty name', async ({ page }) => {
		await page.getByRole('button', { name: /create property/i }).click();

		await expect(page.getByText(/name is required/i)).toBeVisible();
		// Form should still be visible — no navigation
		await expect(page.getByRole('heading', { name: /create your property/i })).toBeVisible();
	});

	test('property survives page reload (AC #4)', async ({ page }) => {
		await page.getByLabel(/property name/i).fill('Persistent Garden');
		await page.getByLabel(/width/i).fill('75');
		await page.getByLabel(/length/i).fill('120');
		await page.getByRole('button', { name: /create property/i }).click();

		await expect(page.getByRole('heading', { name: 'Persistent Garden' })).toBeVisible();

		// Reload the page
		await page.reload();

		// Property should be restored from IndexedDB
		await expect(page.getByRole('heading', { name: 'Persistent Garden' })).toBeVisible();
		await expect(page.getByText('75 × 120 ft')).toBeVisible();
		// Creation form should NOT appear
		await expect(page.getByRole('heading', { name: /create your property/i })).not.toBeVisible();
	});

	test('shows validation error for whitespace-only name', async ({ page }) => {
		await page.getByLabel(/property name/i).fill('   ');
		await page.getByRole('button', { name: /create property/i }).click();

		await expect(page.getByText(/name is required/i)).toBeVisible();
		await expect(page.getByRole('heading', { name: /create your property/i })).toBeVisible();
	});

	test('creates property with undefined dimensions when only width is provided', async ({
		page
	}) => {
		await page.getByLabel(/property name/i).fill('Partial Dims');
		await page.getByLabel(/width/i).fill('50');
		// Length left empty

		await page.getByRole('button', { name: /create property/i }).click();

		// Property should be created — partial dimensions silently dropped
		await expect(page.getByRole('heading', { name: 'Partial Dims' })).toBeVisible();
		// No dimensions should be displayed
		await expect(page.getByText(/×/)).not.toBeVisible();
	});

	test('creates property with undefined dimensions when only length is provided', async ({
		page
	}) => {
		await page.getByLabel(/property name/i).fill('Partial Dims 2');
		await page.getByLabel(/length/i).fill('100');
		// Width left empty

		await page.getByRole('button', { name: /create property/i }).click();

		await expect(page.getByRole('heading', { name: 'Partial Dims 2' })).toBeVisible();
		await expect(page.getByText(/×/)).not.toBeVisible();
	});

	test('name input enforces 500 character maxlength', async ({ page }) => {
		const nameInput = page.getByLabel(/property name/i);
		const longName = 'a'.repeat(600);

		await nameInput.fill(longName);

		// Browser should truncate to 500 via maxlength attribute
		const value = await nameInput.inputValue();
		expect(value.length).toBeLessThanOrEqual(500);
	});

	test('prevents double-submit — form disappears after first creation', async ({ page }) => {
		await page.getByLabel(/property name/i).fill('No Duplicates');

		await page.getByRole('button', { name: /create property/i }).click();

		// Form disappears reactively — button is no longer in the DOM
		await expect(page.getByRole('button', { name: /create property/i })).not.toBeVisible();
		await expect(page.getByRole('heading', { name: 'No Duplicates' })).toBeVisible();

		// Verify only one event was committed to IndexedDB
		const eventCount = await page.evaluate(async () => {
			const db = indexedDB.open('gardening');
			return new Promise<number>((resolve) => {
				db.onsuccess = () => {
					const tx = db.result.transaction('events', 'readonly');
					const store = tx.objectStore('events');
					const count = store.count();
					count.onsuccess = () => resolve(count.result);
				};
			});
		});
		expect(eventCount).toBe(1);
	});

	test('property without dimensions survives reload (AC #4)', async ({ page }) => {
		await page.getByLabel(/property name/i).fill('Simple Garden');
		await page.getByRole('button', { name: /create property/i }).click();

		await expect(page.getByRole('heading', { name: 'Simple Garden' })).toBeVisible();

		await page.reload();

		await expect(page.getByRole('heading', { name: 'Simple Garden' })).toBeVisible();
	});
});
