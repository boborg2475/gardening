import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Project } from '../types/garden';

export class GardenPlannerDB extends Dexie {
  projects!: Table<Project, string>;

  constructor() {
    super('GardenPlannerDB');
    this.version(1).stores({
      projects: 'id',
    });
  }
}

export const db = new GardenPlannerDB();
