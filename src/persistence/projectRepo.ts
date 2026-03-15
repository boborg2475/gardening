import { db } from './db';
import type { Project } from '../types/garden';

export const projectRepo = {
  async save(project: Project): Promise<void> {
    await db.projects.put(project);
  },

  async load(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  },

  async loadLast(): Promise<Project | undefined> {
    return db.projects.orderBy('updatedAt').last();
  },
};
