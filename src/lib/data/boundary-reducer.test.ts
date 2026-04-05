/**
 * Story 1.7: Property Boundary Drawing on Grid — Reducer Integration
 *
 * Traceability:
 * AC#2 (FR4) → 'PropertyBoundarySet sets property.geometry on matching entity',
 *               'PropertyBoundarySet ignores non-existent entity'
 * AC#4 (FR6) → 'NorthOrientationSet sets property.northOrientation on matching entity',
 *               'NorthOrientationSet ignores non-existent entity'
 * AC#6 (FR4, FR6) → 'State rebuilt from event sequence: create → set boundary → set orientation',
 *                     'State rebuilt via commitEvent and replayEvents'
 * Immutability → 'PropertyBoundarySet produces new state object',
 *                 'NorthOrientationSet produces new state object'
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db.js';
import { applyEvent, createEmptyState, commitEvent, replayEvents } from './event-store.js';

const makeEvent = (overrides: Record<string, unknown>) => ({
	id: crypto.randomUUID(),
	entityId: crypto.randomUUID(),
	entityType: 'property' as const,
	timestamp: new Date().toISOString(),
	...overrides
});

describe('Story 1.7 AC#2: PropertyBoundarySet reducer (FR4)', () => {
	it('PropertyBoundarySet sets property.geometry on matching entity (AC#2, FR4)', () => {
		const entityId = crypto.randomUUID();
		let state = applyEvent(
			createEmptyState(),
			makeEvent({
				entityId,
				type: 'PropertyCreated',
				payload: { name: 'Garden' }
			}) as never
		);

		state = applyEvent(
			state,
			makeEvent({
				entityId,
				type: 'PropertyBoundarySet',
				payload: {
					points: [
						{ x: 0, y: 0 },
						{ x: 100, y: 0 },
						{ x: 100, y: 100 }
					]
				}
			}) as never
		);

		const property = state.properties.get(entityId);
		expect(property).toBeDefined();
		expect(property!.geometry).toEqual({
			points: [
				{ x: 0, y: 0 },
				{ x: 100, y: 0 },
				{ x: 100, y: 100 }
			]
		});
	});

	it('PropertyBoundarySet ignores non-existent entity (AC#2, FR4)', () => {
		const state = applyEvent(
			createEmptyState(),
			makeEvent({
				type: 'PropertyBoundarySet',
				payload: {
					points: [
						{ x: 0, y: 0 },
						{ x: 100, y: 0 },
						{ x: 100, y: 100 }
					]
				}
			}) as never
		);

		expect(state.properties.size).toBe(0);
	});

	it('PropertyBoundarySet produces new state object (AC#2, FR4)', () => {
		const entityId = crypto.randomUUID();
		const state1 = applyEvent(
			createEmptyState(),
			makeEvent({
				entityId,
				type: 'PropertyCreated',
				payload: { name: 'Garden' }
			}) as never
		);

		const state2 = applyEvent(
			state1,
			makeEvent({
				entityId,
				type: 'PropertyBoundarySet',
				payload: {
					points: [
						{ x: 0, y: 0 },
						{ x: 50, y: 0 },
						{ x: 50, y: 50 }
					]
				}
			}) as never
		);

		expect(state1).not.toBe(state2);
		expect(state1.properties).not.toBe(state2.properties);
		expect(state1.properties.get(entityId)?.geometry).toBeUndefined();
		expect(state2.properties.get(entityId)?.geometry).toBeDefined();
	});
});

describe('Story 1.7 AC#4: NorthOrientationSet reducer (FR6)', () => {
	it('NorthOrientationSet sets property.northOrientation on matching entity (AC#4, FR6)', () => {
		const entityId = crypto.randomUUID();
		let state = applyEvent(
			createEmptyState(),
			makeEvent({
				entityId,
				type: 'PropertyCreated',
				payload: { name: 'Garden' }
			}) as never
		);

		state = applyEvent(
			state,
			makeEvent({
				entityId,
				type: 'NorthOrientationSet',
				payload: { degrees: 45 }
			}) as never
		);

		const property = state.properties.get(entityId);
		expect(property).toBeDefined();
		expect(property!.northOrientation).toBe(45);
	});

	it('NorthOrientationSet ignores non-existent entity (AC#4, FR6)', () => {
		const state = applyEvent(
			createEmptyState(),
			makeEvent({
				type: 'NorthOrientationSet',
				payload: { degrees: 90 }
			}) as never
		);

		expect(state.properties.size).toBe(0);
	});

	it('NorthOrientationSet produces new state object (AC#4, FR6)', () => {
		const entityId = crypto.randomUUID();
		const state1 = applyEvent(
			createEmptyState(),
			makeEvent({
				entityId,
				type: 'PropertyCreated',
				payload: { name: 'Garden' }
			}) as never
		);

		const state2 = applyEvent(
			state1,
			makeEvent({
				entityId,
				type: 'NorthOrientationSet',
				payload: { degrees: 180 }
			}) as never
		);

		expect(state1).not.toBe(state2);
		expect(state1.properties).not.toBe(state2.properties);
		expect(state1.properties.get(entityId)?.northOrientation).toBeUndefined();
		expect(state2.properties.get(entityId)?.northOrientation).toBe(180);
	});
});

describe('Story 1.7 AC#6: State rebuilt from full event sequence (FR4, FR6)', () => {
	it('State rebuilt from event sequence: create → set boundary → set orientation (AC#6, FR4, FR6)', () => {
		const entityId = crypto.randomUUID();
		const points = [
			{ x: 0, y: 0 },
			{ x: 200, y: 0 },
			{ x: 200, y: 200 },
			{ x: 0, y: 200 }
		];

		let state = createEmptyState();

		state = applyEvent(
			state,
			makeEvent({
				entityId,
				type: 'PropertyCreated',
				payload: { name: 'My Yard' }
			}) as never
		);

		state = applyEvent(
			state,
			makeEvent({
				entityId,
				type: 'PropertyBoundarySet',
				payload: { points }
			}) as never
		);

		state = applyEvent(
			state,
			makeEvent({
				entityId,
				type: 'NorthOrientationSet',
				payload: { degrees: 315 }
			}) as never
		);

		const property = state.properties.get(entityId);
		expect(property).toBeDefined();
		expect(property!.name).toBe('My Yard');
		expect(property!.geometry).toEqual({ points });
		expect(property!.northOrientation).toBe(315);
	});

	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('State rebuilt via commitEvent and replayEvents (AC#6, FR4, FR6)', async () => {
		const entityId = crypto.randomUUID();

		await commitEvent({
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			payload: { name: 'Replayed Garden' }
		});

		await new Promise((r) => setTimeout(r, 5));

		await commitEvent({
			type: 'PropertyBoundarySet',
			entityId,
			entityType: 'property',
			payload: {
				points: [
					{ x: 10, y: 10 },
					{ x: 90, y: 10 },
					{ x: 90, y: 90 }
				]
			}
		} as never);

		await new Promise((r) => setTimeout(r, 5));

		await commitEvent({
			type: 'NorthOrientationSet',
			entityId,
			entityType: 'property',
			payload: { degrees: 120 }
		} as never);

		const state = await replayEvents();
		const property = state.properties.get(entityId);

		expect(property).toBeDefined();
		expect(property!.name).toBe('Replayed Garden');
		expect(property!.geometry).toEqual({
			points: [
				{ x: 10, y: 10 },
				{ x: 90, y: 10 },
				{ x: 90, y: 90 }
			]
		});
		expect(property!.northOrientation).toBe(120);
	});
});
