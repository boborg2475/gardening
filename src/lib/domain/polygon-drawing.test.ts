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
 *
 * Story 1.6: Drawing Precision Tools
 *
 * Traceability:
 * AC#1 (FR14) -> 'toggleSegmentCurve converts line segment to curve with control point at midpoint', 'toggleSegmentCurve converts curve segment back to line', 'getDefaultControlPoint returns midpoint of two points'
 * AC#2 (FR15) -> 'updateCurveControl updates control point for curve segment', 'updateCurveControl is no-op for line segment'
 * AC#6 (FR19) -> 'enterConfirmation transitions from complete to confirming', 'enterConfirmation clones points and segments into confirmation fields', 'confirmPolygon copies confirmation data back and transitions to complete', 'cancelConfirmation discards edits and returns to complete with original data'
 * AC#7 (FR19) -> 'adjustConfirmationPoint updates a single confirmation point', 'adjustConfirmationPoint preserves other confirmation points'
 * Segments    -> 'startDrawing initializes empty segments array', 'addPoint appends line segment for points after the first', 'segments array length equals points length minus one', 'closePolygon preserves segments'
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
	INITIAL_DRAWING_STATE,
	toggleSegmentCurve,
	updateCurveControl,
	getDefaultControlPoint,
	enterConfirmation,
	adjustConfirmationPoint,
	confirmPolygon,
	cancelConfirmation
} from './polygon-drawing.js';
import type { DrawingState, DrawingMode, SegmentMeta } from './polygon-drawing.js';

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

// ──────────────────────────────────────────────────────────────
// Story 1.6: Drawing Precision Tools — Segments invariant
// ──────────────────────────────────────────────────────────────

describe('Story 1.6 Segments invariant: segments array synchronized with points', () => {
	it('startDrawing initializes empty segments array (AC#1, FR14)', () => {
		const state = startDrawing();
		expect(state.segments).toBeDefined();
		expect(state.segments).toEqual([]);
	});

	it('addPoint does not append a segment for the first point (AC#1, FR14)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });

		expect(state.points).toHaveLength(1);
		expect(state.segments).toHaveLength(0);
	});

	it('addPoint appends a line segment for the second point onward (AC#1, FR14)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });

		expect(state.segments).toHaveLength(1);
		expect(state.segments[0]).toEqual({ type: 'line' });
	});

	it('segments array length equals points length minus one for 3+ points (AC#1, FR14)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });

		expect(state.points).toHaveLength(3);
		expect(state.segments).toHaveLength(2);
		expect(state.segments.every((s: SegmentMeta) => s.type === 'line')).toBe(true);
	});

	it('closePolygon preserves segments (AC#1, FR14)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });

		const closed = closePolygon(state);
		expect(closed.segments).toHaveLength(2);
		expect(closed.segments[0]).toEqual({ type: 'line' });
	});

	it('segments array is immutably copied on addPoint (AC#1, FR14)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		const state2 = addPoint(state, { x: 100, y: 0 });

		expect(state.segments).not.toBe(state2.segments);
		expect(state.segments).toHaveLength(0);
		expect(state2.segments).toHaveLength(1);
	});
});

// ──────────────────────────────────────────────────────────────
// Story 1.6 AC#1: toggleSegmentCurve and getDefaultControlPoint (FR14)
// ──────────────────────────────────────────────────────────────

describe('Story 1.6 AC#1: toggleSegmentCurve and getDefaultControlPoint (FR14)', () => {
	it('getDefaultControlPoint returns midpoint of two points (AC#1, FR14)', () => {
		const cp = getDefaultControlPoint({ x: 0, y: 0 }, { x: 100, y: 200 });
		expect(cp).toEqual({ x: 50, y: 100 });
	});

	it('getDefaultControlPoint handles negative coordinates (AC#1, FR14)', () => {
		const cp = getDefaultControlPoint({ x: -10, y: -20 }, { x: 10, y: 20 });
		expect(cp).toEqual({ x: 0, y: 0 });
	});

	it('getDefaultControlPoint handles identical points (AC#1, FR14)', () => {
		const cp = getDefaultControlPoint({ x: 50, y: 50 }, { x: 50, y: 50 });
		expect(cp).toEqual({ x: 50, y: 50 });
	});

	it('toggleSegmentCurve converts line segment to curve with control point at midpoint (AC#1, FR14)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });
		state = closePolygon(state);

		const toggled = toggleSegmentCurve(state, 0);
		expect(toggled.segments[0].type).toBe('curve');
		expect(toggled.segments[0].controlPoint).toEqual({ x: 50, y: 0 });
	});

	it('toggleSegmentCurve converts curve segment back to line (AC#1, FR14)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });
		state = closePolygon(state);

		// Toggle to curve, then back to line
		let toggled = toggleSegmentCurve(state, 0);
		toggled = toggleSegmentCurve(toggled, 0);
		expect(toggled.segments[0].type).toBe('line');
		expect(toggled.segments[0].controlPoint).toBeUndefined();
	});

	it('toggleSegmentCurve does not affect other segments (AC#1, FR14)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });
		state = closePolygon(state);

		const toggled = toggleSegmentCurve(state, 0);
		expect(toggled.segments[1].type).toBe('line');
	});

	it('toggleSegmentCurve returns new state object (AC#1, FR14)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });
		state = closePolygon(state);

		const toggled = toggleSegmentCurve(state, 0);
		expect(toggled).not.toBe(state);
		expect(toggled.segments).not.toBe(state.segments);
	});
});

// ──────────────────────────────────────────────────────────────
// Story 1.6 AC#2: updateCurveControl (FR15)
// ──────────────────────────────────────────────────────────────

describe('Story 1.6 AC#2: updateCurveControl (FR15)', () => {
	it('updateCurveControl updates control point for curve segment (AC#2, FR15)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });
		state = closePolygon(state);
		state = toggleSegmentCurve(state, 0);

		const updated = updateCurveControl(state, 0, { x: 30, y: -20 });
		expect(updated.segments[0].controlPoint).toEqual({ x: 30, y: -20 });
	});

	it('updateCurveControl is no-op for line segment (AC#2, FR15)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });
		state = closePolygon(state);

		const updated = updateCurveControl(state, 0, { x: 30, y: -20 });
		expect(updated.segments[0].type).toBe('line');
		expect(updated.segments[0].controlPoint).toBeUndefined();
	});

	it('updateCurveControl preserves other segments (AC#2, FR15)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });
		state = closePolygon(state);
		state = toggleSegmentCurve(state, 0);

		const updated = updateCurveControl(state, 0, { x: 30, y: -20 });
		expect(updated.segments[1].type).toBe('line');
	});

	it('updateCurveControl returns new state object (AC#2, FR15)', () => {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });
		state = closePolygon(state);
		state = toggleSegmentCurve(state, 0);

		const updated = updateCurveControl(state, 0, { x: 30, y: -20 });
		expect(updated).not.toBe(state);
	});
});

// ──────────────────────────────────────────────────────────────
// Story 1.6 AC#6: Two-stage confirmation (FR19)
// ──────────────────────────────────────────────────────────────

describe('Story 1.6 AC#6: enterConfirmation, confirmPolygon, cancelConfirmation (FR19)', () => {
	function buildCompletedPolygon(): DrawingState {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });
		return closePolygon(state);
	}

	it('enterConfirmation transitions from complete to confirming (AC#6, FR19)', () => {
		const completed = buildCompletedPolygon();
		const confirming = enterConfirmation(completed);

		expect(confirming.mode).toBe('confirming');
	});

	it('enterConfirmation clones points into confirmationPoints (AC#6, FR19)', () => {
		const completed = buildCompletedPolygon();
		const confirming = enterConfirmation(completed);

		expect(confirming.confirmationPoints).toBeDefined();
		expect(confirming.confirmationPoints).toEqual(completed.points);
		// Must be a deep clone, not the same reference
		expect(confirming.confirmationPoints).not.toBe(completed.points);
	});

	it('enterConfirmation clones segments into confirmationSegments (AC#6, FR19)', () => {
		const completed = buildCompletedPolygon();
		const confirming = enterConfirmation(completed);

		expect(confirming.confirmationSegments).toBeDefined();
		expect(confirming.confirmationSegments).toEqual(completed.segments);
		expect(confirming.confirmationSegments).not.toBe(completed.segments);
	});

	it('enterConfirmation is no-op when mode is not complete (AC#6, FR19)', () => {
		const placing = startDrawing();
		const result = enterConfirmation(placing);

		expect(result.mode).toBe('placing');
		expect(result.confirmationPoints).toBeUndefined();
	});

	it('confirmPolygon copies confirmation data back to points/segments (AC#6, FR19)', () => {
		const completed = buildCompletedPolygon();
		let confirming = enterConfirmation(completed);
		// Adjust a point in confirmation
		confirming = adjustConfirmationPoint(confirming, 0, { x: 10, y: 10 });

		const confirmed = confirmPolygon(confirming);
		expect(confirmed.mode).toBe('complete');
		expect(confirmed.points[0]).toEqual({ x: 10, y: 10 });
		expect(confirmed.confirmationPoints).toBeUndefined();
		expect(confirmed.confirmationSegments).toBeUndefined();
	});

	it('cancelConfirmation discards edits and returns to complete with original data (AC#6, FR19)', () => {
		const completed = buildCompletedPolygon();
		let confirming = enterConfirmation(completed);
		confirming = adjustConfirmationPoint(confirming, 0, { x: 999, y: 999 });

		const cancelled = cancelConfirmation(confirming);
		expect(cancelled.mode).toBe('complete');
		expect(cancelled.points).toEqual(completed.points);
		expect(cancelled.confirmationPoints).toBeUndefined();
		expect(cancelled.confirmationSegments).toBeUndefined();
	});

	it('confirmPolygon returns new state object (AC#6, FR19)', () => {
		const completed = buildCompletedPolygon();
		const confirming = enterConfirmation(completed);
		const confirmed = confirmPolygon(confirming);

		expect(confirmed).not.toBe(confirming);
	});

	it('cancelConfirmation returns new state object (AC#6, FR19)', () => {
		const completed = buildCompletedPolygon();
		const confirming = enterConfirmation(completed);
		const cancelled = cancelConfirmation(confirming);

		expect(cancelled).not.toBe(confirming);
	});
});

// ──────────────────────────────────────────────────────────────
// Story 1.6 AC#7: adjustConfirmationPoint (FR19)
// ──────────────────────────────────────────────────────────────

describe('Story 1.6 AC#7: adjustConfirmationPoint (FR19)', () => {
	function buildConfirmingPolygon(): DrawingState {
		let state = startDrawing();
		state = addPoint(state, { x: 0, y: 0 });
		state = addPoint(state, { x: 100, y: 0 });
		state = addPoint(state, { x: 100, y: 100 });
		state = closePolygon(state);
		return enterConfirmation(state);
	}

	it('adjustConfirmationPoint updates a single confirmation point (AC#7, FR19)', () => {
		const confirming = buildConfirmingPolygon();
		const adjusted = adjustConfirmationPoint(confirming, 1, { x: 150, y: 50 });

		expect(adjusted.confirmationPoints![1]).toEqual({ x: 150, y: 50 });
	});

	it('adjustConfirmationPoint preserves other confirmation points (AC#7, FR19)', () => {
		const confirming = buildConfirmingPolygon();
		const adjusted = adjustConfirmationPoint(confirming, 1, { x: 150, y: 50 });

		expect(adjusted.confirmationPoints![0]).toEqual({ x: 0, y: 0 });
		expect(adjusted.confirmationPoints![2]).toEqual({ x: 100, y: 100 });
	});

	it('adjustConfirmationPoint does not modify original points (AC#7, FR19)', () => {
		const confirming = buildConfirmingPolygon();
		const adjusted = adjustConfirmationPoint(confirming, 0, { x: 999, y: 999 });

		// Original points should be unchanged
		expect(adjusted.points[0]).toEqual({ x: 0, y: 0 });
	});

	it('adjustConfirmationPoint returns new state object (AC#7, FR19)', () => {
		const confirming = buildConfirmingPolygon();
		const adjusted = adjustConfirmationPoint(confirming, 0, { x: 50, y: 50 });

		expect(adjusted).not.toBe(confirming);
		expect(adjusted.confirmationPoints).not.toBe(confirming.confirmationPoints);
	});
});
