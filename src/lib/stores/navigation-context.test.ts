/**
 * Traceability:
 * AC#1 (FR5)  → 'has default zoom level of 1', 'has default pan offset of {0,0}', 'has default grid scale of 1ft', 'getDefaultGridScale returns 1ft for ft unit', 'getDefaultGridScale returns 1m for m unit'
 * AC#2 (FR20) → 'setZoomLevel updates zoom level', 'clamps zoom at MIN_ZOOM (0.1)', 'clamps zoom at MAX_ZOOM (10)'
 * AC#3 (FR20) → (zoom clamping shared with AC#2)
 * AC#4 (FR20) → 'setPanOffset updates pan offset'
 * AC#5 (FR5)  → 'setGridScale updates grid scale', 'resetView restores all defaults'
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	createNavigationContext,
	getDefaultGridScale,
	MIN_ZOOM,
	MAX_ZOOM
} from './navigation-context.svelte.js';

describe('Story 1.4 AC#1: Navigation context default values (FR5)', () => {
	it('has default zoom level of 1 (AC#1, FR5)', () => {
		const ctx = createNavigationContext();
		expect(ctx.zoomLevel).toBe(1);
	});

	it('has default pan offset of {0,0} (AC#1, FR5)', () => {
		const ctx = createNavigationContext();
		expect(ctx.panOffset).toEqual({ x: 0, y: 0 });
	});

	it('has default grid scale of 1ft (AC#1, FR5)', () => {
		const ctx = createNavigationContext();
		expect(ctx.gridScale).toBe('1ft');
	});
});

describe('Story 1.4 AC#2: Zoom level management (FR20)', () => {
	it('setZoomLevel updates zoom level (AC#2, FR20)', () => {
		const ctx = createNavigationContext();
		ctx.setZoomLevel(2.5);
		expect(ctx.zoomLevel).toBe(2.5);
	});

	it('clamps zoom at MIN_ZOOM (0.1) (AC#2, FR20)', () => {
		expect(MIN_ZOOM).toBe(0.1);
		const ctx = createNavigationContext();
		ctx.setZoomLevel(0.01);
		expect(ctx.zoomLevel).toBe(MIN_ZOOM);
	});

	it('clamps zoom at MAX_ZOOM (10) (AC#2, FR20)', () => {
		expect(MAX_ZOOM).toBe(10);
		const ctx = createNavigationContext();
		ctx.setZoomLevel(50);
		expect(ctx.zoomLevel).toBe(MAX_ZOOM);
	});
});

describe('Story 1.4 AC#4: Pan offset management (FR20)', () => {
	it('setPanOffset updates pan offset (AC#4, FR20)', () => {
		const ctx = createNavigationContext();
		ctx.setPanOffset({ x: 100, y: -50 });
		expect(ctx.panOffset).toEqual({ x: 100, y: -50 });
	});
});

describe('Story 1.4 AC#5: Grid scale management (FR5)', () => {
	it('setGridScale updates grid scale (AC#5, FR5)', () => {
		const ctx = createNavigationContext();
		ctx.setGridScale('6in');
		expect(ctx.gridScale).toBe('6in');
	});

	it('resetView restores all defaults (AC#5, FR5)', () => {
		const ctx = createNavigationContext();
		ctx.setZoomLevel(5);
		ctx.setPanOffset({ x: 200, y: 300 });
		ctx.setGridScale('1cm');

		ctx.resetView();

		expect(ctx.zoomLevel).toBe(1);
		expect(ctx.panOffset).toEqual({ x: 0, y: 0 });
		expect(ctx.gridScale).toBe('1ft');
	});
});

describe('Story 1.4 AC#1: getDefaultGridScale helper (FR5)', () => {
	it('getDefaultGridScale returns 1ft for ft unit (AC#1, FR5)', () => {
		expect(getDefaultGridScale('ft')).toBe('1ft');
	});

	it('getDefaultGridScale returns 1m for m unit (AC#1, FR5)', () => {
		expect(getDefaultGridScale('m')).toBe('1m');
	});
});
