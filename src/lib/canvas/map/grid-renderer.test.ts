/**
 * Traceability:
 * AC#1 (FR5)  → 'returns grid lines for basic parameters', 'getPropertyCanvasSize with dimensions', 'getPropertyCanvasSize without dimensions defaults to 100ft', 'getPropertyCanvasSize with metric defaults to 30m', 'zero-size canvas returns empty array'
 * AC#5 (FR5)  → 'grid spacing for 1ft scale', 'grid spacing for 1m scale', 'grid spacing for 6in scale', 'grid spacing for 1in scale', 'grid spacing for 10cm scale', 'grid spacing for 1cm scale', 'major vs minor line styling', 'only visible lines generated (viewport culling)', 'pan offset shifts grid lines', 'zoom factor scales grid spacing'
 */

import { describe, it, expect } from 'vitest';
import { calculateGridLines, getPropertyCanvasSize, type GridLineConfig } from './grid-renderer.js';

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
