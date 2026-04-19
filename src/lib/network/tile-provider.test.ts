/**
 * Story 2.1: Network Boundary Module & Tile Provider — Tile Provider
 *
 * Traceability:
 * AC#1 (NFR11) → fetch isolation in tile-provider.ts
 * AC#2 (FR3, NFR5) → fetchTile with cache-first strategy, timeout handling
 * AC#5 (NFR16) → checkProviderStatus for graceful degradation
 *
 * TDD Phase: RED — tests will fail until tile-provider.ts is implemented
 * Remove describe.skip() and uncomment imports when src/lib/network/tile-provider.ts exists
 */

import 'fake-indexeddb/auto';

import { describe, expect, it } from 'vitest';

// TODO: uncomment when tile-provider.ts is implemented
// import { fetchTile, checkProviderStatus } from './tile-provider.js';
// import { cacheTile } from './tile-cache.js';

const TEST_CONFIG = {
	urlTemplate: 'https://tiles.example.com/{z}/{x}/{y}.png',
	attribution: '© Test Tiles',
	maxZoom: 19
};

describe.skip('Story 2.1 AC#2: fetchTile with cache-first strategy', () => {
	it('fetches a tile from the provider on cache miss (AC#2)', async () => {
		const { fetchTile } = require('./tile-provider.js');
		const { vi } = await import('vitest');
		const tileBlob = new Blob(['tile-image'], { type: 'image/png' });
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(new Response(tileBlob, { status: 200 }))
		);

		const result = await fetchTile({ x: 100, y: 200, z: 16 }, TEST_CONFIG);

		expect(result.status).toBe('loaded');
		if (result.status === 'loaded') {
			expect(result.data).toBeInstanceOf(Blob);
		}
		vi.restoreAllMocks();
	});

	it('returns cached tile without fetching on cache hit (AC#2, AC#4)', async () => {
		const { cacheTile } = require('./tile-cache.js');
		const { fetchTile } = require('./tile-provider.js');
		const { vi } = await import('vitest');
		const coord = { x: 100, y: 200, z: 16 };
		const cachedBlob = new Blob(['cached-tile'], { type: 'image/png' });
		await cacheTile(coord, cachedBlob);

		const mockFetch = vi.fn();
		vi.stubGlobal('fetch', mockFetch);

		const result = await fetchTile(coord, TEST_CONFIG);

		expect(result.status).toBe('cached');
		expect(mockFetch).not.toHaveBeenCalled();
		vi.restoreAllMocks();
	});

	it('caches tile in IndexedDB after successful fetch (AC#3)', async () => {
		const { fetchTile } = require('./tile-provider.js');
		const { hasCachedTile } = require('./tile-cache.js');
		const { vi } = await import('vitest');
		const coord = { x: 50, y: 75, z: 15 };
		const tileBlob = new Blob(['fetched-tile'], { type: 'image/png' });
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(new Response(tileBlob, { status: 200 }))
		);

		await fetchTile(coord, TEST_CONFIG);

		const cached = await hasCachedTile(coord);
		expect(cached).toBe(true);
		vi.restoreAllMocks();
	});

	it('returns error result on network failure (AC#5)', async () => {
		const { fetchTile } = require('./tile-provider.js');
		const { vi } = await import('vitest');
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

		const result = await fetchTile({ x: 1, y: 1, z: 10 }, TEST_CONFIG);

		expect(result.status).toBe('error');
		if (result.status === 'error') {
			expect(result.message).toBeTruthy();
		}
		vi.restoreAllMocks();
	});

	it('returns error result on HTTP error response (AC#5)', async () => {
		const { fetchTile } = require('./tile-provider.js');
		const { vi } = await import('vitest');
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(new Response('Not Found', { status: 404 }))
		);

		const result = await fetchTile({ x: 1, y: 1, z: 10 }, TEST_CONFIG);

		expect(result.status).toBe('error');
		if (result.status === 'error') {
			expect(result.message).toContain('404');
		}
		vi.restoreAllMocks();
	});

	it('aborts fetch after timeout (AC#2)', async () => {
		const { fetchTile } = require('./tile-provider.js');
		const { vi } = await import('vitest');
		vi.stubGlobal(
			'fetch',
			vi.fn().mockImplementation(
				() =>
					new Promise((_, reject) =>
						setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 10000)
					)
			)
		);

		const result = await fetchTile({ x: 1, y: 1, z: 10 }, TEST_CONFIG, { timeoutMs: 100 });

		expect(result.status).toBe('error');
		if (result.status === 'error') {
			expect(result.message.toLowerCase()).toContain('timeout');
		}
		vi.restoreAllMocks();
	});
});

describe.skip('Story 2.1 AC#5: checkProviderStatus', () => {
	it('returns available when provider responds (AC#5)', async () => {
		const { checkProviderStatus } = require('./tile-provider.js');
		const { vi } = await import('vitest');
		const tileBlob = new Blob(['test-tile'], { type: 'image/png' });
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(new Response(tileBlob, { status: 200 }))
		);

		const status = await checkProviderStatus(TEST_CONFIG);
		expect(status).toBe('available');
		vi.restoreAllMocks();
	});

	it('returns unavailable when provider is down (AC#5)', async () => {
		const { checkProviderStatus } = require('./tile-provider.js');
		const { vi } = await import('vitest');
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

		const status = await checkProviderStatus(TEST_CONFIG);
		expect(status).toBe('unavailable');
		vi.restoreAllMocks();
	});

	it('returns unavailable on HTTP error (AC#5)', async () => {
		const { checkProviderStatus } = require('./tile-provider.js');
		const { vi } = await import('vitest');
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(new Response('Server Error', { status: 500 }))
		);

		const status = await checkProviderStatus(TEST_CONFIG);
		expect(status).toBe('unavailable');
		vi.restoreAllMocks();
	});
});
