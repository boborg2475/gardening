import Dexie from 'dexie';
import type { Table } from 'dexie';

export interface ProjectRecord {
  id: string;
  name: string;
  data: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetaRecord {
  key: string;
  value: string;
}

class GardenPlannerDB extends Dexie {
  projects!: Table<ProjectRecord>;
  meta!: Table<MetaRecord>;

  constructor() {
    super('GardenPlannerDB');
    this.version(1).stores({
      projects: 'id, name, updatedAt',
      meta: 'key',
    });
  }
}

let db: GardenPlannerDB | null = null;

export function getDb(): GardenPlannerDB {
  if (!db) {
    db = new GardenPlannerDB();
  }
  return db;
}
