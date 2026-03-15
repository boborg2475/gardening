import Dexie from 'dexie';
import type { Project } from '../types/garden';

class GardenPlannerDB extends Dexie {
  projects!: Dexie.Table<Project, string>;

  constructor() {
    super('GardenPlannerDB');
    this.version(1).stores({
      projects: 'id, updatedAt',
    });
  }
}

export const db = new GardenPlannerDB();
