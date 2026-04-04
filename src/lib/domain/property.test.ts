import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../data/db.js';
import { _reset } from '../stores/materialized-state.svelte.js';
import { createProperty } from './property.js';

describe('createProperty', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
	});

	it('creates a property with a valid name and returns it', async () => {
		const property = await createProperty({ name: 'My Garden' });

		expect(property.id).toBeDefined();
		expect(property.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
		expect(property.name).toBe('My Garden');
		expect(property.dimensions).toBeUndefined();
	});

	it('creates a property with name and dimensions', async () => {
		const property = await createProperty({
			name: 'Back Yard',
			dimensions: { width: 50, length: 100, unit: 'ft' }
		});

		expect(property.name).toBe('Back Yard');
		expect(property.dimensions).toEqual({ width: 50, length: 100, unit: 'ft' });
	});

	it('creates a property with metric dimensions', async () => {
		const property = await createProperty({
			name: 'Jardin',
			dimensions: { width: 15, length: 30, unit: 'm' }
		});

		expect(property.dimensions).toEqual({ width: 15, length: 30, unit: 'm' });
	});

	it('commits a PropertyCreated event to the event store', async () => {
		const property = await createProperty({ name: 'My Garden' });

		const events = await db.events.where('entityId').equals(property.id).toArray();
		expect(events).toHaveLength(1);
		expect(events[0].type).toBe('PropertyCreated');
		expect(events[0].payload.name).toBe('My Garden');
	});

	it('rejects an empty name', async () => {
		await expect(createProperty({ name: '' })).rejects.toThrow();
	});

	it('rejects a whitespace-only name', async () => {
		await expect(createProperty({ name: '   ' })).rejects.toThrow();
	});

	it('rejects negative dimensions', async () => {
		await expect(
			createProperty({
				name: 'Garden',
				dimensions: { width: -10, length: 50, unit: 'ft' }
			})
		).rejects.toThrow();
	});

	it('rejects zero-width dimensions', async () => {
		await expect(
			createProperty({
				name: 'Garden',
				dimensions: { width: 0, length: 50, unit: 'ft' }
			})
		).rejects.toThrow();
	});

	it('rejects invalid unit in dimensions', async () => {
		await expect(
			createProperty({
				name: 'Garden',
				dimensions: { width: 10, length: 50, unit: 'km' as 'ft' }
			})
		).rejects.toThrow();
	});

	it('updates materialized state after creation', async () => {
		const { getProperties } = await import('../stores/materialized-state.svelte.js');

		const property = await createProperty({ name: 'My Garden' });
		const properties = getProperties();

		expect(properties).toHaveLength(1);
		expect(properties[0].id).toBe(property.id);
		expect(properties[0].name).toBe('My Garden');
	});
});
