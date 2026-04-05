/**
 * Story 1.2: Event Store & Property Data Model
 *
 * Traceability:
 * AC#1 (FR1) → all tests — entity schemas define the database structure for properties
 * AC#2 (FR2) → 'accepts valid dimensions', 'accepts a minimal property', 'accepts a long property name', 'accepts northOrientation at boundaries' — valid entities accepted by Zod
 * AC#3 (FR2) → 'rejects zero or negative width', 'rejects zero or negative length', 'rejects invalid unit values', 'rejects missing fields', 'rejects empty property name', 'rejects northOrientation below 0', 'rejects northOrientation above 360', 'rejects invalid UUID for id' — invalid entities rejected by Zod
 */

import { describe, it, expect } from 'vitest';
import { DimensionsSchema, PropertySchema } from './entities.js';

describe('Story 1.2 AC#1: DimensionsSchema (FR1)', () => {
	it('accepts valid dimensions (AC#2, FR2)', () => {
		expect(DimensionsSchema.safeParse({ width: 10, length: 20, unit: 'ft' }).success).toBe(true);
		expect(DimensionsSchema.safeParse({ width: 5, length: 3, unit: 'm' }).success).toBe(true);
	});

	it('rejects zero or negative width (AC#3, FR2)', () => {
		expect(DimensionsSchema.safeParse({ width: 0, length: 10, unit: 'ft' }).success).toBe(false);
		expect(DimensionsSchema.safeParse({ width: -1, length: 10, unit: 'ft' }).success).toBe(false);
	});

	it('rejects zero or negative length (AC#3, FR2)', () => {
		expect(DimensionsSchema.safeParse({ width: 10, length: 0, unit: 'ft' }).success).toBe(false);
		expect(DimensionsSchema.safeParse({ width: 10, length: -5, unit: 'm' }).success).toBe(false);
	});

	it('rejects invalid unit values (AC#3, FR2)', () => {
		expect(DimensionsSchema.safeParse({ width: 10, length: 10, unit: 'km' }).success).toBe(false);
		expect(DimensionsSchema.safeParse({ width: 10, length: 10, unit: '' }).success).toBe(false);
	});

	it('rejects missing fields (AC#3, FR2)', () => {
		expect(DimensionsSchema.safeParse({ width: 10, length: 10 }).success).toBe(false);
		expect(DimensionsSchema.safeParse({}).success).toBe(false);
	});
});

describe('Story 1.2 AC#1: PropertySchema (FR1)', () => {
	it('accepts a minimal property (AC#2, FR2)', () => {
		expect(PropertySchema.safeParse({ id: crypto.randomUUID(), name: 'Garden' }).success).toBe(
			true
		);
	});

	it('rejects empty property name (AC#3, FR2)', () => {
		expect(PropertySchema.safeParse({ id: crypto.randomUUID(), name: '' }).success).toBe(false);
	});

	it('accepts a long property name (AC#2, FR2)', () => {
		expect(
			PropertySchema.safeParse({ id: crypto.randomUUID(), name: 'A very long garden name' }).success
		).toBe(true);
	});

	it('rejects northOrientation below 0 (AC#3, FR2)', () => {
		expect(
			PropertySchema.safeParse({
				id: crypto.randomUUID(),
				name: 'Garden',
				northOrientation: -1
			}).success
		).toBe(false);
	});

	it('rejects northOrientation above 360 (AC#3, FR2)', () => {
		expect(
			PropertySchema.safeParse({
				id: crypto.randomUUID(),
				name: 'Garden',
				northOrientation: 361
			}).success
		).toBe(false);
	});

	it('accepts northOrientation at boundaries (AC#2, FR2)', () => {
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

	it('rejects invalid UUID for id (AC#3, FR2)', () => {
		expect(PropertySchema.safeParse({ id: 'not-a-uuid', name: 'Garden' }).success).toBe(false);
	});
});
