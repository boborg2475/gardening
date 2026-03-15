import { db } from './db';
import type { Project } from '../types/garden';

export const projectRepo = {
  async save(project: Project): Promise<void> {
    await db.projects.put(project);
  },

  async load(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  },

  async list(): Promise<Project[]> {
    return db.projects.orderBy('updatedAt').reverse().toArray();
  },

  async remove(id: string): Promise<void> {
    await db.projects.delete(id);
  },

  async loadLatest(): Promise<Project | undefined> {
    return db.projects.orderBy('updatedAt').reverse().first();
  },
};
