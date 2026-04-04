import Dexie, { type EntityTable } from 'dexie';
import type { Property } from '../types/entities.js';
import type { AppEvent } from '../types/events.js';

export interface Snapshot {
	id: string;
	timestamp: string;
	state: {
		properties: Property[];
	};
}

export const db = new Dexie('gardening') as Dexie & {
	properties: EntityTable<Property, 'id'>;
	events: EntityTable<AppEvent, 'id'>;
	snapshots: EntityTable<Snapshot, 'id'>;
};

db.version(1).stores({
	properties: 'id, name',
	events: 'id, entityId, entityType, type, timestamp',
	snapshots: 'id, timestamp'
});
