import { db } from './db';
import type { Project, SavedProject } from '../types/garden';

export const projectRepo = {
  async saveProject(project: Project): Promise<void> {
    const saved: SavedProject = {
      id: project.id,
      name: project.name,
      data: project,
      updatedAt: Date.now(),
    };
    await db.projects.put(saved);
  },

  async loadProject(id: string): Promise<Project | null> {
    const saved = await db.projects.get(id);
    return saved?.data ?? null;
  },

  async listProjects(): Promise<Array<{ id: string; name: string; updatedAt: number }>> {
    const all = await db.projects.toArray();
    return all.map(({ id, name, updatedAt }) => ({ id, name, updatedAt }));
  },

  async deleteProject(id: string): Promise<void> {
    await db.projects.delete(id);
  },

  async getLastProject(): Promise<Project | null> {
    const last = await db.projects.orderBy('updatedAt').last();
    return last?.data ?? null;
  },
};
