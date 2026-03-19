import Dexie, { type EntityTable } from 'dexie';
import type { Project } from '../types/garden';

const db = new Dexie('GardenYardPlanner') as Dexie & {
  projects: EntityTable<Project, 'id'>;
};

db.version(1).stores({
  projects: 'id',
});

export { db };
