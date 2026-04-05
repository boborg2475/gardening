import { db, type Snapshot } from './db.js';
import { EventSchema, type AppEvent } from '../types/events.js';
import type { Property } from '../types/entities.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('event-store');

export interface MaterializedState {
	properties: Map<string, Property>;
}

export function createEmptyState(): MaterializedState {
	return { properties: new Map() };
}

export async function commitEvent(
	eventData: Omit<AppEvent, 'id' | 'timestamp'>
): Promise<AppEvent> {
	const event = {
		...eventData,
		id: crypto.randomUUID(),
		timestamp: new Date().toISOString()
	} as AppEvent;

	const result = EventSchema.safeParse(event);
	if (!result.success) {
		log.error('Event validation failed:', result.error);
		throw new Error(`Event validation failed: ${result.error.message}`);
	}

	await db.events.add(result.data);
	log.info('committed', event.type, 'for', event.entityId);
	return result.data;
}

export function applyEvent(state: MaterializedState, event: AppEvent): MaterializedState {
	log.debug('applyEvent', event.type, 'entity:', event.entityId);
	switch (event.type) {
		case 'PropertyCreated': {
			const property: Property = {
				id: event.entityId,
				name: event.payload.name,
				dimensions: event.payload.dimensions
			};
			const properties = new Map(state.properties);
			properties.set(property.id, property);
			return { ...state, properties };
		}
		case 'PropertyUpdated': {
			const existing = state.properties.get(event.entityId);
			if (!existing) return state;
			const updated = { ...existing };
			if (event.payload.name !== undefined) updated.name = event.payload.name;
			if (event.payload.dimensions !== undefined)
				updated.dimensions = event.payload.dimensions ?? undefined;
			if (event.payload.northOrientation !== undefined)
				updated.northOrientation = event.payload.northOrientation ?? undefined;
			const properties = new Map(state.properties);
			properties.set(event.entityId, updated);
			return { ...state, properties };
		}
		case 'PolygonDrawn': {
			const existing = state.properties.get(event.entityId);
			if (!existing) return state;
			const updated = { ...existing, geometry: { points: event.payload.points } };
			const properties = new Map(state.properties);
			properties.set(event.entityId, updated);
			return { ...state, properties };
		}
		case 'PropertyBoundarySet': {
			const existing = state.properties.get(event.entityId);
			if (!existing) return state;
			const updated = { ...existing, geometry: { points: event.payload.points } };
			const properties = new Map(state.properties);
			properties.set(event.entityId, updated);
			return { ...state, properties };
		}
		case 'NorthOrientationSet': {
			const existing = state.properties.get(event.entityId);
			if (!existing) return state;
			const updated = { ...existing, northOrientation: event.payload.degrees };
			const properties = new Map(state.properties);
			properties.set(event.entityId, updated);
			return { ...state, properties };
		}
	}
}

export async function replayEvents(sinceTimestamp?: string): Promise<MaterializedState> {
	let events: AppEvent[];
	if (sinceTimestamp) {
		events = await db.events.where('timestamp').above(sinceTimestamp).sortBy('timestamp');
	} else {
		events = await db.events.orderBy('timestamp').toArray();
	}

	let state = createEmptyState();
	for (const event of events) {
		state = applyEvent(state, event);
	}
	return state;
}

export async function loadLatestSnapshot(): Promise<Snapshot | undefined> {
	const snapshots = await db.snapshots.orderBy('timestamp').reverse().limit(1).toArray();
	return snapshots[0];
}

export async function writeSnapshot(state: MaterializedState): Promise<void> {
	const snapshot: Snapshot = {
		id: crypto.randomUUID(),
		timestamp: new Date().toISOString(),
		state: {
			properties: Array.from(state.properties.values())
		}
	};
	await db.snapshots.add(snapshot);
}

export function stateFromSnapshot(snapshot: Snapshot): MaterializedState {
	const properties = new Map<string, Property>();
	for (const prop of snapshot.state.properties) {
		properties.set(prop.id, prop);
	}
	return { properties };
}

export async function initializeState(): Promise<{
	state: MaterializedState;
	eventsSinceSnapshot: number;
}> {
	const snapshot = await loadLatestSnapshot();

	let state: MaterializedState;
	let eventsSinceSnapshot: number;

	if (snapshot) {
		const events = await db.events.where('timestamp').above(snapshot.timestamp).sortBy('timestamp');
		state = stateFromSnapshot(snapshot);
		for (const event of events) {
			state = applyEvent(state, event);
		}
		eventsSinceSnapshot = events.length;
	} else {
		state = await replayEvents();
		eventsSinceSnapshot = await db.events.count();
	}

	await writeSnapshot(state);

	return { state, eventsSinceSnapshot };
}

export const EXTENDED_REPLAY_THRESHOLD = 1000;
