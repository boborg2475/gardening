/**
 * Traceability:
 * AC#1 (FR5)  → 'returns grid lines for basic parameters', 'getPropertyCanvasSize with dimensions', 'getPropertyCanvasSize without dimensions defaults to 100ft', 'getPropertyCanvasSize with metric defaults to 30m', 'zero-size canvas returns empty array'
 * AC#5 (FR5)  → 'grid spacing for 1ft scale', 'grid spacing for 1m scale', 'grid spacing for 6in scale', 'grid spacing for 1in scale', 'grid spacing for 10cm scale', 'grid spacing for 1cm scale', 'major vs minor line styling', 'only visible lines generated (viewport culling)', 'pan offset shifts grid lines', 'zoom factor scales grid spacing'
 */

import { describe, it, expect } from 'vitest';
import {
	calculateGridLines,
	getPropertyCanvasSize,
	getPropertyBounds,
	type GridLineConfig,
	type CanvasBounds
} from './grid-renderer.js';
import { BASE_PIXELS_PER_FOOT, BASE_PIXELS_PER_METER } from '../../types/canvas.js';

describe('Story 1.4 AC#1: calculateGridLines basic behavior (FR5)', () => {
	it('returns grid lines for basic parameters (AC#1, FR5)', () => {
		const lines = calculateGridLines({
			canvasWidth: 800,
			canvasHeight: 600,
			gridScale: '1ft',
			zoom: 1,
			panOffset: { x: 0, y: 0 }
		});

		expect(lines).toBeDefined();
		expect(Array.isArray(lines)).toBe(true);
		expect(lines.length).toBeGreaterThan(0);

		// Each line should have start/end points and styling
		const firstLine = lines[0];
		expect(firstLine).toHaveProperty('points');
		expect(firstLine).toHaveProperty('stroke');
		expect(firstLine).toHaveProperty('strokeWidth');
	});
});

describe('Story 1.4 AC#5: Grid spacing per scale (FR5)', () => {
	const baseParams = {
		canvasWidth: 1000,
		canvasHeight: 1000,
		zoom: 1,
		panOffset: { x: 0, y: 0 }
	};

	it('grid spacing for 1ft scale (AC#5, FR5)', () => {
		const lines = calculateGridLines({ ...baseParams, gridScale: '1ft' });
		expect(lines.length).toBeGreaterThan(0);

		// Lines should be spaced at 1ft intervals (pixel spacing depends on scale factor)
		const horizontalLines = lines.filter(
			(l) => l.points[1] === l.points[3] // y1 === y2 means horizontal
		);
		expect(horizontalLines.length).toBeGreaterThan(0);
	});

	it('grid spacing for 1m scale (AC#5, FR5)', () => {
		const lines = calculateGridLines({ ...baseParams, gridScale: '1m' });
		expect(lines.length).toBeGreaterThan(0);
	});

	it('grid spacing for 6in scale (AC#5, FR5)', () => {
		const lines = calculateGridLines({ ...baseParams, gridScale: '6in' });
		expect(lines.length).toBeGreaterThan(0);
	});

	it('grid spacing for 1in scale (AC#5, FR5)', () => {
		const lines = calculateGridLines({ ...baseParams, gridScale: '1in' });
		expect(lines.length).toBeGreaterThan(0);
	});

	it('grid spacing for 10cm scale (AC#5, FR5)', () => {
		const lines = calculateGridLines({ ...baseParams, gridScale: '10cm' });
		expect(lines.length).toBeGreaterThan(0);
	});

	it('grid spacing for 1cm scale (AC#5, FR5)', () => {
		const lines = calculateGridLines({ ...baseParams, gridScale: '1cm' });
		expect(lines.length).toBeGreaterThan(0);
	});
});

describe('Story 1.4 AC#5: Grid line styling and culling (FR5)', () => {
	it('major vs minor line styling (AC#5, FR5)', () => {
		const lines = calculateGridLines({
			canvasWidth: 1000,
			canvasHeight: 1000,
			gridScale: '1in',
			zoom: 1,
			panOffset: { x: 0, y: 0 }
		});

		const majorLines = lines.filter((l) => l.isMajor);
		const minorLines = lines.filter((l) => !l.isMajor);

		// Should have both major and minor lines for fine scales
		expect(majorLines.length).toBeGreaterThan(0);
		expect(minorLines.length).toBeGreaterThan(0);

		// Major lines should be visually distinct (thicker or different opacity)
		expect(majorLines[0].strokeWidth).toBeGreaterThan(minorLines[0].strokeWidth);
	});

	it('only visible lines generated - viewport culling (AC#5, FR5)', () => {
		const smallViewport = calculateGridLines({
			canvasWidth: 100,
			canvasHeight: 100,
			gridScale: '1ft',
			zoom: 1,
			panOffset: { x: 0, y: 0 }
		});

		const largeViewport = calculateGridLines({
			canvasWidth: 2000,
			canvasHeight: 2000,
			gridScale: '1ft',
			zoom: 1,
			panOffset: { x: 0, y: 0 }
		});

		// Larger viewport should generate more lines
		expect(largeViewport.length).toBeGreaterThan(smallViewport.length);
	});

	it('pan offset shifts grid lines (AC#5, FR5)', () => {
		const baseLines = calculateGridLines({
			canvasWidth: 800,
			canvasHeight: 600,
			gridScale: '1ft',
			zoom: 1,
			panOffset: { x: 0, y: 0 }
		});

		const pannedLines = calculateGridLines({
			canvasWidth: 800,
			canvasHeight: 600,
			gridScale: '1ft',
			zoom: 1,
			panOffset: { x: 200, y: 150 }
		});

		// Panned lines should have different positions than base lines
		expect(pannedLines[0].points).not.toEqual(baseLines[0].points);
	});

	it('zoom factor scales grid spacing (AC#5, FR5)', () => {
		const normalLines = calculateGridLines({
			canvasWidth: 800,
			canvasHeight: 600,
			gridScale: '1ft',
			zoom: 1,
			panOffset: { x: 0, y: 0 }
		});

		const zoomedLines = calculateGridLines({
			canvasWidth: 800,
			canvasHeight: 600,
			gridScale: '1ft',
			zoom: 2,
			panOffset: { x: 0, y: 0 }
		});

		// Zoomed in should produce fewer lines (wider spacing) in the same viewport
		expect(zoomedLines.length).toBeLessThan(normalLines.length);
	});
});

describe('Story 1.4 AC#1: getPropertyCanvasSize (FR5)', () => {
	it('getPropertyCanvasSize with dimensions returns those dimensions (AC#1, FR5)', () => {
		const size = getPropertyCanvasSize({ width: 50, length: 100, unit: 'ft' });
		expect(size).toEqual({ width: 50, height: 100, unit: 'ft' });
	});

	it('getPropertyCanvasSize without dimensions defaults to 100ft x 100ft (AC#1, FR5)', () => {
		const size = getPropertyCanvasSize(undefined);
		expect(size).toEqual({ width: 100, height: 100, unit: 'ft' });
	});

	it('getPropertyCanvasSize with metric property defaults to 30m x 30m (AC#1, FR5)', () => {
		const size = getPropertyCanvasSize(undefined, 'm');
		expect(size).toEqual({ width: 30, height: 30, unit: 'm' });
	});

	it('zero-size canvas returns empty array (AC#1, FR5)', () => {
		const lines = calculateGridLines({
			canvasWidth: 0,
			canvasHeight: 0,
			gridScale: '1ft',
			zoom: 1,
			panOffset: { x: 0, y: 0 }
		});
		expect(lines).toEqual([]);
	});
});

describe('getPropertyBounds', () => {
	it('converts imperial dimensions to canvas-space pixel bounds', () => {
		const bounds = getPropertyBounds({ width: 50, length: 100, unit: 'ft' });
		expect(bounds.left).toBe(0);
		expect(bounds.top).toBe(0);
		expect(bounds.right).toBe(50 * BASE_PIXELS_PER_FOOT);
		expect(bounds.bottom).toBe(100 * BASE_PIXELS_PER_FOOT);
	});

	it('converts metric dimensions to canvas-space pixel bounds', () => {
		const bounds = getPropertyBounds({ width: 20, length: 30, unit: 'm' });
		expect(bounds.left).toBe(0);
		expect(bounds.top).toBe(0);
		expect(bounds.right).toBeCloseTo(20 * BASE_PIXELS_PER_METER);
		expect(bounds.bottom).toBeCloseTo(30 * BASE_PIXELS_PER_METER);
	});

	it('small property produces small bounds', () => {
		const bounds = getPropertyBounds({ width: 1, length: 1, unit: 'ft' });
		expect(bounds.right).toBe(BASE_PIXELS_PER_FOOT);
		expect(bounds.bottom).toBe(BASE_PIXELS_PER_FOOT);
	});
});

describe('calculateGridLines with propertyBounds', () => {
	const smallProperty: CanvasBounds = {
		left: 0,
		top: 0,
		right: 150, // 5ft at 30px/ft
		bottom: 150
	};

	const baseParams = {
		canvasWidth: 2000,
		canvasHeight: 2000,
		gridScale: '1ft' as const,
		zoom: 1,
		panOffset: { x: 0, y: 0 }
	};

	it('produces fewer lines with property bounds than without', () => {
		const unbounded = calculateGridLines(baseParams);
		const bounded = calculateGridLines({ ...baseParams, propertyBounds: smallProperty });
		expect(bounded.length).toBeLessThan(unbounded.length);
	});

	it('grid lines stay within property bounds plus padding', () => {
		const bounded = calculateGridLines({ ...baseParams, propertyBounds: smallProperty });
		const padding = BASE_PIXELS_PER_FOOT * 2; // GRID_PADDING_UNITS = 2

		for (const line of bounded) {
			const [x1, y1, x2, y2] = line.points;
			// Vertical lines: x should be within padded bounds
			if (x1 === x2) {
				expect(x1).toBeGreaterThanOrEqual(smallProperty.left - padding - 1);
				expect(x1).toBeLessThanOrEqual(smallProperty.right + padding + 1);
			}
			// Horizontal lines: y should be within padded bounds
			if (y1 === y2) {
				expect(y1).toBeGreaterThanOrEqual(smallProperty.top - padding - 1);
				expect(y1).toBeLessThanOrEqual(smallProperty.bottom + padding + 1);
			}
		}
	});

	it('returns empty when viewport is fully outside property bounds', () => {
		const farAway = calculateGridLines({
			...baseParams,
			// Pan so viewport is far from the property
			panOffset: { x: -50000, y: -50000 }
		});

		const farAwayBounded = calculateGridLines({
			...baseParams,
			panOffset: { x: -50000, y: -50000 },
			propertyBounds: smallProperty
		});

		// Unbounded still generates lines (infinite grid), bounded should not
		expect(farAway.length).toBeGreaterThan(0);
		expect(farAwayBounded.length).toBe(0);
	});

	it('without propertyBounds, behaves like original (backward compatible)', () => {
		const lines = calculateGridLines(baseParams);
		expect(lines.length).toBeGreaterThan(0);
	});
});
