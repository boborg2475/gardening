import type { Property } from '../../src/lib/types/entities.js';

export function createProperty(overrides: Partial<Property> = {}): Property {
	return {
		id: overrides.id ?? crypto.randomUUID(),
		name: overrides.name ?? 'Test Garden',
		...overrides
	};
}
