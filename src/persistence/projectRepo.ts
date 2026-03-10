import { getDb } from './db';
import type { ProjectData } from '../store/projectStore';

export interface ProjectListItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

function extractData(state: ProjectData): ProjectData {
  return {
    id: state.id,
    name: state.name,
    units: state.units,
    propertyBoundary: state.propertyBoundary,
    houseOutline: state.houseOutline,
    zones: state.zones,
    features: state.features,
    plantings: state.plantings,
    measurements: state.measurements,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
  };
}

export const projectRepo = {
  async saveProject(state: ProjectData): Promise<void> {
    const db = getDb();
    const data = extractData(state);
    await db.projects.put({
      id: data.id,
      name: data.name,
      data: JSON.stringify(data),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  },

  async loadProject(id: string): Promise<ProjectData | null> {
    const db = getDb();
    const record = await db.projects.get(id);
    if (!record) return null;
    return JSON.parse(record.data) as ProjectData;
  },

  async listProjects(): Promise<ProjectListItem[]> {
    const db = getDb();
    const records = await db.projects.orderBy('updatedAt').reverse().toArray();
    return records.map(({ id, name, createdAt, updatedAt }) => ({
      id,
      name,
      createdAt,
      updatedAt,
    }));
  },

  async deleteProject(id: string): Promise<void> {
    const db = getDb();
    await db.projects.delete(id);
  },

  async getLastProjectId(): Promise<string | null> {
    const db = getDb();
    const record = await db.meta.get('lastProjectId');
    return record?.value ?? null;
  },

  async setLastProjectId(id: string): Promise<void> {
    const db = getDb();
    await db.meta.put({ key: 'lastProjectId', value: id });
  },
};
