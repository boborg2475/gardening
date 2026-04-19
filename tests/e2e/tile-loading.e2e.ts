/**
 * Story 2.1: Network Boundary Module & Tile Provider (E2E)
 *
 * Traceability:
 * AC#1 (NFR11) → network boundary enforcement — fetch only in src/lib/network/
 * AC#2 (FR3, NFR5) → 'loads satellite tiles for valid coordinates', 'tile loading completes within 3s' — tiles load from provider
 * AC#3 (FR3) → 'caches loaded tiles in IndexedDB' — tiles cached after fetch
 * AC#4 (FR3) → 'serves cached tiles without network requests' — offline tile serving
 * AC#5 (NFR16) → 'shows unavailable message when provider is down', 'Use Manual Grid navigates to grid setup', 'Retry re-checks provider' — graceful degradation
 *
 * TDD Phase: RED — all tests use test.skip() and will fail until implementation is complete
 */

import { expect, test } from '@playwright/test';

test.describe('Story 2.1: Tile Loading & Caching', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => indexedDB.deleteDatabase('gardening'));
		await page.reload();
	});

	test.skip('[P0] loads satellite tiles for valid coordinates (AC#2, NFR5)', async ({ page }) => {
		// Setup: create a property first so satellite view is available
		await page.getByLabel(/property name/i).fill('Tile Test Property');
		await page.getByRole('button', { name: /create property/i }).click();
		await expect(page.getByRole('heading', { name: 'Tile Test Property' })).toBeVisible();

		// Navigate to satellite setup mode
		await page.getByRole('button', { name: /satellite/i }).click();

		// Mock tile server — intercept tile requests and return a test tile image
		await page.route('**/tile/**', async (route) => {
			const png1x1 = Buffer.from(
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
				'base64'
			);
			await route.fulfill({ contentType: 'image/png', body: png1x1 });
		});

		// Enter coordinates or address
		await page.getByLabel(/address|coordinates|location/i).fill('40.7128,-74.0060');
		await page.getByRole('button', { name: /load|search|go/i }).click();

		// Expect satellite tiles to be visible on the canvas
		await expect(page.locator('[data-testid="satellite-tile-layer"]')).toBeVisible();
	});

	test.skip('[P1] tile loading completes within 3s performance budget (AC#2, NFR5)', async ({
		page
	}) => {
		await page.getByLabel(/property name/i).fill('Perf Test Property');
		await page.getByRole('button', { name: /create property/i }).click();

		await page.getByRole('button', { name: /satellite/i }).click();

		// Mock tile server with slight delay
		await page.route('**/tile/**', async (route) => {
			const png1x1 = Buffer.from(
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
				'base64'
			);
			await route.fulfill({ contentType: 'image/png', body: png1x1 });
		});

		await page.getByLabel(/address|coordinates|location/i).fill('40.7128,-74.0060');

		const startTime = Date.now();
		await page.getByRole('button', { name: /load|search|go/i }).click();
		await expect(page.locator('[data-testid="satellite-tile-layer"]')).toBeVisible();
		const elapsed = Date.now() - startTime;

		expect(elapsed).toBeLessThan(3000);
	});

	test.skip('[P0] caches loaded tiles in IndexedDB (AC#3)', async ({ page }) => {
		await page.getByLabel(/property name/i).fill('Cache Test Property');
		await page.getByRole('button', { name: /create property/i }).click();

		await page.getByRole('button', { name: /satellite/i }).click();

		await page.route('**/tile/**', async (route) => {
			const png1x1 = Buffer.from(
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
				'base64'
			);
			await route.fulfill({ contentType: 'image/png', body: png1x1 });
		});

		await page.getByLabel(/address|coordinates|location/i).fill('40.7128,-74.0060');
		await page.getByRole('button', { name: /load|search|go/i }).click();
		await expect(page.locator('[data-testid="satellite-tile-layer"]')).toBeVisible();

		// Verify tiles were cached in IndexedDB
		const cachedTileCount = await page.evaluate(async () => {
			return new Promise<number>((resolve) => {
				const request = indexedDB.open('gardening');
				request.onsuccess = () => {
					const db = request.result;
					if (!db.objectStoreNames.contains('tilecache')) {
						resolve(0);
						return;
					}
					const tx = db.transaction('tilecache', 'readonly');
					const store = tx.objectStore('tilecache');
					const count = store.count();
					count.onsuccess = () => resolve(count.result);
				};
			});
		});

		expect(cachedTileCount).toBeGreaterThan(0);
	});

	test.skip('[P0] serves cached tiles without network requests on second load (AC#4)', async ({
		page
	}) => {
		await page.getByLabel(/property name/i).fill('Offline Test Property');
		await page.getByRole('button', { name: /create property/i }).click();

		await page.getByRole('button', { name: /satellite/i }).click();

		let fetchCount = 0;
		await page.route('**/tile/**', async (route) => {
			fetchCount++;
			const png1x1 = Buffer.from(
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
				'base64'
			);
			await route.fulfill({ contentType: 'image/png', body: png1x1 });
		});

		// First load — tiles fetched from network
		await page.getByLabel(/address|coordinates|location/i).fill('40.7128,-74.0060');
		await page.getByRole('button', { name: /load|search|go/i }).click();
		await expect(page.locator('[data-testid="satellite-tile-layer"]')).toBeVisible();

		const firstLoadFetchCount = fetchCount;
		expect(firstLoadFetchCount).toBeGreaterThan(0);

		// Reset counter and reload — tiles should come from cache
		fetchCount = 0;
		await page.reload();

		// Re-route after reload
		await page.route('**/tile/**', async (route) => {
			fetchCount++;
			const png1x1 = Buffer.from(
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
				'base64'
			);
			await route.fulfill({ contentType: 'image/png', body: png1x1 });
		});

		// Navigate back to satellite view — should use cached tiles
		await page.getByRole('button', { name: /satellite/i }).click();
		await expect(page.locator('[data-testid="satellite-tile-layer"]')).toBeVisible();

		// No new network requests should have been made for tiles
		expect(fetchCount).toBe(0);
	});
});

test.describe('Story 2.1: Network Unavailable Fallback', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => indexedDB.deleteDatabase('gardening'));
		await page.reload();
	});

	test.skip('[P0] shows unavailable message when tile provider is down (AC#5, NFR16)', async ({
		page
	}) => {
		await page.getByLabel(/property name/i).fill('Fallback Test Property');
		await page.getByRole('button', { name: /create property/i }).click();

		// Attempt satellite setup with failing network
		await page.route('**/tile/**', (route) => route.abort('connectionrefused'));

		await page.getByRole('button', { name: /satellite/i }).click();
		await page.getByLabel(/address|coordinates|location/i).fill('40.7128,-74.0060');
		await page.getByRole('button', { name: /load|search|go/i }).click();

		// Expect clear unavailable message
		await expect(
			page.getByText(/satellite view is currently unavailable/i)
		).toBeVisible();
	});

	test.skip('[P1] Use Manual Grid button navigates to grid-based setup (AC#5, NFR16)', async ({
		page
	}) => {
		await page.getByLabel(/property name/i).fill('Grid Fallback Property');
		await page.getByRole('button', { name: /create property/i }).click();

		await page.route('**/tile/**', (route) => route.abort('connectionrefused'));

		await page.getByRole('button', { name: /satellite/i }).click();
		await page.getByLabel(/address|coordinates|location/i).fill('40.7128,-74.0060');
		await page.getByRole('button', { name: /load|search|go/i }).click();

		await expect(
			page.getByText(/satellite view is currently unavailable/i)
		).toBeVisible();

		// Click manual grid fallback button
		await page.getByRole('button', { name: /use manual grid/i }).click();

		// Should navigate to grid-based property drawing (from Story 1.7)
		await expect(page.locator('[data-testid="grid-canvas"]')).toBeVisible();
	});

	test.skip('[P2] Retry button re-checks provider status (AC#5, NFR16)', async ({ page }) => {
		await page.getByLabel(/property name/i).fill('Retry Test Property');
		await page.getByRole('button', { name: /create property/i }).click();

		// First attempt: provider down
		await page.route('**/tile/**', (route) => route.abort('connectionrefused'));

		await page.getByRole('button', { name: /satellite/i }).click();
		await page.getByLabel(/address|coordinates|location/i).fill('40.7128,-74.0060');
		await page.getByRole('button', { name: /load|search|go/i }).click();

		await expect(
			page.getByText(/satellite view is currently unavailable/i)
		).toBeVisible();

		// Now make the provider available
		await page.unroute('**/tile/**');
		await page.route('**/tile/**', async (route) => {
			const png1x1 = Buffer.from(
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
				'base64'
			);
			await route.fulfill({ contentType: 'image/png', body: png1x1 });
		});

		// Click retry
		await page.getByRole('button', { name: /retry/i }).click();

		// Unavailable message should disappear and tiles should load
		await expect(
			page.getByText(/satellite view is currently unavailable/i)
		).not.toBeVisible();
		await expect(page.locator('[data-testid="satellite-tile-layer"]')).toBeVisible();
	});
});
