/**
 * Story 1.6: Drawing Precision Tools — Loupe Magnifier
 *
 * Traceability:
 * AC#5 (FR18) -> 'calculateLoupePosition places loupe above touch point', 'calculateLoupePosition offset determines vertical distance', 'calculateLoupeViewport returns correct source rect', 'calculateLoupeViewport magnification controls viewport size', 'clampLoupePosition keeps loupe fully within canvas bounds', 'clampLoupePosition does not modify position when already in bounds'
 * Constants   -> 'LOUPE_RADIUS is 60', 'LOUPE_OFFSET is 80', 'LOUPE_MAGNIFICATION is 3'
 */

import { describe, it, expect } from 'vitest';
import {
	LOUPE_RADIUS,
	LOUPE_OFFSET,
	LOUPE_MAGNIFICATION,
	calculateLoupePosition,
	calculateLoupeViewport,
	clampLoupePosition
} from './loupe.js';

describe('Story 1.6 AC#5: Loupe constants (FR18)', () => {
	it('LOUPE_RADIUS is 60 (AC#5, FR18)', () => {
		expect(LOUPE_RADIUS).toBe(60);
	});

	it('LOUPE_OFFSET is 80 (AC#5, FR18)', () => {
		expect(LOUPE_OFFSET).toBe(80);
	});

	it('LOUPE_MAGNIFICATION is 3 (AC#5, FR18)', () => {
		expect(LOUPE_MAGNIFICATION).toBe(3);
	});
});

describe('Story 1.6 AC#5: calculateLoupePosition (FR18)', () => {
	it('places loupe above touch point (AC#5, FR18)', () => {
		const touchPoint = { x: 200, y: 300 };
		const position = calculateLoupePosition(touchPoint, LOUPE_RADIUS, LOUPE_OFFSET);

		// Loupe should be above (lower y value) the touch point
		expect(position.y).toBeLessThan(touchPoint.y);
		expect(position.x).toBe(touchPoint.x);
	});

	it('offset determines vertical distance from touch point (AC#5, FR18)', () => {
		const touchPoint = { x: 200, y: 300 };
		const position = calculateLoupePosition(touchPoint, LOUPE_RADIUS, LOUPE_OFFSET);

		// The loupe center should be offset pixels above the touch point
		expect(position.y).toBe(touchPoint.y - LOUPE_OFFSET);
	});

	it('uses custom offset values correctly (AC#5, FR18)', () => {
		const touchPoint = { x: 100, y: 400 };
		const customOffset = 120;
		const position = calculateLoupePosition(touchPoint, 50, customOffset);

		expect(position.y).toBe(400 - customOffset);
		expect(position.x).toBe(100);
	});
});

describe('Story 1.6 AC#5: calculateLoupeViewport (FR18)', () => {
	it('returns correct source rect centered on touch point (AC#5, FR18)', () => {
		const touchPoint = { x: 200, y: 300 };
		const viewportSize = LOUPE_RADIUS * 2; // diameter
		const viewport = calculateLoupeViewport(touchPoint, LOUPE_MAGNIFICATION, viewportSize);

		// The viewport should be centered on the touch point
		expect(viewport.x + viewport.width / 2).toBeCloseTo(touchPoint.x, 1);
		expect(viewport.y + viewport.height / 2).toBeCloseTo(touchPoint.y, 1);
	});

	it('magnification controls viewport size inversely (AC#5, FR18)', () => {
		const touchPoint = { x: 200, y: 300 };
		const viewportSize = 120;

		const viewport3x = calculateLoupeViewport(touchPoint, 3, viewportSize);
		const viewport2x = calculateLoupeViewport(touchPoint, 2, viewportSize);

		// Higher magnification = smaller source viewport
		expect(viewport3x.width).toBeLessThan(viewport2x.width);
		expect(viewport3x.height).toBeLessThan(viewport2x.height);
	});

	it('viewport width equals viewportSize / magnification (AC#5, FR18)', () => {
		const touchPoint = { x: 200, y: 300 };
		const viewportSize = 120;
		const magnification = 3;

		const viewport = calculateLoupeViewport(touchPoint, magnification, viewportSize);

		expect(viewport.width).toBe(viewportSize / magnification);
		expect(viewport.height).toBe(viewportSize / magnification);
	});
});

describe('Story 1.6 AC#5: clampLoupePosition (FR18)', () => {
	it('keeps loupe fully within canvas bounds when near top edge (AC#5, FR18)', () => {
		// Loupe center would place it above canvas
		const loupeCenter = { x: 200, y: 30 };
		const clamped = clampLoupePosition(loupeCenter, 800, 600, LOUPE_RADIUS);

		expect(clamped.y).toBeGreaterThanOrEqual(LOUPE_RADIUS);
	});

	it('keeps loupe fully within canvas bounds when near left edge (AC#5, FR18)', () => {
		const loupeCenter = { x: 20, y: 300 };
		const clamped = clampLoupePosition(loupeCenter, 800, 600, LOUPE_RADIUS);

		expect(clamped.x).toBeGreaterThanOrEqual(LOUPE_RADIUS);
	});

	it('keeps loupe fully within canvas bounds when near right edge (AC#5, FR18)', () => {
		const loupeCenter = { x: 780, y: 300 };
		const clamped = clampLoupePosition(loupeCenter, 800, 600, LOUPE_RADIUS);

		expect(clamped.x).toBeLessThanOrEqual(800 - LOUPE_RADIUS);
	});

	it('keeps loupe fully within canvas bounds when near bottom edge (AC#5, FR18)', () => {
		const loupeCenter = { x: 400, y: 580 };
		const clamped = clampLoupePosition(loupeCenter, 800, 600, LOUPE_RADIUS);

		expect(clamped.y).toBeLessThanOrEqual(600 - LOUPE_RADIUS);
	});

	it('does not modify position when already in bounds (AC#5, FR18)', () => {
		const loupeCenter = { x: 400, y: 300 };
		const clamped = clampLoupePosition(loupeCenter, 800, 600, LOUPE_RADIUS);

		expect(clamped).toEqual(loupeCenter);
	});

	it('clamps both axes simultaneously when in corner (AC#5, FR18)', () => {
		const loupeCenter = { x: 10, y: 10 };
		const clamped = clampLoupePosition(loupeCenter, 800, 600, LOUPE_RADIUS);

		expect(clamped.x).toBeGreaterThanOrEqual(LOUPE_RADIUS);
		expect(clamped.y).toBeGreaterThanOrEqual(LOUPE_RADIUS);
	});
});
