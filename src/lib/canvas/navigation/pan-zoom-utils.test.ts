/**
 * Traceability:
 * AC#2 (FR20) → 'calculateWheelZoom zooms in on positive delta', 'calculateWheelZoom zooms out on negative delta', 'calculateWheelZoom centers zoom on cursor position', 'calculateWheelZoom clamps at MIN_ZOOM', 'calculateWheelZoom clamps at MAX_ZOOM'
 * AC#3 (FR20) → 'calculatePinchZoom zooms in when fingers spread apart', 'calculatePinchZoom zooms out when fingers move together', 'calculatePinchZoom centers zoom between two touch points', 'calculatePinchZoom clamps at MIN_ZOOM', 'calculatePinchZoom clamps at MAX_ZOOM'
 * AC#4 (FR20) → 'calculatePanOffset returns correct new position', 'calculatePanOffset handles negative deltas'
 * (helpers) → 'getDistanceBetweenPoints calculates correctly', 'getMidpoint calculates correctly', 'clampZoom clamps within bounds'
 */

import { describe, it, expect } from 'vitest';
import {
	calculateWheelZoom,
	calculatePinchZoom,
	calculatePanOffset,
	getDistanceBetweenPoints,
	getMidpoint,
	clampZoom
} from './pan-zoom-utils.js';

describe('Story 1.4 AC#2: calculateWheelZoom (FR20)', () => {
	const baseParams = {
		currentZoom: 1,
		cursorPosition: { x: 400, y: 300 },
		stagePosition: { x: 0, y: 0 }
	};

	it('zooms in on negative deltaY (scroll up) (AC#2, FR20)', () => {
		const result = calculateWheelZoom({ ...baseParams, deltaY: -100 });
		expect(result.newZoom).toBeGreaterThan(1);
	});

	it('zooms out on positive deltaY (scroll down) (AC#2, FR20)', () => {
		const result = calculateWheelZoom({ ...baseParams, deltaY: 100 });
		expect(result.newZoom).toBeLessThan(1);
	});

	it('centers zoom on cursor position (AC#2, FR20)', () => {
		const cursorPos = { x: 200, y: 150 };
		const result = calculateWheelZoom({
			currentZoom: 1,
			cursorPosition: cursorPos,
			stagePosition: { x: 0, y: 0 },
			deltaY: -100
		});

		// After zoom, the point under the cursor should remain at the same screen position.
		// The new stage position should be adjusted toward the cursor.
		expect(result.newPosition).toBeDefined();
		expect(result.newPosition.x).not.toBe(0);
		expect(result.newPosition.y).not.toBe(0);
	});

	it('clamps zoom at MIN_ZOOM (AC#2, FR20)', () => {
		const result = calculateWheelZoom({
			currentZoom: 0.15,
			cursorPosition: { x: 400, y: 300 },
			stagePosition: { x: 0, y: 0 },
			deltaY: 10000 // extreme scroll out
		});
		expect(result.newZoom).toBeGreaterThanOrEqual(0.1);
	});

	it('clamps zoom at MAX_ZOOM (AC#2, FR20)', () => {
		const result = calculateWheelZoom({
			currentZoom: 9.5,
			cursorPosition: { x: 400, y: 300 },
			stagePosition: { x: 0, y: 0 },
			deltaY: -10000 // extreme scroll in
		});
		expect(result.newZoom).toBeLessThanOrEqual(10);
	});
});

describe('Story 1.4 AC#3: calculatePinchZoom (FR20)', () => {
	it('zooms in when fingers spread apart (AC#3, FR20)', () => {
		const result = calculatePinchZoom({
			previousDistance: 100,
			currentDistance: 200,
			midpoint: { x: 400, y: 300 },
			currentZoom: 1,
			stagePosition: { x: 0, y: 0 }
		});
		expect(result.newZoom).toBeGreaterThan(1);
	});

	it('zooms out when fingers move together (AC#3, FR20)', () => {
		const result = calculatePinchZoom({
			previousDistance: 200,
			currentDistance: 100,
			midpoint: { x: 400, y: 300 },
			currentZoom: 1,
			stagePosition: { x: 0, y: 0 }
		});
		expect(result.newZoom).toBeLessThan(1);
	});

	it('centers zoom between two touch points (AC#3, FR20)', () => {
		const midpoint = { x: 300, y: 250 };
		const result = calculatePinchZoom({
			previousDistance: 100,
			currentDistance: 150,
			midpoint,
			currentZoom: 1,
			stagePosition: { x: 0, y: 0 }
		});

		// The stage position should adjust to keep the midpoint stable
		expect(result.newPosition).toBeDefined();
		expect(result.newPosition.x).not.toBe(0);
		expect(result.newPosition.y).not.toBe(0);
	});

	it('clamps pinch zoom at MIN_ZOOM (AC#3, FR20)', () => {
		const result = calculatePinchZoom({
			previousDistance: 200,
			currentDistance: 1,
			midpoint: { x: 400, y: 300 },
			currentZoom: 0.2,
			stagePosition: { x: 0, y: 0 }
		});
		expect(result.newZoom).toBeGreaterThanOrEqual(0.1);
	});

	it('clamps pinch zoom at MAX_ZOOM (AC#3, FR20)', () => {
		const result = calculatePinchZoom({
			previousDistance: 1,
			currentDistance: 1000,
			midpoint: { x: 400, y: 300 },
			currentZoom: 9,
			stagePosition: { x: 0, y: 0 }
		});
		expect(result.newZoom).toBeLessThanOrEqual(10);
	});
});

describe('Story 1.4 AC#4: calculatePanOffset (FR20)', () => {
	it('returns correct new position from drag delta (AC#4, FR20)', () => {
		const result = calculatePanOffset({
			dragStart: { x: 100, y: 100 },
			dragEnd: { x: 150, y: 120 },
			currentOffset: { x: 0, y: 0 }
		});
		expect(result).toEqual({ x: 50, y: 20 });
	});

	it('handles negative deltas (dragging left/up) (AC#4, FR20)', () => {
		const result = calculatePanOffset({
			dragStart: { x: 200, y: 200 },
			dragEnd: { x: 150, y: 180 },
			currentOffset: { x: 10, y: 10 }
		});
		expect(result).toEqual({ x: -40, y: -10 });
	});

	it('accumulates with existing non-zero offset (AC#4, FR20)', () => {
		const result = calculatePanOffset({
			dragStart: { x: 100, y: 100 },
			dragEnd: { x: 120, y: 130 },
			currentOffset: { x: 50, y: 75 }
		});
		expect(result).toEqual({ x: 70, y: 105 });
	});
});

describe('Story 1.4: Helper functions (defensive)', () => {
	it('getDistanceBetweenPoints calculates Euclidean distance (defensive)', () => {
		const distance = getDistanceBetweenPoints({ x: 0, y: 0 }, { x: 3, y: 4 });
		expect(distance).toBe(5);
	});

	it('getMidpoint calculates correct center (defensive)', () => {
		const mid = getMidpoint({ x: 0, y: 0 }, { x: 10, y: 20 });
		expect(mid).toEqual({ x: 5, y: 10 });
	});

	it('clampZoom clamps within min/max bounds (defensive)', () => {
		expect(clampZoom(0.05)).toBe(0.1);
		expect(clampZoom(15)).toBe(10);
		expect(clampZoom(5)).toBe(5);
	});
});
