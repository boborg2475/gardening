import Dexie from 'dexie';
import type { Project } from '../types/garden';

class GardenDB extends Dexie {
  projects!: Dexie.Table<Project, string>;

  constructor() {
    super('GardenYardPlanner');
    this.version(1).stores({
      projects: 'id, name, updatedAt',
    });
  }
}

export const db = new GardenDB();
