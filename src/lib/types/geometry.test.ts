import { describe, it, expect } from 'vitest';
import { PointSchema, PolygonSchema } from './geometry.js';

describe('PointSchema', () => {
	it('accepts a valid point', () => {
		expect(PointSchema.safeParse({ x: 1, y: 2 }).success).toBe(true);
	});

	it('rejects a point missing coordinates', () => {
		expect(PointSchema.safeParse({ x: 1 }).success).toBe(false);
		expect(PointSchema.safeParse({ y: 2 }).success).toBe(false);
		expect(PointSchema.safeParse({}).success).toBe(false);
	});
});

describe('PolygonSchema', () => {
	it('accepts a polygon with exactly 3 points', () => {
		const result = PolygonSchema.safeParse({
			points: [
				{ x: 0, y: 0 },
				{ x: 1, y: 0 },
				{ x: 0, y: 1 }
			]
		});
		expect(result.success).toBe(true);
	});

	it('rejects a polygon with fewer than 3 points', () => {
		expect(
			PolygonSchema.safeParse({
				points: [
					{ x: 0, y: 0 },
					{ x: 1, y: 1 }
				]
			}).success
		).toBe(false);
	});

	it('rejects a polygon with no points array', () => {
		expect(PolygonSchema.safeParse({}).success).toBe(false);
	});
});
