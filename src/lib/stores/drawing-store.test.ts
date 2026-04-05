/**
 * Story 1.5: Polygon Drawing Tool
 *
 * Traceability:
 * AC#1 (FR13) -> 'start sets mode to placing', 'placePoint adds a point to the store'
 * AC#2 (FR13) -> 'placePoint accumulates points sequentially'
 * AC#3 (FR21) -> 'close transitions to complete mode'
 * AC#4 (FR4)  -> 'updatePreview updates preview position'
 * AC#5 (FR4)  -> 'finalize commits PolygonDrawn event to IndexedDB and resets state', 'finalize returns the committed event'
 * Edge cases  -> 'cancel resets store to idle', 'isActive is true when mode is placing', 'isActive is false when mode is idle'
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../data/db.js';
import { _reset } from './materialized-state.svelte.js';
import { initialize } from './materialized-state.svelte.js';
import { createDrawingStore } from './drawing-store.svelte.js';

describe('Story 1.5 AC#1: drawing store start and placePoint (FR13)', () => {
	let store: ReturnType<typeof createDrawingStore>;

	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
		store = createDrawingStore();
	});

	it('initial state is idle with no points (AC#1, FR13)', () => {
		expect(store.mode).toBe('idle');
		expect(store.points).toEqual([]);
		expect(store.previewPosition).toBeUndefined();
		expect(store.isActive).toBe(false);
	});

	it('start sets mode to placing (AC#1, FR13)', () => {
		store.start();
		expect(store.mode).toBe('placing');
		expect(store.isActive).toBe(true);
	});

	it('placePoint adds a point to the store (AC#1, FR13)', () => {
		store.start();
		store.placePoint({ x: 100, y: 200 });

		expect(store.points).toHaveLength(1);
		expect(store.points[0]).toEqual({ x: 100, y: 200 });
	});
});

describe('Story 1.5 AC#2: multiple point placement (FR13)', () => {
	let store: ReturnType<typeof createDrawingStore>;

	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
		store = createDrawingStore();
	});

	it('placePoint accumulates points sequentially (AC#2, FR13)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.placePoint({ x: 100, y: 100 });

		expect(store.points).toHaveLength(3);
		expect(store.points[0]).toEqual({ x: 0, y: 0 });
		expect(store.points[1]).toEqual({ x: 100, y: 0 });
		expect(store.points[2]).toEqual({ x: 100, y: 100 });
	});
});

describe('Story 1.5 AC#3: close polygon (FR21)', () => {
	let store: ReturnType<typeof createDrawingStore>;

	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
		store = createDrawingStore();
	});

	it('close transitions to complete mode (AC#3, FR21)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.placePoint({ x: 100, y: 100 });
		store.close();

		expect(store.mode).toBe('complete');
	});
});

describe('Story 1.5 AC#4: preview position (FR4)', () => {
	let store: ReturnType<typeof createDrawingStore>;

	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
		store = createDrawingStore();
	});

	it('updatePreview updates preview position (AC#4, FR4)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.updatePreview({ x: 50, y: 75 });

		expect(store.previewPosition).toEqual({ x: 50, y: 75 });
	});
});

describe('Story 1.5 AC#5: finalize commits event (FR4)', () => {
	let store: ReturnType<typeof createDrawingStore>;

	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
		await initialize();
		store = createDrawingStore();
	});

	it('finalize commits PolygonDrawn event to IndexedDB and resets state (AC#5, FR4)', async () => {
		const entityId = crypto.randomUUID();

		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.placePoint({ x: 100, y: 100 });
		store.close();

		await store.finalize(entityId, 'property');

		// State should be reset after finalize
		expect(store.mode).toBe('idle');
		expect(store.points).toEqual([]);

		// Event should be persisted
		const events = await db.events.where('entityId').equals(entityId).toArray();
		expect(events).toHaveLength(1);
		expect(events[0].type).toBe('PolygonDrawn');
	});

	it('finalize returns the committed event (AC#5, FR4)', async () => {
		const entityId = crypto.randomUUID();

		store.start();
		store.placePoint({ x: 10, y: 20 });
		store.placePoint({ x: 30, y: 40 });
		store.placePoint({ x: 50, y: 60 });
		store.close();

		const event = await store.finalize(entityId, 'property');

		expect(event.type).toBe('PolygonDrawn');
		expect(event.entityId).toBe(entityId);
		expect(event.payload.points).toEqual([
			{ x: 10, y: 20 },
			{ x: 30, y: 40 },
			{ x: 50, y: 60 }
		]);
	});
});

describe('Story 1.5 Edge cases: drawing store', () => {
	let store: ReturnType<typeof createDrawingStore>;

	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
		store = createDrawingStore();
	});

	it('cancel resets store to idle (FR13)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.cancel();

		expect(store.mode).toBe('idle');
		expect(store.points).toEqual([]);
		expect(store.isActive).toBe(false);
	});

	it('isActive is true when mode is placing (FR13)', () => {
		store.start();
		expect(store.isActive).toBe(true);
	});

	it('isActive is false when mode is idle (FR13)', () => {
		expect(store.isActive).toBe(false);
	});

	it('isActive is false when mode is complete (FR13)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.placePoint({ x: 100, y: 100 });
		store.close();

		// complete mode means drawing is done, not actively placing
		expect(store.isActive).toBe(false);
	});
});
