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
 *
 * Story 1.6: Drawing Precision Tools
 *
 * Traceability:
 * AC#1 (FR14) -> 'toggleSegmentCurve toggles segment type via store', 'segments array is exposed on store'
 * AC#6 (FR19) -> 'enterConfirmation transitions store to confirming', 'confirmPolygon copies confirmation data back', 'cancelConfirmation restores original data', 'isConfirming reflects confirming mode', 'confirmationPoints exposed on store', 'confirmationSegments exposed on store'
 * AC#7 (FR19) -> 'adjustConfirmationPoint updates point via store'
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

// ──────────────────────────────────────────────────────────────
// Story 1.6: Drawing Precision Tools — Drawing Store Extensions
// ──────────────────────────────────────────────────────────────

describe('Story 1.6 AC#1: segments on drawing store (FR14)', () => {
	let store: ReturnType<typeof createDrawingStore>;

	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
		store = createDrawingStore();
	});

	it('segments array is exposed on store (AC#1, FR14)', () => {
		expect(store.segments).toBeDefined();
		expect(store.segments).toEqual([]);
	});

	it('segments populate as points are placed (AC#1, FR14)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		expect(store.segments).toHaveLength(0);

		store.placePoint({ x: 100, y: 0 });
		expect(store.segments).toHaveLength(1);
		expect(store.segments[0]).toEqual({ type: 'line' });
	});

	it('toggleSegmentCurve toggles segment type via store (AC#1, FR14)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.placePoint({ x: 100, y: 100 });
		store.close();

		store.toggleSegmentCurve(0);
		expect(store.segments[0].type).toBe('curve');
		expect(store.segments[0].controlPoint).toEqual({ x: 50, y: 0 });
	});

	it('updateCurveControl updates curve control point via store (AC#2, FR15)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.placePoint({ x: 100, y: 100 });
		store.close();

		store.toggleSegmentCurve(0);
		store.updateCurveControl(0, { x: 30, y: -20 });
		expect(store.segments[0].controlPoint).toEqual({ x: 30, y: -20 });
	});
});

describe('Story 1.6 AC#6: two-stage confirmation on drawing store (FR19)', () => {
	let store: ReturnType<typeof createDrawingStore>;

	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
		store = createDrawingStore();
	});

	it('isConfirming is false initially (AC#6, FR19)', () => {
		expect(store.isConfirming).toBe(false);
	});

	it('enterConfirmation transitions store to confirming (AC#6, FR19)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.placePoint({ x: 100, y: 100 });
		store.close();

		store.enterConfirmation();
		expect(store.isConfirming).toBe(true);
		expect(store.mode).toBe('confirming');
	});

	it('confirmationPoints exposed on store after entering confirmation (AC#6, FR19)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.placePoint({ x: 100, y: 100 });
		store.close();

		store.enterConfirmation();
		expect(store.confirmationPoints).toBeDefined();
		expect(store.confirmationPoints).toHaveLength(3);
	});

	it('confirmationSegments exposed on store after entering confirmation (AC#6, FR19)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.placePoint({ x: 100, y: 100 });
		store.close();

		store.enterConfirmation();
		expect(store.confirmationSegments).toBeDefined();
		expect(store.confirmationSegments).toHaveLength(2);
	});

	it('confirmPolygon copies confirmation data back and transitions to complete (AC#6, FR19)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.placePoint({ x: 100, y: 100 });
		store.close();

		store.enterConfirmation();
		store.adjustConfirmationPoint(0, { x: 10, y: 10 });
		store.confirmPolygon();

		expect(store.mode).toBe('complete');
		expect(store.points[0]).toEqual({ x: 10, y: 10 });
		expect(store.isConfirming).toBe(false);
		expect(store.confirmationPoints).toBeUndefined();
	});

	it('cancelConfirmation restores original data (AC#6, FR19)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.placePoint({ x: 100, y: 100 });
		store.close();

		store.enterConfirmation();
		store.adjustConfirmationPoint(0, { x: 999, y: 999 });
		store.cancelConfirmation();

		expect(store.mode).toBe('complete');
		expect(store.points[0]).toEqual({ x: 0, y: 0 });
		expect(store.isConfirming).toBe(false);
		expect(store.confirmationPoints).toBeUndefined();
	});
});

describe('Story 1.6 AC#7: adjustConfirmationPoint on drawing store (FR19)', () => {
	let store: ReturnType<typeof createDrawingStore>;

	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
		store = createDrawingStore();
	});

	it('adjustConfirmationPoint updates point via store (AC#7, FR19)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.placePoint({ x: 100, y: 100 });
		store.close();

		store.enterConfirmation();
		store.adjustConfirmationPoint(1, { x: 150, y: 50 });

		expect(store.confirmationPoints![1]).toEqual({ x: 150, y: 50 });
	});

	it('adjustConfirmationPoint preserves other points (AC#7, FR19)', () => {
		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.placePoint({ x: 100, y: 100 });
		store.close();

		store.enterConfirmation();
		store.adjustConfirmationPoint(1, { x: 150, y: 50 });

		expect(store.confirmationPoints![0]).toEqual({ x: 0, y: 0 });
		expect(store.confirmationPoints![2]).toEqual({ x: 100, y: 100 });
	});
});

// ──────────────────────────────────────────────────────────────
// Story 1.7: Property Boundary Drawing on Grid — Drawing Store
// ──────────────────────────────────────────────────────────────

/**
 * Story 1.7: Property Boundary Drawing on Grid
 *
 * Traceability:
 * AC#2 (FR4) → 'finalizeAsBoundary commits PropertyBoundarySet event and resets state',
 *               'finalizeAsBoundary event has correct entityId and type'
 */

describe('Story 1.7 AC#2: finalizeAsBoundary on drawing store (FR4)', () => {
	let store: ReturnType<typeof createDrawingStore>;

	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
		await initialize();
		store = createDrawingStore();
	});

	it('finalizeAsBoundary commits PropertyBoundarySet event and resets state (AC#2, FR4)', async () => {
		const entityId = crypto.randomUUID();

		store.start();
		store.placePoint({ x: 0, y: 0 });
		store.placePoint({ x: 100, y: 0 });
		store.placePoint({ x: 100, y: 100 });
		store.close();

		const event = await store.finalizeAsBoundary(entityId);

		// State should be reset after finalizeAsBoundary
		expect(store.mode).toBe('idle');
		expect(store.points).toEqual([]);

		// Event should be persisted to IndexedDB
		const events = await db.events.where('entityId').equals(entityId).toArray();
		const boundaryEvents = events.filter((e) => e.type === 'PropertyBoundarySet');
		expect(boundaryEvents).toHaveLength(1);
		expect(boundaryEvents[0].payload.points).toEqual([
			{ x: 0, y: 0 },
			{ x: 100, y: 0 },
			{ x: 100, y: 100 }
		]);
	});

	it('finalizeAsBoundary event has correct entityId and type (AC#2, FR4)', async () => {
		const entityId = crypto.randomUUID();

		store.start();
		store.placePoint({ x: 10, y: 20 });
		store.placePoint({ x: 30, y: 40 });
		store.placePoint({ x: 50, y: 60 });
		store.close();

		const event = await store.finalizeAsBoundary(entityId);

		expect(event.type).toBe('PropertyBoundarySet');
		expect(event.entityId).toBe(entityId);
		expect(event.entityType).toBe('property');
		expect(event.payload.points).toEqual([
			{ x: 10, y: 20 },
			{ x: 30, y: 40 },
			{ x: 50, y: 60 }
		]);
	});
});
