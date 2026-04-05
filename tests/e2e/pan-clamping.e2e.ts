/**
 * Tests for pan clamping — verifies the user cannot pan the viewport
 * far away from the property grid area.
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

test.describe('Pan clamping and grid bounds', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => indexedDB.deleteDatabase('gardening'));
		await page.reload();
		await expect(page.getByRole('heading', { name: /create your property/i })).toBeVisible();
	});

	test('pan is clamped — dragging far right stops near property bounds', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Clamp Test', width: '50', length: '100' });

		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();

		const startX = box!.x + box!.width / 2;
		const startY = box!.y + box!.height / 2;

		// Drag very far to the right (2000px) — should be clamped
		await page.mouse.move(startX, startY);
		await page.mouse.down();
		await page.mouse.move(startX + 2000, startY, { steps: 20 });
		await page.mouse.up();
		await page.waitForTimeout(100);

		const pan = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getPanOffset();
		});

		// Property is 50ft × 100ft. At 30px/ft, that's 1500×3000 canvas px.
		// With 50% viewport margin, max pan.x should be well under 2000.
		// The key assertion: the pan was clamped, NOT the full 2000px.
		expect(pan.x).toBeLessThan(2000);
		expect(pan.x).toBeGreaterThan(0); // did move some amount right
	});

	test('pan is clamped — dragging far left stops near property bounds', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Clamp Left', width: '50', length: '100' });

		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();

		const startX = box!.x + box!.width / 2;
		const startY = box!.y + box!.height / 2;

		// Drag very far to the left
		await page.mouse.move(startX, startY);
		await page.mouse.down();
		await page.mouse.move(startX - 3000, startY, { steps: 20 });
		await page.mouse.up();
		await page.waitForTimeout(100);

		const pan = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getPanOffset();
		});

		// Should be clamped — not the full -3000
		expect(pan.x).toBeGreaterThan(-3000);
		expect(pan.x).toBeLessThan(0); // did move left
	});

	test('pan is clamped — dragging far down stops near property bounds', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Clamp Down', width: '50', length: '100' });

		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();

		const startX = box!.x + box!.width / 2;
		const startY = box!.y + box!.height / 2;

		// Drag very far down
		await page.mouse.move(startX, startY);
		await page.mouse.down();
		await page.mouse.move(startX, startY + 5000, { steps: 20 });
		await page.mouse.up();
		await page.waitForTimeout(100);

		const pan = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getPanOffset();
		});

		// Should be clamped — not the full 5000
		expect(pan.y).toBeLessThan(5000);
		expect(pan.y).toBeGreaterThan(0);
	});

	test('repeated drags in same direction converge to clamp limit', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Multi Drag', width: '50', length: '100' });

		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();

		const startX = box!.x + box!.width / 2;
		const startY = box!.y + box!.height / 2;

		// Drag right multiple times to hit the clamp limit
		for (let i = 0; i < 5; i++) {
			await page.mouse.move(startX, startY);
			await page.mouse.down();
			await page.mouse.move(startX + 2000, startY, { steps: 10 });
			await page.mouse.up();
			await page.waitForTimeout(50);
		}

		const panAfterMany = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getPanOffset();
		});

		// One more drag — should not increase further
		await page.mouse.move(startX, startY);
		await page.mouse.down();
		await page.mouse.move(startX + 2000, startY, { steps: 10 });
		await page.mouse.up();
		await page.waitForTimeout(50);

		const panAfterExtra = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getPanOffset();
		});

		// Already at limit — should be the same
		expect(panAfterExtra.x).toBeCloseTo(panAfterMany.x, 0);
	});

	test('zoom + pan respects clamp at different zoom levels', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Zoom Clamp', width: '50', length: '100' });

		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();

		const centerX = box!.x + box!.width / 2;
		const centerY = box!.y + box!.height / 2;

		// Zoom out first
		await page.mouse.move(centerX, centerY);
		await page.mouse.wheel(0, 300);
		await page.waitForTimeout(200);

		// Now drag far right — should still be clamped
		await page.mouse.move(centerX, centerY);
		await page.mouse.down();
		await page.mouse.move(centerX + 3000, centerY, { steps: 20 });
		await page.mouse.up();
		await page.waitForTimeout(100);

		const pan = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getPanOffset();
		});

		expect(pan.x).toBeLessThan(3000);
	});
});
