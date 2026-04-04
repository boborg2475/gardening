import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db.js';
import {
	commitEvent,
	applyEvent,
	createEmptyState,
	replayEvents,
	writeSnapshot,
	loadLatestSnapshot,
	stateFromSnapshot,
	initializeState,
	EXTENDED_REPLAY_THRESHOLD
} from './event-store.js';

describe('commitEvent', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('commits a valid PropertyCreated event with UUID and timestamp', async () => {
		const event = await commitEvent({
			type: 'PropertyCreated',
			entityId: crypto.randomUUID(),
			entityType: 'property',
			payload: { name: 'My Garden' }
		});

		expect(event.id).toBeDefined();
		expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
		expect(event.type).toBe('PropertyCreated');
		expect(event.payload.name).toBe('My Garden');

		const stored = await db.events.get(event.id);
		expect(stored).toEqual(event);
	});

	it('commits a PropertyCreated event with optional dimensions', async () => {
		const event = await commitEvent({
			type: 'PropertyCreated',
			entityId: crypto.randomUUID(),
			entityType: 'property',
			payload: { name: 'Garden', dimensions: { width: 50, length: 100, unit: 'ft' } }
		});

		expect(event.payload.dimensions).toEqual({ width: 50, length: 100, unit: 'ft' });
	});

	it('rejects an invalid event and does NOT write to IndexedDB', async () => {
		await expect(
			commitEvent({
				type: 'PropertyCreated',
				entityId: crypto.randomUUID(),
				entityType: 'property',
				payload: { name: '' } // empty name fails min(1)
			} as never)
		).rejects.toThrow();

		const count = await db.events.count();
		expect(count).toBe(0);
	});

	it('rejects event with missing required fields', async () => {
		await expect(
			commitEvent({
				type: 'PropertyCreated',
				entityId: 'not-a-uuid',
				entityType: 'property',
				payload: { name: 'Garden' }
			} as never)
		).rejects.toThrow();

		const count = await db.events.count();
		expect(count).toBe(0);
	});

	it('assigns unique UUIDs to each event', async () => {
		const entityId = crypto.randomUUID();
		const event1 = await commitEvent({
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			payload: { name: 'Garden 1' }
		});
		const event2 = await commitEvent({
			type: 'PropertyUpdated',
			entityId,
			entityType: 'property',
			payload: { name: 'Garden 1 Updated' }
		});

		expect(event1.id).not.toBe(event2.id);
	});
});

describe('applyEvent', () => {
	it('applies PropertyCreated to empty state', () => {
		const entityId = crypto.randomUUID();
		const state = applyEvent(createEmptyState(), {
			id: crypto.randomUUID(),
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			timestamp: new Date().toISOString(),
			payload: { name: 'Garden' }
		});

		expect(state.properties.get(entityId)).toEqual({
			id: entityId,
			name: 'Garden',
			dimensions: undefined
		});
	});

	it('applies PropertyUpdated to existing property', () => {
		const entityId = crypto.randomUUID();
		let state = applyEvent(createEmptyState(), {
			id: crypto.randomUUID(),
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			timestamp: new Date().toISOString(),
			payload: { name: 'Garden' }
		});

		state = applyEvent(state, {
			id: crypto.randomUUID(),
			type: 'PropertyUpdated',
			entityId,
			entityType: 'property',
			timestamp: new Date().toISOString(),
			payload: { name: 'Updated Garden' }
		});

		expect(state.properties.get(entityId)?.name).toBe('Updated Garden');
	});

	it('produces immutable state (new object on each apply)', () => {
		const state1 = createEmptyState();
		const state2 = applyEvent(state1, {
			id: crypto.randomUUID(),
			type: 'PropertyCreated',
			entityId: crypto.randomUUID(),
			entityType: 'property',
			timestamp: new Date().toISOString(),
			payload: { name: 'Garden' }
		});

		expect(state1).not.toBe(state2);
		expect(state1.properties).not.toBe(state2.properties);
		expect(state1.properties.size).toBe(0);
		expect(state2.properties.size).toBe(1);
	});

	it('ignores PropertyUpdated for a non-existent entity', () => {
		const state = applyEvent(createEmptyState(), {
			id: crypto.randomUUID(),
			type: 'PropertyUpdated',
			entityId: crypto.randomUUID(),
			entityType: 'property',
			timestamp: new Date().toISOString(),
			payload: { name: 'Ghost' }
		});
		expect(state.properties.size).toBe(0);
	});

	it('preserves existing fields not present in update payload', () => {
		const entityId = crypto.randomUUID();
		let state = applyEvent(createEmptyState(), {
			id: crypto.randomUUID(),
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			timestamp: new Date().toISOString(),
			payload: { name: 'Garden', dimensions: { width: 50, length: 100, unit: 'ft' as const } }
		});
		state = applyEvent(state, {
			id: crypto.randomUUID(),
			type: 'PropertyUpdated',
			entityId,
			entityType: 'property',
			timestamp: new Date().toISOString(),
			payload: { northOrientation: 180 }
		});
		const prop = state.properties.get(entityId)!;
		expect(prop.name).toBe('Garden');
		expect(prop.dimensions).toEqual({ width: 50, length: 100, unit: 'ft' });
		expect(prop.northOrientation).toBe(180);
	});

	it('handles null to clear nullable fields', () => {
		const entityId = crypto.randomUUID();
		let state = applyEvent(createEmptyState(), {
			id: crypto.randomUUID(),
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			timestamp: new Date().toISOString(),
			payload: { name: 'Garden', dimensions: { width: 50, length: 100, unit: 'ft' as const } }
		});

		state = applyEvent(state, {
			id: crypto.randomUUID(),
			type: 'PropertyUpdated',
			entityId,
			entityType: 'property',
			timestamp: new Date().toISOString(),
			payload: { dimensions: null }
		});

		expect(state.properties.get(entityId)?.dimensions).toBeUndefined();
	});
});

describe('replayEvents', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('replays all events into correct state', async () => {
		const entityId = crypto.randomUUID();
		await commitEvent({
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			payload: { name: 'Garden' }
		});
		// Ensure different timestamp for deterministic ordering
		await new Promise((r) => setTimeout(r, 5));
		await commitEvent({
			type: 'PropertyUpdated',
			entityId,
			entityType: 'property',
			payload: { name: 'My Garden' }
		});

		const state = await replayEvents();
		expect(state.properties.get(entityId)?.name).toBe('My Garden');
	});

	it('replays only events after a given timestamp', async () => {
		const entityId = crypto.randomUUID();
		const createEvent = await commitEvent({
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			payload: { name: 'Garden' }
		});

		// Use the create event timestamp as the cutoff
		const cutoff = createEvent.timestamp;

		// Ensure the next event gets a different timestamp
		await new Promise((r) => setTimeout(r, 5));

		await commitEvent({
			type: 'PropertyUpdated',
			entityId,
			entityType: 'property',
			payload: { name: 'Updated' }
		});

		const allEvents = await db.events.orderBy('timestamp').toArray();
		const afterCutoff = allEvents.filter((e) => e.timestamp > cutoff);
		expect(afterCutoff.length).toBeGreaterThanOrEqual(1);
		expect(afterCutoff[0].type).toBe('PropertyUpdated');
	});

	it('replayEvents with sinceTimestamp excludes older events', async () => {
		const entityId = crypto.randomUUID();
		await commitEvent({
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			payload: { name: 'V1' }
		});
		const cutoff = new Date().toISOString();
		await new Promise((r) => setTimeout(r, 5));
		await commitEvent({
			type: 'PropertyUpdated',
			entityId,
			entityType: 'property',
			payload: { name: 'V2' }
		});

		const state = await replayEvents(cutoff);
		// Only the update was replayed — no PropertyCreated, so entity was never created
		expect(state.properties.has(entityId)).toBe(false);
	});
});

describe('snapshot', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('writes and loads a snapshot', async () => {
		const entityId = crypto.randomUUID();
		const state = applyEvent(createEmptyState(), {
			id: crypto.randomUUID(),
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			timestamp: new Date().toISOString(),
			payload: { name: 'Garden' }
		});

		await writeSnapshot(state);
		const snapshot = await loadLatestSnapshot();

		expect(snapshot).toBeDefined();
		expect(snapshot!.state.properties).toHaveLength(1);
		expect(snapshot!.state.properties[0].name).toBe('Garden');
	});

	it('loadLatestSnapshot returns the newest snapshot', async () => {
		const state1 = applyEvent(createEmptyState(), {
			id: crypto.randomUUID(),
			type: 'PropertyCreated',
			entityId: crypto.randomUUID(),
			entityType: 'property',
			timestamp: new Date().toISOString(),
			payload: { name: 'Old' }
		});
		await writeSnapshot(state1);
		await new Promise((r) => setTimeout(r, 5));
		const state2 = applyEvent(createEmptyState(), {
			id: crypto.randomUUID(),
			type: 'PropertyCreated',
			entityId: crypto.randomUUID(),
			entityType: 'property',
			timestamp: new Date().toISOString(),
			payload: { name: 'New' }
		});
		await writeSnapshot(state2);

		const latest = await loadLatestSnapshot();
		expect(latest!.state.properties[0].name).toBe('New');
	});

	it('stateFromSnapshot rebuilds Map correctly', async () => {
		const entityId = crypto.randomUUID();
		const originalState = applyEvent(createEmptyState(), {
			id: crypto.randomUUID(),
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			timestamp: new Date().toISOString(),
			payload: { name: 'Garden' }
		});

		await writeSnapshot(originalState);
		const snapshot = await loadLatestSnapshot();
		const rebuilt = stateFromSnapshot(snapshot!);

		expect(rebuilt.properties.get(entityId)?.name).toBe('Garden');
	});
});

describe('initializeState', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('initializes from events when no snapshot exists', async () => {
		const entityId = crypto.randomUUID();
		await commitEvent({
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			payload: { name: 'Garden' }
		});

		const { state, eventsSinceSnapshot } = await initializeState();

		expect(state.properties.get(entityId)?.name).toBe('Garden');
		expect(eventsSinceSnapshot).toBe(1);

		// Snapshot should have been written
		const snapshot = await loadLatestSnapshot();
		expect(snapshot).toBeDefined();
	});

	it('initializes from snapshot + newer events', async () => {
		const entityId = crypto.randomUUID();
		await commitEvent({
			type: 'PropertyCreated',
			entityId,
			entityType: 'property',
			payload: { name: 'Garden' }
		});

		// Initialize once to write snapshot
		await initializeState();

		// Small delay to ensure different timestamp
		await new Promise((r) => setTimeout(r, 5));

		// Add event after snapshot
		await commitEvent({
			type: 'PropertyUpdated',
			entityId,
			entityType: 'property',
			payload: { name: 'Updated Garden' }
		});

		const { state, eventsSinceSnapshot } = await initializeState();

		expect(state.properties.get(entityId)?.name).toBe('Updated Garden');
		expect(eventsSinceSnapshot).toBe(1);
	});

	it('reports extended replay threshold constant', () => {
		expect(EXTENDED_REPLAY_THRESHOLD).toBe(1000);
	});
});
