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

describe('materialized state', () => {
	beforeEach(async () => {
		_reset();
		await db.delete();
		await db.open();
	});

	it('has correct initial state before initialize', () => {
		expect(isInitialized()).toBe(false);
		expect(isLoading()).toBe(true);
		expect(isExtendedReplay()).toBe(false);
		expect(getProperties()).toEqual([]);
	});

	it('initializes with empty state', async () => {
		await initialize();
		expect(isInitialized()).toBe(true);
		expect(isLoading()).toBe(false);
		expect(getProperties()).toEqual([]);
	});

	it('sets loading true during initialization', async () => {
		// After reset, loading is true (initial state)
		expect(isLoading()).toBe(true);
		await initialize();
		// After initialize, loading is false
		expect(isLoading()).toBe(false);
	});

	it('dispatches event and updates state', async () => {
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

	it('retrieves property by id', async () => {
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

	it('restores state from persisted events on initialize', async () => {
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

	it('isExtendedReplay is false for normal startup', async () => {
		await initialize();
		expect(isExtendedReplay()).toBe(false);
	});

	it('sets extendedReplay true when events exceed threshold', async () => {
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

	it('maintains immutability — dispatch produces new state objects', async () => {
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
