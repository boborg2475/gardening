import type { Dimensions } from '../types/entities.js';
import { dispatchEvent } from '../stores/materialized-state.svelte.js';
import type { Property } from '../types/entities.js';
import type { DispatchEventFn } from '../domain/polygon-drawing.js';
import type { Point } from '../types/geometry.js';
import type { AppEvent } from '../types/events.js';

export interface CreatePropertyInput {
	name: string;
	dimensions?: Dimensions;
}

export async function createProperty(input: CreatePropertyInput): Promise<Property> {
	const trimmedName = input.name.trim();
	if (trimmedName.length === 0) {
		throw new Error('Property name is required');
	}

	const entityId = crypto.randomUUID();

	await dispatchEvent({
		type: 'PropertyCreated',
		entityId,
		entityType: 'property',
		payload: {
			name: trimmedName,
			...(input.dimensions ? { dimensions: input.dimensions } : {})
		}
	});

	return {
		id: entityId,
		name: trimmedName,
		dimensions: input.dimensions
	};
}

export async function commitPropertyBoundary(
	dispatch: DispatchEventFn,
	propertyId: string,
	points: Point[]
): Promise<AppEvent> {
	return dispatch({
		type: 'PropertyBoundarySet',
		entityId: propertyId,
		entityType: 'property',
		payload: { points }
	});
}

export async function setNorthOrientation(
	dispatch: DispatchEventFn,
	propertyId: string,
	degrees: number
): Promise<AppEvent> {
	return dispatch({
		type: 'NorthOrientationSet',
		entityId: propertyId,
		entityType: 'property',
		payload: { degrees }
	});
}
