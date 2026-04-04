import {
	initializeState,
	commitEvent,
	applyEvent,
	createEmptyState,
	EXTENDED_REPLAY_THRESHOLD,
	type MaterializedState
} from '../data/event-store.js';
import type { AppEvent } from '../types/events.js';
import type { Property } from '../types/entities.js';

let state = $state<MaterializedState>(createEmptyState());
let initialized = $state(false);
let loading = $state(true);
let extendedReplay = $state(false);

export function getProperties(): Property[] {
	return Array.from(state.properties.values());
}

export function getProperty(id: string): Property | undefined {
	return state.properties.get(id);
}

export function isInitialized(): boolean {
	return initialized;
}

export function isLoading(): boolean {
	return loading;
}

export function isExtendedReplay(): boolean {
	return extendedReplay;
}

export async function initialize(): Promise<void> {
	loading = true;
	extendedReplay = false;

	const result = await initializeState();

	if (result.eventsSinceSnapshot > EXTENDED_REPLAY_THRESHOLD) {
		extendedReplay = true;
	}

	state = result.state;
	initialized = true;
	loading = false;
}

/** Reset module state to initial values. For testing only. */
export function _reset(): void {
	state = createEmptyState();
	initialized = false;
	loading = true;
	extendedReplay = false;
}

export async function dispatchEvent(
	eventData: Omit<AppEvent, 'id' | 'timestamp'>
): Promise<AppEvent> {
	const event = await commitEvent(eventData);
	state = applyEvent(state, event);
	return event;
}
