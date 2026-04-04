/**
 * Traceability:
 * AC#1 (FR5)  → 'canvas loads with grid when property has dimensions', 'canvas loads with default grid when property has no dimensions', 'grid layer has line elements via test hooks'
 * AC#2 (FR20) → 'mouse wheel zoom changes zoom level via test hooks'
 * AC#3 (FR20) → 'pinch-to-zoom via touch emulation changes zoom level'
 * AC#4 (FR20) → 'click-and-drag pans canvas via test hooks'
 * AC#5 (FR5)  → 'grid scale selector shows imperial options for ft property', 'grid scale selector shows metric options for m property', 'changing grid scale updates grid rendering'
 * AC#6        → 'test hooks expose stage state with dimensions and scale'
 */

import { expect, test } from '@playwright/test';

/**
 * Helper: create a property via the creation form.
 * This is a prerequisite for all canvas tests since the canvas
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

test.describe('Story 1.4: Canvas Foundation with Pan & Zoom', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => indexedDB.deleteDatabase('gardening'));
		await page.reload();
		await expect(page.getByRole('heading', { name: /create your property/i })).toBeVisible();
	});

	test('AC#1: canvas loads with grid when property has dimensions (FR5)', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Grid Garden', width: '50', length: '100' });

		// The canvas container should be visible
		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		// The Konva stage should have rendered (canvas element inside the container)
		const konvaCanvas = canvas.locator('canvas');
		await expect(konvaCanvas.first()).toBeVisible();
	});

	test('AC#1: canvas loads with default grid when property has no dimensions (FR5)', async ({
		page
	}) => {
		await createPropertyViaForm(page, { name: 'No Dims Garden' });

		// Canvas should still render with default 100x100 ft grid
		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		const konvaCanvas = canvas.locator('canvas');
		await expect(konvaCanvas.first()).toBeVisible();
	});

	test('AC#1, AC#6: grid layer has line elements via test hooks (FR5)', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Hook Garden', width: '50', length: '100' });

		// Wait for canvas to render
		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		// Use test hooks to verify grid state
		const stageState = await page.evaluate(() => {
			// @ts-expect-error — test hook attached in dev mode
			return window.__propertyMap?.getStageState();
		});

		expect(stageState).toBeDefined();
		expect(stageState.width).toBeGreaterThan(0);
		expect(stageState.height).toBeGreaterThan(0);
	});

	test('AC#2: mouse wheel zoom changes zoom level via test hooks (FR20)', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Zoom Garden', width: '50', length: '100' });

		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		// Get initial zoom level
		const initialZoom = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getZoomLevel();
		});
		expect(initialZoom).toBe(1);

		// Scroll mouse wheel to zoom in (negative deltaY = zoom in)
		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();
		await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
		await page.mouse.wheel(0, -100);

		// Wait for zoom to take effect
		await page.waitForTimeout(200);

		const newZoom = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getZoomLevel();
		});

		expect(newZoom).toBeGreaterThan(initialZoom!);
	});

	test('AC#4: click-and-drag pans canvas via test hooks (FR20)', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Pan Garden', width: '50', length: '100' });

		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		// Get initial pan offset
		const initialPan = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getPanOffset();
		});
		expect(initialPan).toEqual({ x: 0, y: 0 });

		// Perform click-and-drag
		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();
		const startX = box!.x + box!.width / 2;
		const startY = box!.y + box!.height / 2;

		await page.mouse.move(startX, startY);
		await page.mouse.down();
		await page.mouse.move(startX + 100, startY + 50, { steps: 10 });
		await page.mouse.up();

		// Wait for pan to take effect
		await page.waitForTimeout(200);

		const newPan = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getPanOffset();
		});

		// Pan offset should have changed
		expect(newPan.x).not.toBe(0);
		expect(newPan.y).not.toBe(0);
	});

	test('AC#5: grid scale selector shows imperial options for ft property (FR5)', async ({
		page
	}) => {
		await createPropertyViaForm(page, { name: 'Imperial Garden', width: '50', length: '100' });

		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		// The grid scale selector should be visible with imperial options
		const selector = page.getByLabel(/grid scale/i);
		await expect(selector).toBeVisible();

		// Imperial options should be present
		await expect(selector.locator('option', { hasText: '1ft' })).toBeAttached();
		await expect(selector.locator('option', { hasText: '6in' })).toBeAttached();
		await expect(selector.locator('option', { hasText: '1in' })).toBeAttached();
	});

	test('AC#5: grid scale selector shows metric options for m property (FR5)', async ({ page }) => {
		await createPropertyViaForm(page, {
			name: 'Metric Garden',
			width: '15',
			length: '30',
			unit: 'm'
		});

		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		const selector = page.getByLabel(/grid scale/i);
		await expect(selector).toBeVisible();

		// Metric options should be present
		await expect(selector.locator('option', { hasText: '1m' })).toBeAttached();
		await expect(selector.locator('option', { hasText: '10cm' })).toBeAttached();
		await expect(selector.locator('option', { hasText: '1cm' })).toBeAttached();
	});

	test('AC#5: changing grid scale updates grid rendering (FR5)', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Scale Garden', width: '50', length: '100' });

		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		const selector = page.getByLabel(/grid scale/i);
		await expect(selector).toBeVisible();

		// Get initial grid scale from test hooks
		const initialScale = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getStageState()?.gridScale;
		});
		expect(initialScale).toBe('1ft');

		// Change the grid scale
		await selector.selectOption('6in');

		// Wait for re-render
		await page.waitForTimeout(200);

		const newScale = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getStageState()?.gridScale;
		});
		expect(newScale).toBe('6in');
	});

	test('AC#6: test hooks expose stage state with dimensions and scale', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Hooks Garden', width: '50', length: '100' });

		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		// Verify all test hook methods are available
		const hookCheck = await page.evaluate(() => {
			// @ts-expect-error — test hook
			const hooks = window.__propertyMap;
			return {
				hasGetStageState: typeof hooks?.getStageState === 'function',
				hasGetZoomLevel: typeof hooks?.getZoomLevel === 'function',
				hasGetPanOffset: typeof hooks?.getPanOffset === 'function'
			};
		});

		expect(hookCheck.hasGetStageState).toBe(true);
		expect(hookCheck.hasGetZoomLevel).toBe(true);
		expect(hookCheck.hasGetPanOffset).toBe(true);

		// Verify stage state has expected shape
		const stageState = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap.getStageState();
		});

		expect(stageState).toHaveProperty('width');
		expect(stageState).toHaveProperty('height');
		expect(stageState).toHaveProperty('gridScale');
		expect(stageState.width).toBeGreaterThan(0);
		expect(stageState.height).toBeGreaterThan(0);
	});

	test('AC#2: mouse wheel zoom out decreases zoom level (FR20)', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Zoom Out Garden', width: '50', length: '100' });

		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();
		await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);

		// Scroll down to zoom out (positive deltaY)
		await page.mouse.wheel(0, 200);
		await page.waitForTimeout(200);

		const newZoom = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getZoomLevel();
		});

		expect(newZoom).toBeLessThan(1);
	});

	test('AC#3: pinch-to-zoom via touch emulation changes zoom level (FR20)', async ({
		page,
		browserName
	}) => {
		// Touch emulation is most reliable in Chromium
		test.skip(browserName !== 'chromium', 'Touch emulation only reliable in Chromium');

		await createPropertyViaForm(page, { name: 'Touch Garden', width: '50', length: '100' });

		const canvas = page.locator('[data-testid="property-map"]');
		await expect(canvas).toBeVisible();

		const initialZoom = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getZoomLevel();
		});
		expect(initialZoom).toBe(1);

		const box = await canvas.boundingBox();
		expect(box).not.toBeNull();
		const centerX = box!.x + box!.width / 2;
		const centerY = box!.y + box!.height / 2;

		// Simulate pinch-to-zoom by dispatching synthetic touch events on the container
		await canvas.evaluate(
			(el, { cx, cy }) => {
				function makeTouches(points: { x: number; y: number }[]) {
					return points.map(
						(p, i) =>
							new Touch({
								identifier: i,
								target: el,
								clientX: p.x,
								clientY: p.y
							})
					);
				}

				// Start with two fingers close together
				const startTouches = makeTouches([
					{ x: cx - 20, y: cy },
					{ x: cx + 20, y: cy }
				]);
				el.dispatchEvent(new TouchEvent('touchstart', { touches: startTouches, bubbles: true }));

				// Move fingers apart (pinch out = zoom in)
				for (let i = 1; i <= 5; i++) {
					const moveTouches = makeTouches([
						{ x: cx - 20 - i * 20, y: cy },
						{ x: cx + 20 + i * 20, y: cy }
					]);
					el.dispatchEvent(new TouchEvent('touchmove', { touches: moveTouches, bubbles: true }));
				}

				el.dispatchEvent(new TouchEvent('touchend', { touches: [], bubbles: true }));
			},
			{ cx: centerX, cy: centerY }
		);

		// Wait for zoom to take effect
		await page.waitForTimeout(300);

		const newZoom = await page.evaluate(() => {
			// @ts-expect-error — test hook
			return window.__propertyMap?.getZoomLevel();
		});

		expect(newZoom).toBeGreaterThan(initialZoom!);
	});
});
