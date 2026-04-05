/**
 * Story 1.3: Property Creation
 *
 * Traceability:
 * AC#1 (FR1) → 'creates a property with a valid name and returns it', 'commits a PropertyCreated event to the event store', 'updates materialized state after creation' — property created with UUID, event committed
 * AC#2 (FR1) → 'creates a property with a valid name and returns it' (dimensions undefined), 'creates a property with metric dimensions' — progressive detail, no validation error for missing dimensions
 * AC#3 (FR1) → 'creates a property with name and dimensions', 'creates a property with metric dimensions', 'rejects negative dimensions', 'rejects zero-width dimensions', 'rejects invalid unit in dimensions' — dimensions stored correctly
 * AC#1 (validation) → 'rejects an empty name', 'rejects a whitespace-only name', 'accepts a name at exactly 500 characters', 'rejects a name exceeding 500 characters' — name validation
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../data/db.js';
import { _reset } from '../stores/materialized-state.svelte.js';
import { createProperty } from './property.js';

describe('Story 1.3: createProperty', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
	});

	it('creates a property with a valid name and returns it (AC#1, AC#2, FR1)', async () => {
		const property = await createProperty({ name: 'My Garden' });

		expect(property.id).toBeDefined();
		expect(property.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
		expect(property.name).toBe('My Garden');
		expect(property.dimensions).toBeUndefined();
	});

	it('creates a property with name and dimensions (AC#3, FR1)', async () => {
		const property = await createProperty({
			name: 'Back Yard',
			dimensions: { width: 50, length: 100, unit: 'ft' }
		});

		expect(property.name).toBe('Back Yard');
		expect(property.dimensions).toEqual({ width: 50, length: 100, unit: 'ft' });
	});

	it('creates a property with metric dimensions (AC#3, FR1)', async () => {
		const property = await createProperty({
			name: 'Jardin',
			dimensions: { width: 15, length: 30, unit: 'm' }
		});

		expect(property.dimensions).toEqual({ width: 15, length: 30, unit: 'm' });
	});

	it('commits a PropertyCreated event to the event store (AC#1, FR1)', async () => {
		const property = await createProperty({ name: 'My Garden' });

		const events = await db.events.where('entityId').equals(property.id).toArray();
		expect(events).toHaveLength(1);
		expect(events[0].type).toBe('PropertyCreated');
		expect(events[0].payload.name).toBe('My Garden');
	});

	it('rejects an empty name (AC#1, FR1)', async () => {
		await expect(createProperty({ name: '' })).rejects.toThrow();
	});

	it('rejects a whitespace-only name (AC#1, FR1)', async () => {
		await expect(createProperty({ name: '   ' })).rejects.toThrow();
	});

	it('rejects negative dimensions (AC#3, FR1)', async () => {
		await expect(
			createProperty({
				name: 'Garden',
				dimensions: { width: -10, length: 50, unit: 'ft' }
			})
		).rejects.toThrow();
	});

	it('rejects zero-width dimensions (AC#3, FR1)', async () => {
		await expect(
			createProperty({
				name: 'Garden',
				dimensions: { width: 0, length: 50, unit: 'ft' }
			})
		).rejects.toThrow();
	});

	it('accepts a name at exactly 500 characters (AC#1, FR1)', async () => {
		const property = await createProperty({ name: 'a'.repeat(500) });
		expect(property.name).toBe('a'.repeat(500));
	});

	it('rejects a name exceeding 500 characters (AC#1, FR1)', async () => {
		await expect(createProperty({ name: 'a'.repeat(501) })).rejects.toThrow();
	});

	it('rejects invalid unit in dimensions (AC#3, FR1)', async () => {
		await expect(
			createProperty({
				name: 'Garden',
				dimensions: { width: 10, length: 50, unit: 'km' as 'ft' }
			})
		).rejects.toThrow();
	});

	it('updates materialized state after creation (AC#1, FR1)', async () => {
		const { getProperties } = await import('../stores/materialized-state.svelte.js');

		const property = await createProperty({ name: 'My Garden' });
		const properties = getProperties();

		expect(properties).toHaveLength(1);
		expect(properties[0].id).toBe(property.id);
		expect(properties[0].name).toBe('My Garden');
	});
});
