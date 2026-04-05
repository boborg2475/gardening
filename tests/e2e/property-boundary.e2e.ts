/**
 * Story 1.7: Property Boundary Drawing on Grid — E2E Tests
 *
 * Traceability:
 * AC#1 (FR4) → 'Draw Boundary button is visible on property page',
 *               'clicking Draw Boundary activates drawing mode'
 * AC#2 (FR4) → 'draw polygon, finalize as boundary, verify PropertyBoundarySet in IndexedDB'
 * AC#3 (FR4) → 'after boundary finalized, boundary polygon rendered on canvas'
 * AC#4 (FR6) → 'north orientation control accepts value and persists NorthOrientationSet',
 *               'skipping north orientation leaves it undefined'
 * AC#5 (FR6) → 'north indicator visible on canvas when orientation is set'
 * AC#6 (FR4, FR6) → 'reload page, boundary and orientation persist'
 */

import { expect, test } from '@playwright/test';

/**
 * Helper: create a property via the creation form.
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

/**
 * Helper: draw a triangle polygon on the canvas and close it
 */
async function drawAndCloseTriangle(page: import('@playwright/test').Page) {
	await page.evaluate(() => {
		// @ts-expect-error -- test hook attached in dev mode
		window.__propertyMap.startDrawing();
	});

	const canvas = page.locator('[data-testid="property-map"]');
	const box = await canvas.boundingBox();
	expect(box).not.toBeNull();

	const firstX = box!.x + 100;
	const firstY = box!.y + 100;
	await page.mouse.click(firstX, firstY);
	await page.mouse.click(box!.x + 300, box!.y + 100);
	await page.mouse.click(box!.x + 200, box!.y + 300);

	// Close polygon by clicking near first point
	await page.mouse.click(firstX + 3, firstY + 3);

	const drawingState = await page.evaluate(() => {
		// @ts-expect-error -- test hook
		return window.__propertyMap.getDrawingState();
	});
	expect(drawingState.mode).toBe('complete');
}

/**
 * Helper: read all events from IndexedDB
 */
async function getAllEventsFromDB(page: import('@playwright/test').Page) {
	return page.evaluate(async () => {
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
}

test.describe('Story 1.7: Property Boundary Drawing on Grid', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => indexedDB.deleteDatabase('gardening'));
		await page.reload();
		await expect(page.getByRole('heading', { name: /create your property/i })).toBeVisible();
		await createPropertyViaForm(page, { name: 'Boundary Garden', width: '50', length: '100' });
		await waitForCanvas(page);
	});

	test('AC#1: Draw Boundary button is visible on property page (FR4)', async ({ page }) => {
		const drawBoundaryButton = page.getByRole('button', { name: /draw boundary/i });
		await expect(drawBoundaryButton).toBeVisible();
	});

	test('AC#1: clicking Draw Boundary activates drawing mode (FR4)', async ({ page }) => {
		const drawBoundaryButton = page.getByRole('button', { name: /draw boundary/i });
		await drawBoundaryButton.click();

		const drawingState = await page.evaluate(() => {
			// @ts-expect-error -- test hook
			return window.__propertyMap.getDrawingState();
		});

		expect(drawingState.mode).toBe('placing');
	});

	test('AC#2: draw polygon, finalize as boundary, verify PropertyBoundarySet in IndexedDB (FR4)', async ({
		page
	}) => {
		await drawAndCloseTriangle(page);

		// Finalize as boundary via test hook
		await page.evaluate(async () => {
			// @ts-expect-error -- test hook
			await window.__propertyMap.finalizeAsBoundary();
		});

		const events = await getAllEventsFromDB(page);
		const boundaryEvents = (events as { type: string }[]).filter(
			(e) => e.type === 'PropertyBoundarySet'
		);
		expect(boundaryEvents).toHaveLength(1);
		expect(
			(boundaryEvents[0] as { payload: { points: unknown[] } }).payload.points.length
		).toBeGreaterThanOrEqual(3);
	});

	test('AC#3: after boundary finalized, boundary polygon rendered on canvas (FR4)', async ({
		page
	}) => {
		await drawAndCloseTriangle(page);

		await page.evaluate(async () => {
			// @ts-expect-error -- test hook
			await window.__propertyMap.finalizeAsBoundary();
		});

		// Verify boundary is rendered via test hooks
		const boundaryState = await page.evaluate(() => {
			// @ts-expect-error -- test hook
			return window.__propertyMap.getBoundaryState();
		});

		expect(boundaryState).toBeDefined();
		expect(boundaryState.rendered).toBe(true);
		expect(boundaryState.points.length).toBeGreaterThanOrEqual(3);
	});

	test('AC#4: north orientation control accepts value and persists NorthOrientationSet (FR6)', async ({
		page
	}) => {
		// Set north orientation via UI control
		const northInput = page.getByLabel(/north orientation/i);
		await expect(northInput).toBeVisible();
		await northInput.fill('45');
		await page.getByRole('button', { name: /set north/i }).click();

		const events = await getAllEventsFromDB(page);
		const orientationEvents = (events as { type: string }[]).filter(
			(e) => e.type === 'NorthOrientationSet'
		);
		expect(orientationEvents).toHaveLength(1);
		expect((orientationEvents[0] as { payload: { degrees: number } }).payload.degrees).toBe(45);
	});

	test('AC#4: skipping north orientation leaves it undefined (FR6)', async ({ page }) => {
		// Do NOT set north orientation — verify property has no northOrientation
		const property = await page.evaluate(() => {
			// @ts-expect-error -- test hook
			const properties = window.__propertyMap.getProperties();
			return properties[0];
		});

		expect(property.northOrientation).toBeUndefined();
	});

	test('AC#5: north indicator visible on canvas when orientation is set (FR6)', async ({
		page
	}) => {
		// Set north orientation
		const northInput = page.getByLabel(/north orientation/i);
		await northInput.fill('90');
		await page.getByRole('button', { name: /set north/i }).click();

		// Verify north indicator is rendered via test hooks
		const northIndicator = await page.evaluate(() => {
			// @ts-expect-error -- test hook
			return window.__propertyMap.getNorthIndicatorState();
		});

		expect(northIndicator).toBeDefined();
		expect(northIndicator.visible).toBe(true);
		expect(northIndicator.degrees).toBe(90);
	});

	test('AC#6: reload page, boundary and orientation persist (FR4, FR6)', async ({ page }) => {
		// Draw and finalize boundary
		await drawAndCloseTriangle(page);
		await page.evaluate(async () => {
			// @ts-expect-error -- test hook
			await window.__propertyMap.finalizeAsBoundary();
		});

		// Set north orientation
		const northInput = page.getByLabel(/north orientation/i);
		await northInput.fill('270');
		await page.getByRole('button', { name: /set north/i }).click();

		// Reload the page
		await page.reload();
		await waitForCanvas(page);

		// Verify boundary persisted
		const property = await page.evaluate(() => {
			// @ts-expect-error -- test hook
			const properties = window.__propertyMap.getProperties();
			return properties[0];
		});

		expect(property.geometry).toBeDefined();
		expect(property.geometry.points.length).toBeGreaterThanOrEqual(3);
		expect(property.northOrientation).toBe(270);

		// Verify boundary is rendered
		const boundaryState = await page.evaluate(() => {
			// @ts-expect-error -- test hook
			return window.__propertyMap.getBoundaryState();
		});
		expect(boundaryState.rendered).toBe(true);

		// Verify north indicator is rendered
		const northIndicator = await page.evaluate(() => {
			// @ts-expect-error -- test hook
			return window.__propertyMap.getNorthIndicatorState();
		});
		expect(northIndicator.visible).toBe(true);
		expect(northIndicator.degrees).toBe(270);
	});
});
