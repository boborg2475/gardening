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
	isExtendedReplay
} from './materialized-state.svelte.js';

describe('materialized state', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('initializes with empty state', async () => {
		await initialize();
		expect(isInitialized()).toBe(true);
		expect(isLoading()).toBe(false);
		expect(getProperties()).toEqual([]);
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

		// Commit directly to db (simulating previous session)
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

	it('loading transitions to false and initialized to true after initialize', async () => {
		await initialize();
		expect(isLoading()).toBe(false);
		expect(isInitialized()).toBe(true);
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
