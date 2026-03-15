import { db } from './db';
import type { Project } from '../types/garden';

export const projectRepo = {
  async saveProject(project: Project): Promise<void> {
    await db.projects.put(project);
  },

  async loadProject(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  },

  async loadLastProject(): Promise<Project | undefined> {
    const all = await db.projects.toArray();
    if (all.length === 0) return undefined;
    all.sort((a, b) => b.updatedAt - a.updatedAt);
    return all[0];
  },

  async deleteProject(id: string): Promise<void> {
    await db.projects.delete(id);
  },

  async listProjects(): Promise<Project[]> {
    return db.projects.toArray();
  },
};
