import { describe, it, expect } from 'vitest';
import { PropertyCreatedSchema, PropertyUpdatedSchema, EventSchema } from './events.js';

const validBase = {
	id: crypto.randomUUID(),
	entityId: crypto.randomUUID(),
	entityType: 'property' as const,
	timestamp: new Date().toISOString()
};

describe('PropertyCreatedSchema', () => {
	it('accepts a name at exactly 500 characters', () => {
		const result = PropertyCreatedSchema.safeParse({
			...validBase,
			type: 'PropertyCreated',
			payload: { name: 'a'.repeat(500) }
		});
		expect(result.success).toBe(true);
	});

	it('rejects a name exceeding 500 characters', () => {
		const result = PropertyCreatedSchema.safeParse({
			...validBase,
			type: 'PropertyCreated',
			payload: { name: 'a'.repeat(501) }
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid dimension unit', () => {
		const result = PropertyCreatedSchema.safeParse({
			...validBase,
			type: 'PropertyCreated',
			payload: { name: 'G', dimensions: { width: 10, length: 10, unit: 'km' } }
		});
		expect(result.success).toBe(false);
	});
});

describe('PropertyUpdatedSchema', () => {
	it('rejects a name exceeding 500 characters in update', () => {
		const result = PropertyUpdatedSchema.safeParse({
			...validBase,
			type: 'PropertyUpdated',
			payload: { name: 'a'.repeat(501) }
		});
		expect(result.success).toBe(false);
	});

	it('accepts a valid update with dimensions', () => {
		const result = PropertyUpdatedSchema.safeParse({
			...validBase,
			type: 'PropertyUpdated',
			payload: { dimensions: { width: 10, length: 20, unit: 'ft' } }
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid dimension unit in update', () => {
		expect(
			PropertyUpdatedSchema.safeParse({
				...validBase,
				type: 'PropertyUpdated',
				payload: { dimensions: { width: 10, length: 10, unit: 'km' } }
			}).success
		).toBe(false);
		expect(
			PropertyUpdatedSchema.safeParse({
				...validBase,
				type: 'PropertyUpdated',
				payload: { dimensions: { width: 10, length: 10, unit: '' } }
			}).success
		).toBe(false);
	});

	it('rejects dimensions with missing or invalid fields', () => {
		expect(
			PropertyUpdatedSchema.safeParse({
				...validBase,
				type: 'PropertyUpdated',
				payload: { dimensions: {} }
			}).success
		).toBe(false);
		expect(
			PropertyUpdatedSchema.safeParse({
				...validBase,
				type: 'PropertyUpdated',
				payload: { dimensions: { width: 0, length: 10, unit: 'ft' } }
			}).success
		).toBe(false);
	});

	it('rejects northOrientation outside 0-360', () => {
		expect(
			PropertyUpdatedSchema.safeParse({
				...validBase,
				type: 'PropertyUpdated',
				payload: { northOrientation: -1 }
			}).success
		).toBe(false);
		expect(
			PropertyUpdatedSchema.safeParse({
				...validBase,
				type: 'PropertyUpdated',
				payload: { northOrientation: 361 }
			}).success
		).toBe(false);
	});

	it('accepts northOrientation at boundaries', () => {
		expect(
			PropertyUpdatedSchema.safeParse({
				...validBase,
				type: 'PropertyUpdated',
				payload: { northOrientation: 0 }
			}).success
		).toBe(true);
		expect(
			PropertyUpdatedSchema.safeParse({
				...validBase,
				type: 'PropertyUpdated',
				payload: { northOrientation: 360 }
			}).success
		).toBe(true);
	});

	it('accepts null for nullable fields', () => {
		expect(
			PropertyUpdatedSchema.safeParse({
				...validBase,
				type: 'PropertyUpdated',
				payload: { dimensions: null, northOrientation: null }
			}).success
		).toBe(true);
	});
});

describe('EventSchema discriminated union', () => {
	it('validates PropertyCreated events', () => {
		expect(
			EventSchema.safeParse({
				...validBase,
				type: 'PropertyCreated',
				payload: { name: 'Garden' }
			}).success
		).toBe(true);
	});

	it('validates PropertyUpdated events', () => {
		expect(
			EventSchema.safeParse({
				...validBase,
				type: 'PropertyUpdated',
				payload: { name: 'Updated' }
			}).success
		).toBe(true);
	});

	it('rejects unknown event types', () => {
		expect(
			EventSchema.safeParse({
				...validBase,
				type: 'PropertyDeleted',
				payload: {}
			}).success
		).toBe(false);
	});
});
