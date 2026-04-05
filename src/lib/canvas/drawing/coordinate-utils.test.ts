/**
 * Story 1.5: Polygon Drawing Tool
 *
 * Traceability:
 * AC#1 (FR4) -> 'screenToCanvas converts screen point at default pan/zoom', 'screenToCanvas accounts for stage pan offset', 'screenToCanvas accounts for zoom scale'
 * AC#4 (FR4) -> 'canvasToScreen converts canvas point at default pan/zoom', 'canvasToScreen accounts for stage pan offset', 'canvasToScreen accounts for zoom scale', 'round-trip screenToCanvas then canvasToScreen is identity', 'round-trip canvasToScreen then screenToCanvas is identity'
 * AC#3 (FR21) -> 'getHitRadius returns base radius at scale 1', 'getHitRadius scales inversely with zoom', 'BASE_HIT_RADIUS_PX is 15'
 */

import { describe, it, expect } from 'vitest';
import {
	screenToCanvas,
	canvasToScreen,
	getHitRadius,
	BASE_HIT_RADIUS_PX
} from './coordinate-utils.js';

describe('Story 1.5 AC#1, AC#4: screenToCanvas (FR4)', () => {
	it('screenToCanvas converts screen point at default pan/zoom (AC#1, FR4)', () => {
		const result = screenToCanvas({ x: 200, y: 300 }, { x: 0, y: 0 }, 1);
		expect(result).toEqual({ x: 200, y: 300 });
	});

	it('screenToCanvas accounts for stage pan offset (AC#1, FR4)', () => {
		// Stage panned 50px right and 30px down means canvas origin shifted
		const result = screenToCanvas({ x: 200, y: 300 }, { x: 50, y: 30 }, 1);
		expect(result).toEqual({ x: 150, y: 270 });
	});

	it('screenToCanvas accounts for zoom scale (AC#1, FR4)', () => {
		// At 2x zoom, a screen pixel is half a canvas unit
		const result = screenToCanvas({ x: 200, y: 300 }, { x: 0, y: 0 }, 2);
		expect(result).toEqual({ x: 100, y: 150 });
	});

	it('screenToCanvas accounts for both pan and zoom (AC#1, FR4)', () => {
		// Pan offset (100, 50), zoom 2x
		// canvas = (screen - pan) / scale = (300 - 100) / 2 = 100, (400 - 50) / 2 = 175
		const result = screenToCanvas({ x: 300, y: 400 }, { x: 100, y: 50 }, 2);
		expect(result).toEqual({ x: 100, y: 175 });
	});
});

describe('Story 1.5 AC#4: canvasToScreen (FR4)', () => {
	it('canvasToScreen converts canvas point at default pan/zoom (AC#4, FR4)', () => {
		const result = canvasToScreen({ x: 200, y: 300 }, { x: 0, y: 0 }, 1);
		expect(result).toEqual({ x: 200, y: 300 });
	});

	it('canvasToScreen accounts for stage pan offset (AC#4, FR4)', () => {
		const result = canvasToScreen({ x: 150, y: 270 }, { x: 50, y: 30 }, 1);
		expect(result).toEqual({ x: 200, y: 300 });
	});

	it('canvasToScreen accounts for zoom scale (AC#4, FR4)', () => {
		const result = canvasToScreen({ x: 100, y: 150 }, { x: 0, y: 0 }, 2);
		expect(result).toEqual({ x: 200, y: 300 });
	});
});

describe('Story 1.5 AC#1, AC#4: round-trip identity (FR4)', () => {
	it('round-trip screenToCanvas then canvasToScreen is identity (AC#4, FR4)', () => {
		const screenPoint = { x: 250, y: 375 };
		const stagePos = { x: 40, y: 60 };
		const scale = 1.5;

		const canvasPoint = screenToCanvas(screenPoint, stagePos, scale);
		const roundTrip = canvasToScreen(canvasPoint, stagePos, scale);

		expect(roundTrip.x).toBeCloseTo(screenPoint.x, 10);
		expect(roundTrip.y).toBeCloseTo(screenPoint.y, 10);
	});

	it('round-trip canvasToScreen then screenToCanvas is identity (AC#4, FR4)', () => {
		const canvasPoint = { x: 120, y: 80 };
		const stagePos = { x: -20, y: 15 };
		const scale = 0.75;

		const screenPoint = canvasToScreen(canvasPoint, stagePos, scale);
		const roundTrip = screenToCanvas(screenPoint, stagePos, scale);

		expect(roundTrip.x).toBeCloseTo(canvasPoint.x, 10);
		expect(roundTrip.y).toBeCloseTo(canvasPoint.y, 10);
	});
});

describe('Story 1.5 AC#3: getHitRadius (FR21)', () => {
	it('BASE_HIT_RADIUS_PX is 15 (AC#3, FR21)', () => {
		expect(BASE_HIT_RADIUS_PX).toBe(15);
	});

	it('getHitRadius returns base radius at scale 1 (AC#3, FR21)', () => {
		const radius = getHitRadius(15, 1);
		expect(radius).toBe(15);
	});

	it('getHitRadius scales inversely with zoom (AC#3, FR21)', () => {
		// At 2x zoom, hit radius in canvas space should be smaller
		const radius = getHitRadius(15, 2);
		expect(radius).toBe(7.5);
	});

	it('getHitRadius at low zoom is larger (AC#3, FR21)', () => {
		const radius = getHitRadius(15, 0.5);
		expect(radius).toBe(30);
	});
});
