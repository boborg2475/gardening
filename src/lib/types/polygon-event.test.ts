/**
 * Story 1.5: Polygon Drawing Tool
 *
 * Traceability:
 * AC#5 (FR4) -> 'PolygonDrawnSchema accepts valid polygon with 3+ points', 'PolygonDrawnSchema accepts polygon with many points', 'PolygonDrawnSchema rejects polygon with fewer than 3 points', 'PolygonDrawnSchema rejects points with missing coordinates', 'PolygonDrawnSchema rejects non-numeric coordinates', 'EventSchema accepts PolygonDrawn as a valid event type'
 */

import { describe, it, expect } from 'vitest';
import { PolygonDrawnSchema, EventSchema } from './events.js';

const validBase = {
	id: crypto.randomUUID(),
	entityId: crypto.randomUUID(),
	entityType: 'property' as const,
	timestamp: new Date().toISOString()
};

describe('Story 1.5 AC#5: PolygonDrawnSchema validation (FR4)', () => {
	it('PolygonDrawnSchema accepts valid polygon with 3+ points (AC#5, FR4)', () => {
		const result = PolygonDrawnSchema.safeParse({
			...validBase,
			type: 'PolygonDrawn',
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

	it('PolygonDrawnSchema accepts polygon with many points (AC#5, FR4)', () => {
		const points = Array.from({ length: 20 }, (_, i) => ({
			x: Math.cos((i * 2 * Math.PI) / 20) * 100,
			y: Math.sin((i * 2 * Math.PI) / 20) * 100
		}));
		const result = PolygonDrawnSchema.safeParse({
			...validBase,
			type: 'PolygonDrawn',
			payload: { points }
		});
		expect(result.success).toBe(true);
	});

	it('PolygonDrawnSchema rejects polygon with fewer than 3 points (AC#5, FR4)', () => {
		const result = PolygonDrawnSchema.safeParse({
			...validBase,
			type: 'PolygonDrawn',
			payload: {
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 0 }
				]
			}
		});
		expect(result.success).toBe(false);
	});

	it('PolygonDrawnSchema rejects empty points array (AC#5, FR4)', () => {
		const result = PolygonDrawnSchema.safeParse({
			...validBase,
			type: 'PolygonDrawn',
			payload: { points: [] }
		});
		expect(result.success).toBe(false);
	});

	it('PolygonDrawnSchema rejects points with missing coordinates (AC#5, FR4)', () => {
		const result = PolygonDrawnSchema.safeParse({
			...validBase,
			type: 'PolygonDrawn',
			payload: {
				points: [{ x: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }]
			}
		});
		expect(result.success).toBe(false);
	});

	it('PolygonDrawnSchema rejects non-numeric coordinates (AC#5, FR4)', () => {
		const result = PolygonDrawnSchema.safeParse({
			...validBase,
			type: 'PolygonDrawn',
			payload: {
				points: [
					{ x: 'a', y: 'b' },
					{ x: 100, y: 0 },
					{ x: 100, y: 100 }
				]
			}
		});
		expect(result.success).toBe(false);
	});

	it('PolygonDrawnSchema rejects missing payload (AC#5, FR4)', () => {
		const result = PolygonDrawnSchema.safeParse({
			...validBase,
			type: 'PolygonDrawn'
		});
		expect(result.success).toBe(false);
	});
});

describe('Story 1.5 AC#5: EventSchema includes PolygonDrawn (FR4)', () => {
	it('EventSchema accepts PolygonDrawn as a valid event type (AC#5, FR4)', () => {
		const result = EventSchema.safeParse({
			...validBase,
			type: 'PolygonDrawn',
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

	it('EventSchema still accepts existing event types alongside PolygonDrawn (AC#5, FR4)', () => {
		// Ensure backward compatibility
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
	});
});
