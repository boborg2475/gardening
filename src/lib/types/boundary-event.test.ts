/**
 * Story 1.7: Property Boundary Drawing on Grid — Schema Validation
 *
 * Traceability:
 * AC#2 (FR4) → 'PropertyBoundarySetSchema accepts valid boundary with 3 points',
 *               'PropertyBoundarySetSchema accepts boundary with many points',
 *               'PropertyBoundarySetSchema rejects fewer than 3 points',
 *               'PropertyBoundarySetSchema rejects empty points array'
 * AC#4 (FR6) → 'NorthOrientationSetSchema accepts 0 degrees',
 *               'NorthOrientationSetSchema accepts 180 degrees',
 *               'NorthOrientationSetSchema accepts 359 degrees',
 *               'NorthOrientationSetSchema rejects negative degrees',
 *               'NorthOrientationSetSchema rejects degrees >= 360'
 * AC#2,AC#4 (FR4,FR6) → 'EventSchema accepts PropertyBoundarySet',
 *                         'EventSchema accepts NorthOrientationSet',
 *                         'EventSchema still accepts existing event types'
 */

import { describe, it, expect } from 'vitest';
import { PropertyBoundarySetSchema, NorthOrientationSetSchema, EventSchema } from './events.js';

const validBase = {
	id: crypto.randomUUID(),
	entityId: crypto.randomUUID(),
	entityType: 'property' as const,
	timestamp: new Date().toISOString()
};

describe('Story 1.7 AC#2: PropertyBoundarySetSchema validation (FR4)', () => {
	it('PropertyBoundarySetSchema accepts valid boundary with 3 points (AC#2, FR4)', () => {
		const result = PropertyBoundarySetSchema.safeParse({
			...validBase,
			type: 'PropertyBoundarySet',
			payload: {
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 0 },
					{ x: 100, y: 100 }
				]
			}
		});
		expect(result.success).toBe(true);
	});

	it('PropertyBoundarySetSchema accepts boundary with many points (AC#2, FR4)', () => {
		const points = Array.from({ length: 50 }, (_, i) => ({
			x: Math.cos((i * 2 * Math.PI) / 50) * 200,
			y: Math.sin((i * 2 * Math.PI) / 50) * 200
		}));
		const result = PropertyBoundarySetSchema.safeParse({
			...validBase,
			type: 'PropertyBoundarySet',
			payload: { points }
		});
		expect(result.success).toBe(true);
	});

	it('PropertyBoundarySetSchema rejects fewer than 3 points (AC#2, FR4)', () => {
		const result = PropertyBoundarySetSchema.safeParse({
			...validBase,
			type: 'PropertyBoundarySet',
			payload: {
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 0 }
				]
			}
		});
		expect(result.success).toBe(false);
	});

	it('PropertyBoundarySetSchema rejects empty points array (AC#2, FR4)', () => {
		const result = PropertyBoundarySetSchema.safeParse({
			...validBase,
			type: 'PropertyBoundarySet',
			payload: { points: [] }
		});
		expect(result.success).toBe(false);
	});

	it('PropertyBoundarySetSchema rejects missing payload (AC#2, FR4)', () => {
		const result = PropertyBoundarySetSchema.safeParse({
			...validBase,
			type: 'PropertyBoundarySet'
		});
		expect(result.success).toBe(false);
	});

	it('PropertyBoundarySetSchema rejects points with missing coordinates (AC#2, FR4)', () => {
		const result = PropertyBoundarySetSchema.safeParse({
			...validBase,
			type: 'PropertyBoundarySet',
			payload: {
				points: [{ x: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }]
			}
		});
		expect(result.success).toBe(false);
	});
});

describe('Story 1.7 AC#4: NorthOrientationSetSchema validation (FR6)', () => {
	it('NorthOrientationSetSchema accepts 0 degrees (AC#4, FR6)', () => {
		const result = NorthOrientationSetSchema.safeParse({
			...validBase,
			type: 'NorthOrientationSet',
			payload: { degrees: 0 }
		});
		expect(result.success).toBe(true);
	});

	it('NorthOrientationSetSchema accepts 180 degrees (AC#4, FR6)', () => {
		const result = NorthOrientationSetSchema.safeParse({
			...validBase,
			type: 'NorthOrientationSet',
			payload: { degrees: 180 }
		});
		expect(result.success).toBe(true);
	});

	it('NorthOrientationSetSchema accepts 359 degrees (AC#4, FR6)', () => {
		const result = NorthOrientationSetSchema.safeParse({
			...validBase,
			type: 'NorthOrientationSet',
			payload: { degrees: 359 }
		});
		expect(result.success).toBe(true);
	});

	it('NorthOrientationSetSchema rejects negative degrees (AC#4, FR6)', () => {
		const result = NorthOrientationSetSchema.safeParse({
			...validBase,
			type: 'NorthOrientationSet',
			payload: { degrees: -1 }
		});
		expect(result.success).toBe(false);
	});

	it('NorthOrientationSetSchema rejects degrees >= 360 (AC#4, FR6)', () => {
		const result = NorthOrientationSetSchema.safeParse({
			...validBase,
			type: 'NorthOrientationSet',
			payload: { degrees: 360 }
		});
		expect(result.success).toBe(false);
	});

	it('NorthOrientationSetSchema rejects non-numeric degrees (AC#4, FR6)', () => {
		const result = NorthOrientationSetSchema.safeParse({
			...validBase,
			type: 'NorthOrientationSet',
			payload: { degrees: 'north' }
		});
		expect(result.success).toBe(false);
	});
});

describe('Story 1.7 AC#2, AC#4: EventSchema includes new event types (FR4, FR6)', () => {
	it('EventSchema accepts PropertyBoundarySet (AC#2, FR4)', () => {
		const result = EventSchema.safeParse({
			...validBase,
			type: 'PropertyBoundarySet',
			payload: {
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 0 },
					{ x: 100, y: 100 }
				]
			}
		});
		expect(result.success).toBe(true);
	});

	it('EventSchema accepts NorthOrientationSet (AC#4, FR6)', () => {
		const result = EventSchema.safeParse({
			...validBase,
			type: 'NorthOrientationSet',
			payload: { degrees: 45 }
		});
		expect(result.success).toBe(true);
	});

	it('EventSchema still accepts existing event types (AC#2, FR4)', () => {
		expect(
			EventSchema.safeParse({
				...validBase,
				type: 'PropertyCreated',
				payload: { name: 'Garden' }
			}).success
		).toBe(true);

		expect(
			EventSchema.safeParse({
				...validBase,
				type: 'PropertyUpdated',
				payload: { name: 'Updated' }
			}).success
		).toBe(true);

		expect(
			EventSchema.safeParse({
				...validBase,
				type: 'PolygonDrawn',
				payload: {
					points: [
						{ x: 0, y: 0 },
						{ x: 10, y: 0 },
						{ x: 10, y: 10 }
					]
				}
			}).success
		).toBe(true);
	});
});
