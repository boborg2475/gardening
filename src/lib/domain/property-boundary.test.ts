/**
 * Story 1.7: Property Boundary Drawing on Grid — Domain Functions
 *
 * Traceability:
 * AC#2 (FR4) → 'commitPropertyBoundary dispatches PropertyBoundarySet event with correct points',
 *               'commitPropertyBoundary persists event to IndexedDB',
 *               'commitPropertyBoundary sets property.geometry in materialized state'
 * AC#4 (FR6) → 'setNorthOrientation dispatches NorthOrientationSet event with correct degrees',
 *               'setNorthOrientation persists event to IndexedDB',
 *               'setNorthOrientation updates property.northOrientation in materialized state'
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../data/db.js';
import { _reset, dispatchEvent, initialize } from '../stores/materialized-state.svelte.js';
import { createProperty } from './property.js';
import { commitPropertyBoundary, setNorthOrientation } from './property.js';

describe('Story 1.7 AC#2: commitPropertyBoundary (FR4)', () => {
	let propertyId: string;

	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
		await initialize();
		const property = await createProperty({ name: 'Boundary Test Garden' });
		propertyId = property.id;
	});

	it('commitPropertyBoundary dispatches PropertyBoundarySet event with correct points (AC#2, FR4)', async () => {
		const points = [
			{ x: 0, y: 0 },
			{ x: 200, y: 0 },
			{ x: 200, y: 150 },
			{ x: 0, y: 150 }
		];

		const event = await commitPropertyBoundary(dispatchEvent, propertyId, points);

		expect(event.type).toBe('PropertyBoundarySet');
		expect(event.entityId).toBe(propertyId);
		expect(event.entityType).toBe('property');
		expect(event.payload.points).toEqual(points);
	});

	it('commitPropertyBoundary persists event to IndexedDB (AC#2, FR4)', async () => {
		const points = [
			{ x: 10, y: 20 },
			{ x: 30, y: 40 },
			{ x: 50, y: 60 }
		];

		await commitPropertyBoundary(dispatchEvent, propertyId, points);

		const events = await db.events.where('entityId').equals(propertyId).toArray();
		const boundaryEvents = events.filter((e) => e.type === 'PropertyBoundarySet');
		expect(boundaryEvents).toHaveLength(1);
		expect(boundaryEvents[0].payload.points).toEqual(points);
	});

	it('commitPropertyBoundary sets property.geometry in materialized state (AC#2, FR4)', async () => {
		const { getProperty } = await import('../stores/materialized-state.svelte.js');
		const points = [
			{ x: 0, y: 0 },
			{ x: 100, y: 0 },
			{ x: 100, y: 100 }
		];

		await commitPropertyBoundary(dispatchEvent, propertyId, points);

		const property = getProperty(propertyId);
		expect(property).toBeDefined();
		expect(property!.geometry).toEqual({ points });
	});
});

describe('Story 1.7 AC#4: setNorthOrientation (FR6)', () => {
	let propertyId: string;

	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
		await initialize();
		const property = await createProperty({ name: 'North Test Garden' });
		propertyId = property.id;
	});

	it('setNorthOrientation dispatches NorthOrientationSet event with correct degrees (AC#4, FR6)', async () => {
		const event = await setNorthOrientation(dispatchEvent, propertyId, 45);

		expect(event.type).toBe('NorthOrientationSet');
		expect(event.entityId).toBe(propertyId);
		expect(event.entityType).toBe('property');
		expect(event.payload.degrees).toBe(45);
	});

	it('setNorthOrientation persists event to IndexedDB (AC#4, FR6)', async () => {
		await setNorthOrientation(dispatchEvent, propertyId, 270);

		const events = await db.events.where('entityId').equals(propertyId).toArray();
		const orientationEvents = events.filter((e) => e.type === 'NorthOrientationSet');
		expect(orientationEvents).toHaveLength(1);
		expect(orientationEvents[0].payload.degrees).toBe(270);
	});

	it('setNorthOrientation updates property.northOrientation in materialized state (AC#4, FR6)', async () => {
		const { getProperty } = await import('../stores/materialized-state.svelte.js');

		await setNorthOrientation(dispatchEvent, propertyId, 90);

		const property = getProperty(propertyId);
		expect(property).toBeDefined();
		expect(property!.northOrientation).toBe(90);
	});
});
