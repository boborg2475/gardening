import { db } from './db';
import type { Project } from '../types/garden';

export const projectRepo = {
  async save(project: Project): Promise<void> {
    await db.projects.put(project);
  },

  async loadLatest(): Promise<Project | undefined> {
    const all = await db.projects.orderBy('updatedAt').reverse().first();
    return all;
  },

  async list(): Promise<Project[]> {
    return db.projects.orderBy('updatedAt').reverse().toArray();
  },

  async remove(id: string): Promise<void> {
    await db.projects.delete(id);
  },
};
