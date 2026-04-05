/**
 * Story 1.2: Event Store & Property Data Model
 *
 * Traceability:
 * AC#2 (FR2) → 'accepts a name at exactly 500 characters', 'accepts a valid update with dimensions', 'accepts northOrientation at boundaries', 'accepts null for nullable fields', 'validates PropertyCreated events', 'validates PropertyUpdated events' — valid events accepted by Zod
 * AC#3 (FR2) → 'rejects a name exceeding 500 characters', 'rejects invalid dimension unit', 'rejects a name exceeding 500 characters in update', 'rejects invalid dimension unit in update', 'rejects dimensions with missing or invalid fields', 'rejects northOrientation outside 0-360', 'rejects unknown event types' — invalid events rejected by Zod
 */

import { describe, it, expect } from 'vitest';
import { PropertyCreatedSchema, PropertyUpdatedSchema, EventSchema } from './events.js';

const validBase = {
	id: crypto.randomUUID(),
	entityId: crypto.randomUUID(),
	entityType: 'property' as const,
	timestamp: new Date().toISOString()
};

describe('Story 1.2 AC#2, AC#3: PropertyCreatedSchema (FR2)', () => {
	it('accepts a name at exactly 500 characters (AC#2, FR2)', () => {
		const result = PropertyCreatedSchema.safeParse({
			...validBase,
			type: 'PropertyCreated',
			payload: { name: 'a'.repeat(500) }
		});
		expect(result.success).toBe(true);
	});

	it('rejects a name exceeding 500 characters (AC#3, FR2)', () => {
		const result = PropertyCreatedSchema.safeParse({
			...validBase,
			type: 'PropertyCreated',
			payload: { name: 'a'.repeat(501) }
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid dimension unit (AC#3, FR2)', () => {
		const result = PropertyCreatedSchema.safeParse({
			...validBase,
			type: 'PropertyCreated',
			payload: { name: 'G', dimensions: { width: 10, length: 10, unit: 'km' } }
		});
		expect(result.success).toBe(false);
	});
});

describe('Story 1.2 AC#2, AC#3: PropertyUpdatedSchema (FR2)', () => {
	it('rejects a name exceeding 500 characters in update (AC#3, FR2)', () => {
		const result = PropertyUpdatedSchema.safeParse({
			...validBase,
			type: 'PropertyUpdated',
			payload: { name: 'a'.repeat(501) }
		});
		expect(result.success).toBe(false);
	});

	it('accepts a valid update with dimensions (AC#2, FR2)', () => {
		const result = PropertyUpdatedSchema.safeParse({
			...validBase,
			type: 'PropertyUpdated',
			payload: { dimensions: { width: 10, length: 20, unit: 'ft' } }
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid dimension unit in update (AC#3, FR2)', () => {
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

	it('rejects dimensions with missing or invalid fields (AC#3, FR2)', () => {
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

	it('rejects northOrientation outside 0-360 (AC#3, FR2)', () => {
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

	it('accepts northOrientation at boundaries (AC#2, FR2)', () => {
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

	it('accepts null for nullable fields (AC#2, FR2)', () => {
		expect(
			PropertyUpdatedSchema.safeParse({
				...validBase,
				type: 'PropertyUpdated',
				payload: { dimensions: null, northOrientation: null }
			}).success
		).toBe(true);
	});
});

describe('Story 1.2 AC#2, AC#3: EventSchema discriminated union (FR2)', () => {
	it('validates PropertyCreated events (AC#2, FR2)', () => {
		expect(
			EventSchema.safeParse({
				...validBase,
				type: 'PropertyCreated',
				payload: { name: 'Garden' }
			}).success
		).toBe(true);
	});

	it('validates PropertyUpdated events (AC#2, FR2)', () => {
		expect(
			EventSchema.safeParse({
				...validBase,
				type: 'PropertyUpdated',
				payload: { name: 'Updated' }
			}).success
		).toBe(true);
	});

	it('rejects unknown event types (AC#3, FR2)', () => {
		expect(
			EventSchema.safeParse({
				...validBase,
				type: 'PropertyDeleted',
				payload: {}
			}).success
		).toBe(false);
	});
});
