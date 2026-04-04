import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../data/db.js';
import {
	_reset,
	initialize,
	getProperties,
	getProperty
} from '../stores/materialized-state.svelte.js';
import { createProperty } from './property.js';

describe('property persistence and reload', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
	});

	it('restores a property from event store after re-initialization (AC #4)', async () => {
		// Create a property
		const created = await createProperty({ name: 'Persisted Garden' });

		// Reset in-memory state (simulates app reload)
		_reset();
		expect(getProperties()).toHaveLength(0);

		// Re-initialize from event store
		await initialize();

		// Property should be restored
		const properties = getProperties();
		expect(properties).toHaveLength(1);
		expect(properties[0].id).toBe(created.id);
		expect(properties[0].name).toBe('Persisted Garden');
	});

	it('restores a property with dimensions after re-initialization', async () => {
		const created = await createProperty({
			name: 'Measured Garden',
			dimensions: { width: 50, length: 100, unit: 'ft' }
		});

		_reset();
		await initialize();

		const restored = getProperty(created.id);
		expect(restored).toBeDefined();
		expect(restored!.name).toBe('Measured Garden');
		expect(restored!.dimensions).toEqual({ width: 50, length: 100, unit: 'ft' });
	});

	it('restores a property with undefined dimensions after re-initialization', async () => {
		const created = await createProperty({ name: 'Simple Garden' });

		_reset();
		await initialize();

		const restored = getProperty(created.id);
		expect(restored).toBeDefined();
		expect(restored!.dimensions).toBeUndefined();
	});
});
