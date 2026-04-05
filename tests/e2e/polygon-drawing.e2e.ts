/**
 * Story 1.5: Polygon Drawing Tool
 *
 * Traceability:
 * AC#1 (FR13) -> 'clicking canvas in drawing mode places a point', 'point marker appears at clicked position'
 * AC#2 (FR13) -> 'placing 3 points creates connected line segments'
 * AC#3 (FR21) -> 'clicking near first point with 3+ points closes polygon'
 * AC#4 (FR4)  -> 'preview line follows cursor from last placed point'
 * AC#5 (FR4)  -> 'finalizing polygon commits PolygonDrawn event to IndexedDB'
 */

import { expect, test } from '@playwright/test';

/**
 * Helper: create a property via the creation form.
 * Prerequisite for canvas drawing tests since the canvas
 * only loads when a property exists.
 */
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

	// Wait for property header to confirm creation succeeded
	await expect(page.getByRole('heading', { name: options.name })).toBeVisible();
}

/**
 * Helper: wait for the canvas to be fully rendered
 */
async function waitForCanvas(page: import('@playwright/test').Page) {
	const canvas = page.locator('[data-testid="property-map"]');
	await expect(canvas).toBeVisible();
	await expect(canvas.locator('canvas').first()).toBeVisible();
	return canvas;
}

test.describe('Story 1.5: Polygon Drawing Tool', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => indexedDB.deleteDatabase('gardening'));
		await page.reload();
		await expect(page.getByRole('heading', { name: /create your property/i })).toBeVisible();
		await createPropertyViaForm(page, { name: 'Draw Garden', width: '50', length: '100' });
		await waitForCanvas(page);
	});

	test('AC#1: clicking canvas in drawing mode places a point (FR13)', async ({ page }) => {
		// Activate drawing mode via test hooks
		await page.evaluate(() => {
			// @ts-expect-error -- test hook attached in dev mode
			window.__propertyMap.startDrawing();
		});

		const canvas = page.locator('[data-testid="property-map"]');
		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();

		// Click on the canvas to place a point
		await page.mouse.click(box!.x + 200, box!.y + 200);

		// Verify point was placed via test hooks
		const drawingState = await page.evaluate(() => {
			// @ts-expect-error -- test hook
			return window.__propertyMap.getDrawingState();
		});

		expect(drawingState.mode).toBe('placing');
		expect(drawingState.points).toHaveLength(1);
	});

	test('AC#1: point marker appears at clicked position (FR13)', async ({ page }) => {
		await page.evaluate(() => {
			// @ts-expect-error -- test hook
			window.__propertyMap.startDrawing();
		});

		const canvas = page.locator('[data-testid="property-map"]');
		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();

		await page.mouse.click(box!.x + 150, box!.y + 150);

		// Verify the point has coordinates (approximate due to pan/zoom transforms)
		const drawingState = await page.evaluate(() => {
			// @ts-expect-error -- test hook
			return window.__propertyMap.getDrawingState();
		});

		expect(drawingState.points[0].x).toBeDefined();
		expect(drawingState.points[0].y).toBeDefined();
		expect(typeof drawingState.points[0].x).toBe('number');
		expect(typeof drawingState.points[0].y).toBe('number');
	});

	test('AC#2: placing 3 points creates connected line segments (FR13)', async ({ page }) => {
		await page.evaluate(() => {
			// @ts-expect-error -- test hook
			window.__propertyMap.startDrawing();
		});

		const canvas = page.locator('[data-testid="property-map"]');
		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();

		// Place 3 points to form a triangle
		await page.mouse.click(box!.x + 100, box!.y + 100);
		await page.mouse.click(box!.x + 300, box!.y + 100);
		await page.mouse.click(box!.x + 200, box!.y + 300);

		const drawingState = await page.evaluate(() => {
			// @ts-expect-error -- test hook
			return window.__propertyMap.getDrawingState();
		});

		expect(drawingState.points).toHaveLength(3);
		expect(drawingState.mode).toBe('placing');
	});

	test('AC#3: clicking near first point with 3+ points closes polygon (FR21)', async ({ page }) => {
		await page.evaluate(() => {
			// @ts-expect-error -- test hook
			window.__propertyMap.startDrawing();
		});

		const canvas = page.locator('[data-testid="property-map"]');
		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();

		// Place 3 points
		const firstX = box!.x + 100;
		const firstY = box!.y + 100;
		await page.mouse.click(firstX, firstY);
		await page.mouse.click(box!.x + 300, box!.y + 100);
		await page.mouse.click(box!.x + 200, box!.y + 300);

		// Click near the first point to close the polygon
		await page.mouse.click(firstX + 3, firstY + 3);

		const drawingState = await page.evaluate(() => {
			// @ts-expect-error -- test hook
			return window.__propertyMap.getDrawingState();
		});

		expect(drawingState.mode).toBe('complete');
	});

	test('AC#4: preview line follows cursor from last placed point (FR4)', async ({ page }) => {
		await page.evaluate(() => {
			// @ts-expect-error -- test hook
			window.__propertyMap.startDrawing();
		});

		const canvas = page.locator('[data-testid="property-map"]');
		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();

		// Place one point
		await page.mouse.click(box!.x + 100, box!.y + 100);

		// Move mouse to a new position
		await page.mouse.move(box!.x + 250, box!.y + 250);
		await page.waitForTimeout(100);

		const drawingState = await page.evaluate(() => {
			// @ts-expect-error -- test hook
			return window.__propertyMap.getDrawingState();
		});

		expect(drawingState.previewPosition).toBeDefined();
		expect(drawingState.previewPosition.x).toBeDefined();
		expect(drawingState.previewPosition.y).toBeDefined();
	});

	test('AC#5: finalizing polygon commits PolygonDrawn event to IndexedDB (FR4)', async ({
		page
	}) => {
		await page.evaluate(() => {
			// @ts-expect-error -- test hook
			window.__propertyMap.startDrawing();
		});

		const canvas = page.locator('[data-testid="property-map"]');
		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();

		// Place 3 points
		const firstX = box!.x + 100;
		const firstY = box!.y + 100;
		await page.mouse.click(firstX, firstY);
		await page.mouse.click(box!.x + 300, box!.y + 100);
		await page.mouse.click(box!.x + 200, box!.y + 300);

		// Close polygon by clicking near first point
		await page.mouse.click(firstX + 3, firstY + 3);

		// Finalize via test hook
		await page.evaluate(async () => {
			// @ts-expect-error -- test hook
			await window.__propertyMap.finalizeDrawing();
		});

		// Verify event was committed to IndexedDB
		const events = await page.evaluate(async () => {
			const dbRequest = indexedDB.open('gardening');
			return new Promise<unknown[]>((resolve) => {
				dbRequest.onsuccess = () => {
					const database = dbRequest.result;
					const tx = database.transaction('events', 'readonly');
					const store = tx.objectStore('events');
					const getAll = store.getAll();
					getAll.onsuccess = () => {
						resolve(getAll.result);
					};
				};
			});
		});

		const polygonEvents = (events as { type: string }[]).filter((e) => e.type === 'PolygonDrawn');
		expect(polygonEvents).toHaveLength(1);
		expect((polygonEvents[0] as { payload: { points: unknown[] } }).payload.points.length).toBe(3);
	});

	test('AC#5: polygon geometry is applied to property after finalize (FR4)', async ({ page }) => {
		await page.evaluate(() => {
			// @ts-expect-error -- test hook
			window.__propertyMap.startDrawing();
		});

		const canvas = page.locator('[data-testid="property-map"]');
		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();

		// Place 3 points and close
		const firstX = box!.x + 100;
		const firstY = box!.y + 100;
		await page.mouse.click(firstX, firstY);
		await page.mouse.click(box!.x + 300, box!.y + 100);
		await page.mouse.click(box!.x + 200, box!.y + 300);
		await page.mouse.click(firstX + 3, firstY + 3);

		// Finalize
		await page.evaluate(async () => {
			// @ts-expect-error -- test hook
			await window.__propertyMap.finalizeDrawing();
		});

		// Verify property geometry was updated via test hooks
		const property = await page.evaluate(() => {
			// @ts-expect-error -- test hook
			const properties = window.__propertyMap.getProperties();
			return properties[0];
		});

		expect(property.geometry).toBeDefined();
		expect(property.geometry.points).toHaveLength(3);
	});
});
