import type { PropertyCreatedEvent, PropertyUpdatedEvent } from '../../src/lib/types/events.js';

export function createPropertyCreatedEvent(
	overrides: Partial<PropertyCreatedEvent> & { entityId?: string; name?: string } = {}
): Omit<PropertyCreatedEvent, 'id' | 'timestamp'> {
	return {
		type: 'PropertyCreated',
		entityId: overrides.entityId ?? crypto.randomUUID(),
		entityType: 'property',
		payload: {
			name: overrides.name ?? 'Test Garden',
			...overrides.payload
		}
	};
}

export function createPropertyUpdatedEvent(
	entityId: string,
	payload: PropertyUpdatedEvent['payload']
): Omit<PropertyUpdatedEvent, 'id' | 'timestamp'> {
	return {
		type: 'PropertyUpdated',
		entityId,
		entityType: 'property',
		payload
	};
}
