/**
 * Story 2.1: Network Boundary Module & Tile Provider — Tile Cache
 *
 * Traceability:
 * AC#3 (FR3) → cacheTile, getCachedTile — tiles cached in IndexedDB
 * AC#4 (FR3) → hasCachedTile — cached tiles served without network
 *
 * TDD Phase: RED — tests will fail until tile-cache.ts is implemented
 * Remove describe.skip() and uncomment imports when src/lib/network/tile-cache.ts exists
 */

import 'fake-indexeddb/auto';

import { describe, expect, it } from 'vitest';

// TODO: uncomment when tile-cache.ts is implemented
// import { cacheTile, getCachedTile, hasCachedTile, clearTileCache, getCacheStats } from './tile-cache.js';

describe.skip('Story 2.1 AC#3: Tile caching in IndexedDB', () => {
	it('stores a tile in the cache and retrieves it (AC#3)', async () => {
		const { cacheTile, getCachedTile } = require('./tile-cache.js');
		const coord = { x: 38599, y: 49283, z: 17 };
		const tileBlob = new Blob(['fake-tile-data'], { type: 'image/png' });

		await cacheTile(coord, tileBlob);
		const cached = await getCachedTile(coord);

		expect(cached).toBeDefined();
		expect(cached).toBeInstanceOf(Blob);
	});

	it('returns undefined for a tile not in cache (AC#3)', async () => {
		const { getCachedTile } = require('./tile-cache.js');
		const coord = { x: 99999, y: 99999, z: 17 };

		const cached = await getCachedTile(coord);
		expect(cached).toBeUndefined();
	});

	it('hasCachedTile returns true for cached tiles (AC#4)', async () => {
		const { cacheTile, hasCachedTile } = require('./tile-cache.js');
		const coord = { x: 100, y: 200, z: 16 };
		const tileBlob = new Blob(['tile-data'], { type: 'image/png' });

		await cacheTile(coord, tileBlob);
		const exists = await hasCachedTile(coord);

		expect(exists).toBe(true);
	});

	it('hasCachedTile returns false for missing tiles (AC#4)', async () => {
		const { hasCachedTile } = require('./tile-cache.js');
		const coord = { x: 100, y: 200, z: 16 };

		const exists = await hasCachedTile(coord);
		expect(exists).toBe(false);
	});

	it('clearTileCache removes all cached tiles (AC#3)', async () => {
		const { cacheTile, clearTileCache, getCacheStats } = require('./tile-cache.js');

		await cacheTile({ x: 1, y: 1, z: 10 }, new Blob(['a']));
		await cacheTile({ x: 2, y: 2, z: 10 }, new Blob(['b']));

		await clearTileCache();

		const stats = await getCacheStats();
		expect(stats.count).toBe(0);
	});

	it('getCacheStats returns correct count (AC#3)', async () => {
		const { cacheTile, getCacheStats } = require('./tile-cache.js');

		await cacheTile({ x: 1, y: 1, z: 10 }, new Blob(['a']));
		await cacheTile({ x: 2, y: 2, z: 10 }, new Blob(['b']));
		await cacheTile({ x: 3, y: 3, z: 10 }, new Blob(['c']));

		const stats = await getCacheStats();
		expect(stats.count).toBe(3);
		expect(stats.estimatedSizeBytes).toBeGreaterThan(0);
	});

	it('overwrites existing cache entry for same coordinates (AC#3)', async () => {
		const { cacheTile, getCachedTile } = require('./tile-cache.js');
		const coord = { x: 10, y: 20, z: 15 };

		await cacheTile(coord, new Blob(['old-data']));
		await cacheTile(coord, new Blob(['new-data']));

		const cached = await getCachedTile(coord);
		expect(cached).toBeDefined();
		const text = await cached!.text();
		expect(text).toBe('new-data');
	});
});
