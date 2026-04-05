/**
 * Story 1.6: Drawing Precision Tools — Precision Tools Store
 *
 * Traceability:
 * AC#3 (FR16) -> 'setSnapToGrid toggles grid snapping', 'setSnapScale updates snap scale', 'snap scale defaults to 1ft'
 * AC#4 (FR17) -> 'setSnapAssist toggles snap assist independently'
 * AC#5 (FR18) -> 'setLoupe toggles loupe independently'
 * AC#6 (FR19) -> 'setTwoStageConfirm toggles two-stage confirmation independently'
 * Defaults    -> 'all toggles default to false', 'each toggle works independently of others'
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	createPrecisionToolsStore,
	type PrecisionToolsStore
} from './precision-tools-store.svelte.js';

describe('Story 1.6 Defaults: precision tools store initial state', () => {
	let store: PrecisionToolsStore;

	beforeEach(() => {
		store = createPrecisionToolsStore();
	});

	it('snapToGridEnabled defaults to false (AC#3, FR16)', () => {
		expect(store.snapToGridEnabled).toBe(false);
	});

	it('snapScale defaults to 1ft (AC#3, FR16)', () => {
		expect(store.snapScale).toBe('1ft');
	});

	it('snapAssistEnabled defaults to false (AC#4, FR17)', () => {
		expect(store.snapAssistEnabled).toBe(false);
	});

	it('loupeEnabled defaults to false (AC#5, FR18)', () => {
		expect(store.loupeEnabled).toBe(false);
	});

	it('twoStageConfirmEnabled defaults to false (AC#6, FR19)', () => {
		expect(store.twoStageConfirmEnabled).toBe(false);
	});
});

describe('Story 1.6 AC#3: setSnapToGrid and setSnapScale (FR16)', () => {
	let store: PrecisionToolsStore;

	beforeEach(() => {
		store = createPrecisionToolsStore();
	});

	it('setSnapToGrid enables grid snapping (AC#3, FR16)', () => {
		store.setSnapToGrid(true);
		expect(store.snapToGridEnabled).toBe(true);
	});

	it('setSnapToGrid disables grid snapping (AC#3, FR16)', () => {
		store.setSnapToGrid(true);
		store.setSnapToGrid(false);
		expect(store.snapToGridEnabled).toBe(false);
	});

	it('setSnapScale updates snap scale to 6in (AC#3, FR16)', () => {
		store.setSnapScale('6in');
		expect(store.snapScale).toBe('6in');
	});

	it('setSnapScale updates snap scale to 1in (AC#3, FR16)', () => {
		store.setSnapScale('1in');
		expect(store.snapScale).toBe('1in');
	});

	it('setSnapScale updates snap scale to freehand (AC#3, FR16)', () => {
		store.setSnapScale('freehand');
		expect(store.snapScale).toBe('freehand');
	});

	it('setSnapScale updates snap scale to metric values (AC#3, FR16)', () => {
		store.setSnapScale('1m');
		expect(store.snapScale).toBe('1m');

		store.setSnapScale('10cm');
		expect(store.snapScale).toBe('10cm');

		store.setSnapScale('1cm');
		expect(store.snapScale).toBe('1cm');
	});
});

describe('Story 1.6 AC#4: setSnapAssist (FR17)', () => {
	let store: PrecisionToolsStore;

	beforeEach(() => {
		store = createPrecisionToolsStore();
	});

	it('setSnapAssist enables snap assist (AC#4, FR17)', () => {
		store.setSnapAssist(true);
		expect(store.snapAssistEnabled).toBe(true);
	});

	it('setSnapAssist disables snap assist (AC#4, FR17)', () => {
		store.setSnapAssist(true);
		store.setSnapAssist(false);
		expect(store.snapAssistEnabled).toBe(false);
	});
});

describe('Story 1.6 AC#5: setLoupe (FR18)', () => {
	let store: PrecisionToolsStore;

	beforeEach(() => {
		store = createPrecisionToolsStore();
	});

	it('setLoupe enables loupe (AC#5, FR18)', () => {
		store.setLoupe(true);
		expect(store.loupeEnabled).toBe(true);
	});

	it('setLoupe disables loupe (AC#5, FR18)', () => {
		store.setLoupe(true);
		store.setLoupe(false);
		expect(store.loupeEnabled).toBe(false);
	});
});

describe('Story 1.6 AC#6: setTwoStageConfirm (FR19)', () => {
	let store: PrecisionToolsStore;

	beforeEach(() => {
		store = createPrecisionToolsStore();
	});

	it('setTwoStageConfirm enables two-stage confirmation (AC#6, FR19)', () => {
		store.setTwoStageConfirm(true);
		expect(store.twoStageConfirmEnabled).toBe(true);
	});

	it('setTwoStageConfirm disables two-stage confirmation (AC#6, FR19)', () => {
		store.setTwoStageConfirm(true);
		store.setTwoStageConfirm(false);
		expect(store.twoStageConfirmEnabled).toBe(false);
	});
});

describe('Story 1.6: each toggle works independently of others', () => {
	let store: PrecisionToolsStore;

	beforeEach(() => {
		store = createPrecisionToolsStore();
	});

	it('enabling snapToGrid does not affect other toggles (AC#3, FR16)', () => {
		store.setSnapToGrid(true);

		expect(store.snapToGridEnabled).toBe(true);
		expect(store.snapAssistEnabled).toBe(false);
		expect(store.loupeEnabled).toBe(false);
		expect(store.twoStageConfirmEnabled).toBe(false);
	});

	it('enabling loupe does not affect other toggles (AC#5, FR18)', () => {
		store.setLoupe(true);

		expect(store.snapToGridEnabled).toBe(false);
		expect(store.snapAssistEnabled).toBe(false);
		expect(store.loupeEnabled).toBe(true);
		expect(store.twoStageConfirmEnabled).toBe(false);
	});

	it('all toggles can be enabled simultaneously (AC#3-6)', () => {
		store.setSnapToGrid(true);
		store.setSnapAssist(true);
		store.setLoupe(true);
		store.setTwoStageConfirm(true);

		expect(store.snapToGridEnabled).toBe(true);
		expect(store.snapAssistEnabled).toBe(true);
		expect(store.loupeEnabled).toBe(true);
		expect(store.twoStageConfirmEnabled).toBe(true);
	});
});
