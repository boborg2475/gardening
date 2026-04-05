/**
 * Story 1.6: Drawing Precision Tools — Snap Functions
 *
 * Traceability:
 * AC#3 (FR16) -> 'snapToGrid snaps to nearest 1ft grid line', 'snapToGrid snaps to nearest 6in grid line', 'snapToGrid snaps to nearest 1in grid line', 'snapToGrid snaps to nearest 1m grid line', 'snapToGrid snaps to nearest 10cm grid line', 'snapToGrid snaps to nearest 1cm grid line', 'freehand scale returns original point unchanged', 'getGridSpacingForScale returns correct pixel spacing for each scale'
 * AC#4 (FR17) -> 'snapToCorner finds nearest corner within snap radius', 'snapToCorner returns undefined when no corner in range', 'snapToEdge projects point onto nearest edge', 'snapToEdge returns undefined when no edge in range', 'resolveSnap prioritizes corner over edge over grid', 'resolveSnap returns type none when all snapping disabled'
 * Edge cases  -> 'point equidistant between two grid lines snaps deterministically', 'snapToGrid with zero spacing returns original point', 'snapToCorner with empty points returns undefined', 'snapToEdge with empty edges returns undefined'
 */

import { describe, it, expect } from 'vitest';
import {
	getGridSpacingForScale,
	snapToGrid,
	snapToCorner,
	snapToEdge,
	resolveSnap
} from './snap.js';
import type { SnapScale, SnapTarget, SnapConfig, SnapContext } from './snap.js';
import { BASE_PIXELS_PER_FOOT, BASE_PIXELS_PER_METER } from '../types/canvas.js';

describe('Story 1.6 AC#3: getGridSpacingForScale (FR16)', () => {
	it('returns BASE_PIXELS_PER_FOOT for 1ft scale (AC#3, FR16)', () => {
		const spacing = getGridSpacingForScale('1ft');
		expect(spacing).toBe(BASE_PIXELS_PER_FOOT);
	});

	it('returns half of BASE_PIXELS_PER_FOOT for 6in scale (AC#3, FR16)', () => {
		const spacing = getGridSpacingForScale('6in');
		expect(spacing).toBe(BASE_PIXELS_PER_FOOT / 2);
	});

	it('returns BASE_PIXELS_PER_FOOT / 12 for 1in scale (AC#3, FR16)', () => {
		const spacing = getGridSpacingForScale('1in');
		expect(spacing).toBe(BASE_PIXELS_PER_FOOT / 12);
	});

	it('returns BASE_PIXELS_PER_METER for 1m scale (AC#3, FR16)', () => {
		const spacing = getGridSpacingForScale('1m');
		expect(spacing).toBe(BASE_PIXELS_PER_METER);
	});

	it('returns BASE_PIXELS_PER_METER / 10 for 10cm scale (AC#3, FR16)', () => {
		const spacing = getGridSpacingForScale('10cm');
		expect(spacing).toBe(BASE_PIXELS_PER_METER / 10);
	});

	it('returns BASE_PIXELS_PER_METER / 100 for 1cm scale (AC#3, FR16)', () => {
		const spacing = getGridSpacingForScale('1cm');
		expect(spacing).toBe(BASE_PIXELS_PER_METER / 100);
	});

	it('returns 0 for freehand scale (AC#3, FR16)', () => {
		const spacing = getGridSpacingForScale('freehand');
		expect(spacing).toBe(0);
	});

	it('applies zoom factor when provided (AC#3, FR16)', () => {
		const zoom = 2;
		const spacing = getGridSpacingForScale('1ft', zoom);
		expect(spacing).toBe(BASE_PIXELS_PER_FOOT * zoom);
	});
});

describe('Story 1.6 AC#3: snapToGrid (FR16)', () => {
	it('snaps to nearest 1ft grid line (AC#3, FR16)', () => {
		const gridSpacing = BASE_PIXELS_PER_FOOT; // 30px
		const result = snapToGrid({ x: 17, y: 43 }, gridSpacing);

		expect(result.type).toBe('grid');
		expect(result.snappedPoint.x).toBe(Math.round(17 / gridSpacing) * gridSpacing);
		expect(result.snappedPoint.y).toBe(Math.round(43 / gridSpacing) * gridSpacing);
	});

	it('snaps to nearest 6in grid line (AC#3, FR16)', () => {
		const gridSpacing = BASE_PIXELS_PER_FOOT / 2; // 15px
		const result = snapToGrid({ x: 8, y: 22 }, gridSpacing);

		expect(result.type).toBe('grid');
		expect(result.snappedPoint.x).toBe(Math.round(8 / gridSpacing) * gridSpacing);
		expect(result.snappedPoint.y).toBe(Math.round(22 / gridSpacing) * gridSpacing);
	});

	it('snaps to nearest 1in grid line (AC#3, FR16)', () => {
		const gridSpacing = BASE_PIXELS_PER_FOOT / 12; // 2.5px
		const result = snapToGrid({ x: 3.7, y: 6.1 }, gridSpacing);

		expect(result.type).toBe('grid');
		expect(result.snappedPoint.x).toBe(Math.round(3.7 / gridSpacing) * gridSpacing);
		expect(result.snappedPoint.y).toBe(Math.round(6.1 / gridSpacing) * gridSpacing);
	});

	it('preserves original point in result (AC#3, FR16)', () => {
		const original = { x: 17, y: 43 };
		const result = snapToGrid(original, BASE_PIXELS_PER_FOOT);

		expect(result.originalPoint).toEqual(original);
	});

	it('calculates distance between original and snapped point (AC#3, FR16)', () => {
		const result = snapToGrid({ x: 0, y: 0 }, BASE_PIXELS_PER_FOOT);

		expect(result.distance).toBe(0);
	});

	it('freehand scale returns original point unchanged (AC#3, FR16)', () => {
		// When gridSpacing is 0, no snapping occurs
		const original = { x: 17.3, y: 43.7 };
		const result = snapToGrid(original, 0);

		expect(result.snappedPoint).toEqual(original);
		expect(result.type).toBe('none');
	});

	it('point equidistant between two grid lines snaps deterministically (AC#3, FR16)', () => {
		const gridSpacing = BASE_PIXELS_PER_FOOT; // 30px
		// Exactly between 30 and 60
		const result = snapToGrid({ x: 45, y: 0 }, gridSpacing);

		expect(result.type).toBe('grid');
		// Math.round(1.5) = 2 in JS, so should snap to 60
		expect(result.snappedPoint.x).toBe(60);
	});
});

describe('Story 1.6 AC#4: snapToCorner (FR17)', () => {
	it('finds nearest corner within snap radius (AC#4, FR17)', () => {
		const existingPoints = [
			{ x: 100, y: 100 },
			{ x: 200, y: 200 },
			{ x: 300, y: 300 }
		];

		const result = snapToCorner({ x: 103, y: 98 }, existingPoints, 10);

		expect(result).toBeDefined();
		expect(result!.type).toBe('corner');
		expect(result!.snappedPoint).toEqual({ x: 100, y: 100 });
	});

	it('returns undefined when no corner in range (AC#4, FR17)', () => {
		const existingPoints = [
			{ x: 100, y: 100 },
			{ x: 200, y: 200 }
		];

		const result = snapToCorner({ x: 50, y: 50 }, existingPoints, 10);

		expect(result).toBeUndefined();
	});

	it('finds the closest corner when multiple are in range (AC#4, FR17)', () => {
		const existingPoints = [
			{ x: 100, y: 100 },
			{ x: 105, y: 105 }
		];

		const result = snapToCorner({ x: 103, y: 103 }, existingPoints, 10);

		expect(result).toBeDefined();
		expect(result!.snappedPoint).toEqual({ x: 105, y: 105 });
	});

	it('returns undefined with empty points array (AC#4, FR17)', () => {
		const result = snapToCorner({ x: 50, y: 50 }, [], 10);
		expect(result).toBeUndefined();
	});

	it('preserves original point in result (AC#4, FR17)', () => {
		const original = { x: 103, y: 98 };
		const result = snapToCorner(original, [{ x: 100, y: 100 }], 10);

		expect(result).toBeDefined();
		expect(result!.originalPoint).toEqual(original);
	});

	it('calculates distance to snapped corner (AC#4, FR17)', () => {
		const result = snapToCorner({ x: 103, y: 104 }, [{ x: 100, y: 100 }], 10);

		expect(result).toBeDefined();
		expect(result!.distance).toBeCloseTo(5, 0);
	});
});

describe('Story 1.6 AC#4: snapToEdge (FR17)', () => {
	it('projects point onto nearest edge perpendicularly (AC#4, FR17)', () => {
		const edges = [{ p1: { x: 0, y: 100 }, p2: { x: 200, y: 100 } }];

		const result = snapToEdge({ x: 50, y: 95 }, edges, 10);

		expect(result).toBeDefined();
		expect(result!.type).toBe('edge');
		expect(result!.snappedPoint.x).toBeCloseTo(50, 0);
		expect(result!.snappedPoint.y).toBeCloseTo(100, 0);
	});

	it('returns undefined when no edge in range (AC#4, FR17)', () => {
		const edges = [{ p1: { x: 0, y: 100 }, p2: { x: 200, y: 100 } }];

		const result = snapToEdge({ x: 50, y: 50 }, edges, 10);

		expect(result).toBeUndefined();
	});

	it('returns undefined with empty edges array (AC#4, FR17)', () => {
		const result = snapToEdge({ x: 50, y: 50 }, [], 10);
		expect(result).toBeUndefined();
	});

	it('does not snap beyond edge endpoints (AC#4, FR17)', () => {
		const edges = [{ p1: { x: 100, y: 100 }, p2: { x: 200, y: 100 } }];

		// Point is near the line extension but beyond the edge
		const result = snapToEdge({ x: 50, y: 98 }, edges, 10);

		// Should not snap since projection falls outside the segment
		expect(result).toBeUndefined();
	});

	it('preserves original point in result (AC#4, FR17)', () => {
		const edges = [{ p1: { x: 0, y: 100 }, p2: { x: 200, y: 100 } }];
		const original = { x: 50, y: 95 };

		const result = snapToEdge(original, edges, 10);

		expect(result).toBeDefined();
		expect(result!.originalPoint).toEqual(original);
	});
});

describe('Story 1.6 AC#4: resolveSnap priority (FR17)', () => {
	const defaultConfig: SnapConfig = {
		gridEnabled: true,
		gridScale: '1ft',
		assistEnabled: true,
		snapRadius: 10
	};

	it('prioritizes corner over edge over grid (AC#4, FR17)', () => {
		const context: SnapContext = {
			existingPoints: [{ x: 100, y: 100 }],
			edges: [{ p1: { x: 0, y: 100 }, p2: { x: 200, y: 100 } }]
		};

		// Point near corner at (100, 100) and also near edge
		const result = resolveSnap({ x: 103, y: 98 }, defaultConfig, context);

		expect(result.type).toBe('corner');
		expect(result.snappedPoint).toEqual({ x: 100, y: 100 });
	});

	it('falls back to edge when no corner in range (AC#4, FR17)', () => {
		const context: SnapContext = {
			existingPoints: [{ x: 500, y: 500 }], // far away
			edges: [{ p1: { x: 0, y: 100 }, p2: { x: 200, y: 100 } }]
		};

		const result = resolveSnap({ x: 50, y: 95 }, defaultConfig, context);

		expect(result.type).toBe('edge');
	});

	it('falls back to grid when no corner or edge in range (AC#4, FR17)', () => {
		const context: SnapContext = {
			existingPoints: [{ x: 500, y: 500 }],
			edges: [{ p1: { x: 500, y: 500 }, p2: { x: 600, y: 500 } }]
		};

		const result = resolveSnap({ x: 17, y: 43 }, defaultConfig, context);

		expect(result.type).toBe('grid');
	});

	it('returns type none when all snapping disabled (AC#4, FR17)', () => {
		const disabledConfig: SnapConfig = {
			gridEnabled: false,
			gridScale: '1ft',
			assistEnabled: false,
			snapRadius: 10
		};
		const context: SnapContext = {
			existingPoints: [{ x: 100, y: 100 }],
			edges: []
		};

		const result = resolveSnap({ x: 103, y: 98 }, disabledConfig, context);

		expect(result.type).toBe('none');
		expect(result.snappedPoint).toEqual({ x: 103, y: 98 });
	});

	it('skips corner/edge snap when assist disabled but still snaps to grid (AC#4, FR17)', () => {
		const gridOnlyConfig: SnapConfig = {
			gridEnabled: true,
			gridScale: '1ft',
			assistEnabled: false,
			snapRadius: 10
		};
		const context: SnapContext = {
			existingPoints: [{ x: 100, y: 100 }],
			edges: []
		};

		const result = resolveSnap({ x: 103, y: 98 }, gridOnlyConfig, context);

		// Should not snap to corner since assist is disabled
		expect(result.type).toBe('grid');
	});

	it('returns original point with type none when grid is freehand and assist disabled (AC#4, FR17)', () => {
		const freehandConfig: SnapConfig = {
			gridEnabled: true,
			gridScale: 'freehand',
			assistEnabled: false,
			snapRadius: 10
		};
		const context: SnapContext = {
			existingPoints: [],
			edges: []
		};

		const result = resolveSnap({ x: 17.3, y: 43.7 }, freehandConfig, context);

		expect(result.type).toBe('none');
		expect(result.snappedPoint).toEqual({ x: 17.3, y: 43.7 });
	});
});
