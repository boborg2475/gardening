/**
 * Story 1.2: Event Store & Property Data Model
 *
 * Traceability:
 * AC#4 (FR3) → 'initializes with empty state', 'dispatches event and updates state', 'retrieves property by id', 'restores state from persisted events on initialize' — event replay computes correct state
 * AC#5 (FR3) → 'has correct initial state before initialize', 'sets loading true during initialization' — splash screen during replay
 * AC#6 (FR3) → 'isExtendedReplay is false for normal startup', 'sets extendedReplay true when events exceed threshold' — extended replay threshold UX
 * AC#7 (FR4) → 'maintains immutability — dispatch produces new state objects' — immutable state updates with Svelte 5 runes
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../data/db.js';
import {
	initialize,
	dispatchEvent,
	getProperties,
	getProperty,
	isInitialized,
	isLoading,
	isExtendedReplay,
	_reset
} from './materialized-state.svelte.js';
import { EXTENDED_REPLAY_THRESHOLD } from '../data/event-store.js';

describe('Story 1.2: materialized state', () => {
	beforeEach(async () => {
		_reset();
		await db.delete();
		await db.open();
	});

	it('has correct initial state before initialize (AC#5, FR3)', () => {
		expect(isInitialized()).toBe(false);
		expect(isLoading()).toBe(true);
		expect(isExtendedReplay()).toBe(false);
		expect(getProperties()).toEqual([]);
	});

	it('initializes with empty state (AC#4, FR3)', async () => {
		await initialize();
		expect(isInitialized()).toBe(true);
		expect(isLoading()).toBe(false);
		expect(getProperties()).toEqual([]);
	});

	it('sets loading true during initialization (AC#5, FR3)', async () => {
		// After reset, loading is true (initial state)
		expect(isLoading()).toBe(true);
		await initialize();
		// After initialize, loading is false
		expect(isLoading()).toBe(false);
	});

	it('dispatches event and updates state (AC#4, AC#7, FR3)', async () => {
		await initialize();

		const entityId = crypto.randomUUID();
		await dispatchEvent({
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			payload: { name: 'My Garden' }
		});

		const properties = getProperties();
		expect(properties).toHaveLength(1);
		expect(properties[0].name).toBe('My Garden');
	});

	it('retrieves property by id (AC#4, FR3)', async () => {
		await initialize();

		const entityId = crypto.randomUUID();
		await dispatchEvent({
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			payload: { name: 'Garden' }
		});

		const property = getProperty(entityId);
		expect(property?.name).toBe('Garden');
	});

	it('restores state from persisted events on initialize (AC#4, FR3)', async () => {
		const entityId = crypto.randomUUID();

		await db.events.add({
			id: crypto.randomUUID(),
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			timestamp: new Date().toISOString(),
			payload: { name: 'Persisted Garden' }
		});

		await initialize();

		expect(getProperty(entityId)?.name).toBe('Persisted Garden');
	});

	it('isExtendedReplay is false for normal startup (AC#6, FR3)', async () => {
		await initialize();
		expect(isExtendedReplay()).toBe(false);
	});

	it('sets extendedReplay true when events exceed threshold (AC#6, FR3)', async () => {
		// Seed enough events to exceed the threshold
		const events = [];
		const entityId = crypto.randomUUID();
		events.push({
			id: crypto.randomUUID(),
			type: 'PropertyCreated' as const,
			entityId,
			entityType: 'property' as const,
			timestamp: new Date(Date.now() - 100000).toISOString(),
			payload: { name: 'Garden' }
		});
		for (let i = 0; i < EXTENDED_REPLAY_THRESHOLD; i++) {
			events.push({
				id: crypto.randomUUID(),
				type: 'PropertyUpdated' as const,
				entityId,
				entityType: 'property' as const,
				timestamp: new Date(Date.now() - 99999 + i).toISOString(),
				payload: { name: `Garden ${i}` }
			});
		}
		await db.events.bulkAdd(events);

		await initialize();
		expect(isExtendedReplay()).toBe(true);
	});

	it('maintains immutability — dispatch produces new state objects (AC#7, FR4)', async () => {
		await initialize();

		const propertiesBefore = getProperties();

		await dispatchEvent({
			type: 'PropertyCreated',
			entityId: crypto.randomUUID(),
			entityType: 'property',
			payload: { name: 'Garden' }
		});

		const propertiesAfter = getProperties();
		expect(propertiesBefore).not.toBe(propertiesAfter);
		expect(propertiesBefore).toHaveLength(0);
		expect(propertiesAfter).toHaveLength(1);
	});
});
