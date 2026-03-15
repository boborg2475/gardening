import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { ProjectData } from '../types/garden';

export class GardenDB extends Dexie {
  projects!: Table<ProjectData, string>;

  constructor() {
    super('GardenYardPlanner');
    this.version(1).stores({
      projects: 'id, name, updatedAt',
    });
  }
}

export const db = new GardenDB();
