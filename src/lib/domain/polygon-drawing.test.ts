/**
 * Story 1.5: Polygon Drawing Tool
 *
 * Traceability:
 * AC#1 (FR13) -> 'startDrawing transitions from idle to placing mode', 'addPoint places first point and returns it in state', 'addPoint preserves point coordinates exactly'
 * AC#2 (FR13) -> 'addPoint accumulates multiple points in sequence', 'points array maintains insertion order'
 * AC#3 (FR21) -> 'isNearFirstPoint returns true when position is within hit radius', 'isNearFirstPoint returns false when position is outside hit radius', 'closePolygon transitions to complete mode with 3+ points', 'closePolygon does not include duplicate of first point'
 * AC#4 (FR4)  -> 'updatePreview sets previewPosition when in placing mode', 'updatePreview clears when mode is not placing'
 * AC#5 (FR4)  -> 'commitPolygon dispatches PolygonDrawn event with correct points', 'commitPolygon returns the committed event'
 * Edge cases  -> 'addPoint is a no-op when mode is idle', 'addPoint is a no-op when mode is complete', 'closePolygon is a no-op with fewer than 3 points', 'isNearFirstPoint returns false with fewer than 3 points', 'cancelDrawing resets to initial state', 'state transitions are immutable'
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../data/db.js';
import { _reset, dispatchEvent } from '../stores/materialized-state.svelte.js';
import {
	startDrawing,
	addPoint,
	updatePreview,
	isNearFirstPoint,
	closePolygon,
	cancelDrawing,
	commitPolygon,
	INITIAL_DRAWING_STATE
} from './polygon-drawing.js';
import type { DrawingState, DrawingMode } from './polygon-drawing.js';

describe('Story 1.5 AC#1: startDrawing and addPoint (FR13)', () => {
	it('INITIAL_DRAWING_STATE has idle mode with empty points (AC#1, FR13)', () => {
		expect(INITIAL_DRAWING_STATE.mode).toBe('idle');
		expect(INITIAL_DRAWING_STATE.points).toEqual([]);
		expect(INITIAL_DRAWING_STATE.previewPosition).toBeUndefined();
	});

	it('startDrawing transitions from idle to placing mode (AC#1, FR13)', () => {
		const state = startDrawing();
		expect(state.mode).toBe('placing');
		expect(state.points).toEqual([]);
		expect(state.previewPosition).toBeUndefined();
	});

	it('addPoint places first point and returns it in state (AC#1, FR13)', () => {
		const state = startDrawing();
		const next = addPoint(state, { x: 100, y: 200 });

		expect(next.points).toHaveLength(1);
		expect(next.points[0]).toEqual({ x: 100, y: 200 });
		expect(next.mode).toBe('placing');
	});

	it('addPoint preserves point coordinates exactly (AC#1, FR13)', () => {
		const state = startDrawing();
		const next = addPoint(state, { x: 33.333, y: 77.777 });

		expect(next.points[0].x).toBe(33.333);
		expect(next.points[0].y).toBe(77.777);
	});
});

describe('Story 1.5 AC#2: multiple point accumulation (FR13)', () => {
	it('addPoint accumulates multiple points in sequence (AC#2, FR13)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });

		expect(state.points).toHaveLength(3);
		expect(state.mode).toBe('placing');
	});

	it('points array maintains insertion order (AC#2, FR13)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 10, y: 20 });
		state = addPoint(state, { x: 30, y: 40 });
		state = addPoint(state, { x: 50, y: 60 });

		expect(state.points[0]).toEqual({ x: 10, y: 20 });
		expect(state.points[1]).toEqual({ x: 30, y: 40 });
		expect(state.points[2]).toEqual({ x: 50, y: 60 });
	});
});

describe('Story 1.5 AC#3: isNearFirstPoint and closePolygon (FR21)', () => {
	it('isNearFirstPoint returns true when position is within hit radius (AC#3, FR21)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 100, y: 100 });
		state = addPoint(state, { x: 200, y: 100 });
		state = addPoint(state, { x: 200, y: 200 });

		const near = isNearFirstPoint(state, { x: 105, y: 103 }, 15);
		expect(near).toBe(true);
	});

	it('isNearFirstPoint returns false when position is outside hit radius (AC#3, FR21)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 100, y: 100 });
		state = addPoint(state, { x: 200, y: 100 });
		state = addPoint(state, { x: 200, y: 200 });

		const near = isNearFirstPoint(state, { x: 150, y: 150 }, 15);
		expect(near).toBe(false);
	});

	it('closePolygon transitions to complete mode with 3+ points (AC#3, FR21)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });

		const closed = closePolygon(state);
		expect(closed.mode).toBe('complete');
		expect(closed.points).toHaveLength(3);
	});

	it('closePolygon does not include duplicate of first point (AC#3, FR21)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });

		const closed = closePolygon(state);
		// The first point should not be repeated at the end
		const last = closed.points[closed.points.length - 1];
		const first = closed.points[0];
		expect(last).not.toEqual(first);
	});

	it('closePolygon clears previewPosition (AC#3, FR21)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });
		state = updatePreview(state, { x: 50, y: 50 });

		const closed = closePolygon(state);
		expect(closed.previewPosition).toBeUndefined();
	});
});

describe('Story 1.5 AC#4: updatePreview (FR4)', () => {
	it('updatePreview sets previewPosition when in placing mode (AC#4, FR4)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = updatePreview(state, { x: 50, y: 75 });

		expect(state.previewPosition).toEqual({ x: 50, y: 75 });
		expect(state.mode).toBe('placing');
	});

	it('updatePreview updates previewPosition on subsequent calls (AC#4, FR4)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = updatePreview(state, { x: 50, y: 75 });
		state = updatePreview(state, { x: 60, y: 85 });

		expect(state.previewPosition).toEqual({ x: 60, y: 85 });
	});

	it('updatePreview is a no-op when mode is idle (AC#4, FR4)', () => {
		const state = updatePreview(INITIAL_DRAWING_STATE, { x: 50, y: 75 });
		expect(state.previewPosition).toBeUndefined();
	});

	it('updatePreview is a no-op when mode is complete (AC#4, FR4)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });
		state = closePolygon(state);

		const updated = updatePreview(state, { x: 50, y: 50 });
		expect(updated.previewPosition).toBeUndefined();
	});
});

describe('Story 1.5 AC#5: commitPolygon (FR4)', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
	});

	it('commitPolygon dispatches PolygonDrawn event with correct points (AC#5, FR4)', async () => {
		const entityId = crypto.randomUUID();
		const points = [
			{ x: 0, y: 0 },
			{ x: 100, y: 0 },
			{ x: 100, y: 100 }
		];

		const event = await commitPolygon(dispatchEvent, entityId, points);

		expect(event.type).toBe('PolygonDrawn');
		expect(event.entityId).toBe(entityId);
		expect(event.entityType).toBe('property');
		expect(event.payload.points).toEqual(points);
	});

	it('commitPolygon returns the committed event (AC#5, FR4)', async () => {
		const entityId = crypto.randomUUID();
		const points = [
			{ x: 10, y: 20 },
			{ x: 30, y: 40 },
			{ x: 50, y: 60 }
		];

		const event = await commitPolygon(dispatchEvent, entityId, points);

		expect(event.id).toBeDefined();
		expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
	});

	it('commitPolygon persists event to IndexedDB (AC#5, FR4)', async () => {
		const entityId = crypto.randomUUID();
		const points = [
			{ x: 0, y: 0 },
			{ x: 100, y: 0 },
			{ x: 100, y: 100 }
		];

		const event = await commitPolygon(dispatchEvent, entityId, points);
		const stored = await db.events.get(event.id);
		expect(stored).toBeDefined();
		expect(stored!.type).toBe('PolygonDrawn');
	});
});

describe('Story 1.5 Edge cases: polygon-drawing state machine', () => {
	it('addPoint is a no-op when mode is idle (FR13)', () => {
		const state = addPoint(INITIAL_DRAWING_STATE, { x: 100, y: 200 });
		expect(state.points).toEqual([]);
		expect(state.mode).toBe('idle');
	});

	it('addPoint is a no-op when mode is complete (FR13)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });
		state = closePolygon(state);

		const next = addPoint(state, { x: 50, y: 50 });
		expect(next.points).toHaveLength(3);
		expect(next.mode).toBe('complete');
	});

	it('closePolygon is a no-op with fewer than 3 points (FR21)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });

		const result = closePolygon(state);
		expect(result.mode).toBe('placing');
		expect(result.points).toHaveLength(2);
	});

	it('isNearFirstPoint returns false with fewer than 3 points (FR21)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 100, y: 100 });
		state = addPoint(state, { x: 200, y: 100 });

		const near = isNearFirstPoint(state, { x: 100, y: 100 }, 15);
		expect(near).toBe(false);
	});

	it('isNearFirstPoint returns false when no points exist (FR21)', () => {
		const state = startDrawing();
		const near = isNearFirstPoint(state, { x: 0, y: 0 }, 15);
		expect(near).toBe(false);
	});

	it('cancelDrawing resets to initial state (FR13)', () => {
		const state = cancelDrawing();
		expect(state.mode).toBe('idle');
		expect(state.points).toEqual([]);
		expect(state.previewPosition).toBeUndefined();
	});

	it('state transitions are immutable (FR4)', () => {
		const state1 = startDrawing();
		const state2 = addPoint(state1, { x: 10, y: 20 });

		expect(state1).not.toBe(state2);
		expect(state1.points).not.toBe(state2.points);
		expect(state1.points).toHaveLength(0);
		expect(state2.points).toHaveLength(1);
	});

	it('closePolygon returns new state object (FR4)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });

		const closed = closePolygon(state);
		expect(closed).not.toBe(state);
	});
});
