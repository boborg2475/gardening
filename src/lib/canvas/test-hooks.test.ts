/**
 * Traceability:
 * AC#6 → 'setupTestHooks attaches __propertyMap to window in dev mode', 'getStageState returns stage dimensions and scale', 'getZoomLevel returns current zoom from navigation context', 'getPanOffset returns current pan from navigation context', 'does not attach __propertyMap in production mode'
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupTestHooks, type TestHooksAPI } from './test-hooks.js';

describe('Story 1.4 AC#6: Test hooks for Playwright', () => {
	beforeEach(() => {
		// Clean up any previously attached test hooks
		// @ts-expect-error — __propertyMap is only set in dev/test mode
		delete (globalThis as Record<string, unknown>).__propertyMap;
	});

	it('setupTestHooks attaches __propertyMap to window in dev mode (AC#6)', () => {
		const mockStage = { width: () => 800, height: () => 600 };
		const mockNavContext = {
			zoomLevel: 1,
			panOffset: { x: 0, y: 0 },
			gridScale: '1ft' as const
		};

		setupTestHooks({
			stage: mockStage as never,
			navigationContext: mockNavContext as never,
			mode: 'development'
		});

		// @ts-expect-error — __propertyMap attached dynamically
		const hooks = (globalThis as Record<string, unknown>).__propertyMap as TestHooksAPI;
		expect(hooks).toBeDefined();
	});

	it('getStageState returns stage dimensions and scale (AC#6)', () => {
		const mockStage = { width: () => 1024, height: () => 768 };
		const mockNavContext = {
			zoomLevel: 2,
			panOffset: { x: 10, y: 20 },
			gridScale: '6in' as const
		};

		setupTestHooks({
			stage: mockStage as never,
			navigationContext: mockNavContext as never,
			mode: 'development'
		});

		// @ts-expect-error — __propertyMap attached dynamically
		const hooks = (globalThis as Record<string, unknown>).__propertyMap as TestHooksAPI;
		const state = hooks.getStageState();

		expect(state.width).toBe(1024);
		expect(state.height).toBe(768);
		expect(state.gridScale).toBe('6in');
	});

	it('getZoomLevel returns current zoom from navigation context (AC#6)', () => {
		const mockStage = { width: () => 800, height: () => 600 };
		const mockNavContext = {
			zoomLevel: 3.5,
			panOffset: { x: 0, y: 0 },
			gridScale: '1ft' as const
		};

		setupTestHooks({
			stage: mockStage as never,
			navigationContext: mockNavContext as never,
			mode: 'development'
		});

		// @ts-expect-error — __propertyMap attached dynamically
		const hooks = (globalThis as Record<string, unknown>).__propertyMap as TestHooksAPI;
		expect(hooks.getZoomLevel()).toBe(3.5);
	});

	it('getPanOffset returns current pan from navigation context (AC#6)', () => {
		const mockStage = { width: () => 800, height: () => 600 };
		const mockNavContext = {
			zoomLevel: 1,
			panOffset: { x: -50, y: 75 },
			gridScale: '1m' as const
		};

		setupTestHooks({
			stage: mockStage as never,
			navigationContext: mockNavContext as never,
			mode: 'development'
		});

		// @ts-expect-error — __propertyMap attached dynamically
		const hooks = (globalThis as Record<string, unknown>).__propertyMap as TestHooksAPI;
		expect(hooks.getPanOffset()).toEqual({ x: -50, y: 75 });
	});

	it('does not attach __propertyMap in production mode (AC#6)', () => {
		const mockStage = { width: () => 800, height: () => 600 };
		const mockNavContext = {
			zoomLevel: 1,
			panOffset: { x: 0, y: 0 },
			gridScale: '1ft' as const
		};

		setupTestHooks({
			stage: mockStage as never,
			navigationContext: mockNavContext as never,
			mode: 'production'
		});

		// @ts-expect-error — __propertyMap should NOT be set
		expect((globalThis as Record<string, unknown>).__propertyMap).toBeUndefined();
	});
});
