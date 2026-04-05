/**
 * Story 1.2: Event Store & Property Data Model
 *
 * Traceability:
 * AC#1 (FR1) → all tests — geometry types are part of the database schema for property entities
 * AC#2 (FR2) → 'accepts a valid point', 'accepts a polygon with exactly 3 points' — valid data accepted by Zod
 * AC#3 (FR2) → 'rejects a point missing coordinates', 'rejects a polygon with fewer than 3 points', 'rejects a polygon with no points array' — invalid data rejected by Zod
 */

import { describe, it, expect } from 'vitest';
import { PointSchema, PolygonSchema } from './geometry.js';

describe('Story 1.2 AC#1: PointSchema (FR1)', () => {
	it('accepts a valid point (AC#2, FR2)', () => {
		expect(PointSchema.safeParse({ x: 1, y: 2 }).success).toBe(true);
	});

	it('rejects a point missing coordinates (AC#3, FR2)', () => {
		expect(PointSchema.safeParse({ x: 1 }).success).toBe(false);
		expect(PointSchema.safeParse({ y: 2 }).success).toBe(false);
		expect(PointSchema.safeParse({}).success).toBe(false);
	});
});

describe('Story 1.2 AC#1: PolygonSchema (FR1)', () => {
	it('accepts a polygon with exactly 3 points (AC#2, FR2)', () => {
		const result = PolygonSchema.safeParse({
			points: [
				{ x: 0, y: 0 },
				{ x: 1, y: 0 },
				{ x: 0, y: 1 }
			]
		});
		expect(result.success).toBe(true);
	});

	it('rejects a polygon with fewer than 3 points (AC#3, FR2)', () => {
		expect(
			PolygonSchema.safeParse({
				points: [
					{ x: 0, y: 0 },
					{ x: 1, y: 1 }
				]
			}).success
		).toBe(false);
	});

	it('rejects a polygon with no points array (AC#3, FR2)', () => {
		expect(PolygonSchema.safeParse({}).success).toBe(false);
	});
});
