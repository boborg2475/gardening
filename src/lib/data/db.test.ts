/**
 * Story 1.2: Event Store & Property Data Model
 *
 * Traceability:
 * AC#1 (FR1) → all tests — verifies properties, events, and snapshots tables exist with correct indexes
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db.js';

describe('Story 1.2 AC#1: Dexie database schema (FR1)', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
	});

	it('has properties table (AC#1, FR1)', () => {
		expect(db.properties).toBeDefined();
	});

	it('has events table (AC#1, FR1)', () => {
		expect(db.events).toBeDefined();
	});

	it('has snapshots table (AC#1, FR1)', () => {
		expect(db.snapshots).toBeDefined();
	});

	it('can store and retrieve a property (AC#1, FR1)', async () => {
		const property = {
			id: crypto.randomUUID(),
			name: 'Test Garden'
		};

		await db.properties.add(property);
		const retrieved = await db.properties.get(property.id);
		expect(retrieved).toEqual(property);
	});

	it('can store and retrieve an event (AC#1, FR1)', async () => {
		const event = {
			id: crypto.randomUUID(),
			type: 'PropertyCreated' as const,
			entityId: crypto.randomUUID(),
			entityType: 'property' as const,
			timestamp: new Date().toISOString(),
			payload: { name: 'Test Garden' }
		};

		await db.events.add(event);
		const retrieved = await db.events.get(event.id);
		expect(retrieved).toEqual(event);
	});

	it('can query events by entityId (AC#1, FR1)', async () => {
		const entityId = crypto.randomUUID();
		const event1 = {
			id: crypto.randomUUID(),
			type: 'PropertyCreated' as const,
			entityId,
			entityType: 'property' as const,
			timestamp: new Date().toISOString(),
			payload: { name: 'Garden' }
		};
		const event2 = {
			id: crypto.randomUUID(),
			type: 'PropertyUpdated' as const,
			entityId,
			entityType: 'property' as const,
			timestamp: new Date().toISOString(),
			payload: { name: 'Updated Garden' }
		};

		await db.events.bulkAdd([event1, event2]);
		const events = await db.events.where('entityId').equals(entityId).toArray();
		expect(events).toHaveLength(2);
	});

	it('can store and retrieve a snapshot (AC#1, FR1)', async () => {
		const snapshot = {
			id: crypto.randomUUID(),
			timestamp: new Date().toISOString(),
			state: {
				properties: [{ id: crypto.randomUUID(), name: 'Garden' }]
			}
		};

		await db.snapshots.add(snapshot);
		const retrieved = await db.snapshots.get(snapshot.id);
		expect(retrieved).toEqual(snapshot);
	});
});
