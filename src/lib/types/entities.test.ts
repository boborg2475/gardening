import { describe, it, expect } from 'vitest';
import { DimensionsSchema, PropertySchema } from './entities.js';

describe('DimensionsSchema', () => {
	it('accepts valid dimensions', () => {
		expect(DimensionsSchema.safeParse({ width: 10, length: 20, unit: 'ft' }).success).toBe(true);
		expect(DimensionsSchema.safeParse({ width: 5, length: 3, unit: 'm' }).success).toBe(true);
	});

	it('rejects zero or negative width', () => {
		expect(DimensionsSchema.safeParse({ width: 0, length: 10, unit: 'ft' }).success).toBe(false);
		expect(DimensionsSchema.safeParse({ width: -1, length: 10, unit: 'ft' }).success).toBe(false);
	});

	it('rejects zero or negative length', () => {
		expect(DimensionsSchema.safeParse({ width: 10, length: 0, unit: 'ft' }).success).toBe(false);
		expect(DimensionsSchema.safeParse({ width: 10, length: -5, unit: 'm' }).success).toBe(false);
	});

	it('rejects invalid unit values', () => {
		expect(DimensionsSchema.safeParse({ width: 10, length: 10, unit: 'km' }).success).toBe(false);
		expect(DimensionsSchema.safeParse({ width: 10, length: 10, unit: '' }).success).toBe(false);
	});

	it('rejects missing fields', () => {
		expect(DimensionsSchema.safeParse({ width: 10, length: 10 }).success).toBe(false);
		expect(DimensionsSchema.safeParse({}).success).toBe(false);
	});
});

describe('PropertySchema', () => {
	it('accepts a minimal property', () => {
		expect(
			PropertySchema.safeParse({ id: crypto.randomUUID(), name: 'Garden' }).success
		).toBe(true);
	});

	it('rejects empty property name', () => {
		expect(
			PropertySchema.safeParse({ id: crypto.randomUUID(), name: '' }).success
		).toBe(false);
	});

	it('accepts a long property name', () => {
		expect(
			PropertySchema.safeParse({ id: crypto.randomUUID(), name: 'A very long garden name' })
				.success
		).toBe(true);
	});

	it('rejects northOrientation below 0', () => {
		expect(
			PropertySchema.safeParse({
				id: crypto.randomUUID(),
				name: 'Garden',
				northOrientation: -1
			}).success
		).toBe(false);
	});

	it('rejects northOrientation above 360', () => {
		expect(
			PropertySchema.safeParse({
				id: crypto.randomUUID(),
				name: 'Garden',
				northOrientation: 361
			}).success
		).toBe(false);
	});

	it('accepts northOrientation at boundaries', () => {
		expect(
			PropertySchema.safeParse({
				id: crypto.randomUUID(),
				name: 'Garden',
				northOrientation: 0
			}).success
		).toBe(true);
		expect(
			PropertySchema.safeParse({
				id: crypto.randomUUID(),
				name: 'Garden',
				northOrientation: 360
			}).success
		).toBe(true);
	});

	it('rejects invalid UUID for id', () => {
		expect(PropertySchema.safeParse({ id: 'not-a-uuid', name: 'Garden' }).success).toBe(false);
	});
});
