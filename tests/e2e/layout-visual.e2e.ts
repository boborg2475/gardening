/**
 * Tests for layout and visual correctness — validates that UI controls
 * are properly positioned within the viewport and no content overflows.
 */

import { expect, test } from '@playwright/test';

async function createPropertyViaForm(
	page: import('@playwright/test').Page,
	options: { name: string; width?: string; length?: string; unit?: 'm' | 'ft' }
) {
	await page.getByLabel(/property name/i).fill(options.name);
	if (options.width) {
		await page.getByLabel(/width/i).fill(options.width);
	}
	if (options.length) {
		await page.getByLabel(/length/i).fill(options.length);
	}
	if (options.unit === 'm') {
		await page.getByLabel(/unit/i).selectOption('m');
	}
	await page.getByRole('button', { name: /create property/i }).click();
	await expect(page.getByRole('heading', { name: options.name })).toBeVisible();
}

test.describe('Layout and visual validation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => indexedDB.deleteDatabase('gardening'));
		await page.reload();
		await expect(page.getByRole('heading', { name: /create your property/i })).toBeVisible();
	});

	test('page does not scroll — no vertical scrollbar', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Layout Test', width: '50', length: '100' });

		const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
		const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);

		// The page content should fit within the viewport — no overflow
		expect(scrollHeight).toBeLessThanOrEqual(clientHeight);
	});

	test('property header is fully visible at top of page', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Header Test', width: '50', length: '100' });

		const header = page.locator('header');
		await expect(header).toBeVisible();

		const headerBox = await header.boundingBox();
		expect(headerBox).not.toBeNull();

		// Header should start at or near the top
		expect(headerBox!.y).toBeLessThanOrEqual(5);
		// Header should be fully within viewport
		expect(headerBox!.y + headerBox!.height).toBeGreaterThan(0);
	});

	test('Draw Boundary button is fully visible within viewport', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Button Test', width: '50', length: '100' });

		const drawBtn = page.getByRole('button', { name: /draw boundary/i });
		await expect(drawBtn).toBeVisible();

		const viewport = page.viewportSize();
		const btnBox = await drawBtn.boundingBox();
		expect(btnBox).not.toBeNull();

		expect(btnBox!.x).toBeGreaterThanOrEqual(0);
		expect(btnBox!.y).toBeGreaterThanOrEqual(0);
		expect(btnBox!.x + btnBox!.width).toBeLessThanOrEqual(viewport!.width);
		expect(btnBox!.y + btnBox!.height).toBeLessThanOrEqual(viewport!.height);
	});

	test('Grid Scale selector is fully visible within viewport', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Selector Test', width: '50', length: '100' });

		const selector = page.getByLabel(/grid scale/i);
		await expect(selector).toBeVisible();

		const viewport = page.viewportSize();
		const selectorBox = await selector.boundingBox();
		expect(selectorBox).not.toBeNull();

		expect(selectorBox!.x).toBeGreaterThanOrEqual(0);
		expect(selectorBox!.y).toBeGreaterThanOrEqual(0);
		expect(selectorBox!.x + selectorBox!.width).toBeLessThanOrEqual(viewport!.width);
		expect(selectorBox!.y + selectorBox!.height).toBeLessThanOrEqual(viewport!.height);
	});

	test('North Orientation controls are fully visible within viewport', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'North Test', width: '50', length: '100' });

		const northInput = page.locator('#north-orientation');
		await expect(northInput).toBeVisible();

		const setNorthBtn = page.getByRole('button', { name: /set north/i });
		await expect(setNorthBtn).toBeVisible();

		const viewport = page.viewportSize();

		const inputBox = await northInput.boundingBox();
		expect(inputBox).not.toBeNull();
		expect(inputBox!.y + inputBox!.height).toBeLessThanOrEqual(viewport!.height);
		expect(inputBox!.x).toBeGreaterThanOrEqual(0);

		const btnBox = await setNorthBtn.boundingBox();
		expect(btnBox).not.toBeNull();
		expect(btnBox!.y + btnBox!.height).toBeLessThanOrEqual(viewport!.height);
		expect(btnBox!.x + btnBox!.width).toBeLessThanOrEqual(viewport!.width);
	});

	test('canvas fills remaining space below header', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Canvas Fill', width: '50', length: '100' });

		const header = page.locator('header');
		const canvas = page.locator('[data-testid="property-map"]');
		await expect(header).toBeVisible();
		await expect(canvas).toBeVisible();

		const viewport = page.viewportSize();
		const headerBox = await header.boundingBox();
		const canvasBox = await canvas.boundingBox();
		expect(headerBox).not.toBeNull();
		expect(canvasBox).not.toBeNull();

		// Canvas should start right after the header
		const gap = canvasBox!.y - (headerBox!.y + headerBox!.height);
		expect(gap).toBeLessThanOrEqual(2); // allow 1-2px rounding

		// Canvas bottom should be at or near the viewport bottom
		const canvasBottom = canvasBox!.y + canvasBox!.height;
		expect(canvasBottom).toBeLessThanOrEqual(viewport!.height);
		expect(canvasBottom).toBeGreaterThanOrEqual(viewport!.height - 5); // within 5px
	});

	test('top controls and bottom controls do not overlap', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Overlap Test', width: '50', length: '100' });

		const drawBtn = page.getByRole('button', { name: /draw boundary/i });
		const northInput = page.locator('#north-orientation');
		await expect(drawBtn).toBeVisible();
		await expect(northInput).toBeVisible();

		const topBox = await drawBtn.boundingBox();
		const bottomBox = await northInput.boundingBox();
		expect(topBox).not.toBeNull();
		expect(bottomBox).not.toBeNull();

		// Bottom controls should be below top controls
		expect(bottomBox!.y).toBeGreaterThan(topBox!.y + topBox!.height);
	});

	test('layout works at small viewport size', async ({ page }) => {
		await page.setViewportSize({ width: 640, height: 480 });
		await page.reload();
		await expect(page.getByRole('heading', { name: /create your property/i })).toBeVisible();

		await createPropertyViaForm(page, { name: 'Small VP', width: '50', length: '100' });

		const viewport = page.viewportSize();

		// All key elements should still be within viewport
		const setNorthBtn = page.getByRole('button', { name: /set north/i });
		await expect(setNorthBtn).toBeVisible();
		const btnBox = await setNorthBtn.boundingBox();
		expect(btnBox).not.toBeNull();
		expect(btnBox!.y + btnBox!.height).toBeLessThanOrEqual(viewport!.height);

		// No scrollbar
		const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
		const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);
		expect(scrollHeight).toBeLessThanOrEqual(clientHeight);
	});
});
