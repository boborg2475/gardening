import Dexie, { type EntityTable } from 'dexie';
import type { SavedProject } from '../types/garden';

const db = new Dexie('GardenYardPlanner') as Dexie & {
  projects: EntityTable<SavedProject, 'id'>;
};

db.version(1).stores({
  projects: 'id, name, updatedAt',
});

export { db };
