import { db } from './db';
import type { ProjectData } from '../types/garden';

export const projectRepo = {
  async save(project: ProjectData): Promise<void> {
    await db.projects.put({ ...project, updatedAt: Date.now() });
  },

  async load(id: string): Promise<ProjectData | undefined> {
    return db.projects.get(id);
  },

  async loadLatest(): Promise<ProjectData | undefined> {
    return db.projects.orderBy('updatedAt').reverse().first();
  },

  async list(): Promise<ProjectData[]> {
    return db.projects.orderBy('updatedAt').reverse().toArray();
  },

  async remove(id: string): Promise<void> {
    await db.projects.delete(id);
  },
};
