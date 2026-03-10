import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { projectRepo } from '../projectRepo';
import { getDb } from '../db';
import type { ProjectData } from '../../store/projectStore';

function makeProjectData(overrides: Partial<ProjectData> = {}): ProjectData {
  return {
    id: 'proj-1',
    name: 'Test Project',
    units: 'imperial',
    propertyBoundary: null,
    houseOutline: null,
    zones: [],
    features: [],
    plantings: [],
    measurements: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-06-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('projectRepo [LLD-03, BEAM-SP-010]', () => {
  beforeEach(async () => {
    const db = getDb();
    await db.projects.clear();
    await db.meta.clear();
  });

  describe('saveProject / loadProject [BEAM-SP-012]', () => {
    it('saves and loads a project by id', async () => {
      const data = makeProjectData({ id: 'p1', name: 'My Garden' });
      await projectRepo.saveProject(data);
      const loaded = await projectRepo.loadProject('p1');
      expect(loaded).not.toBeNull();
      expect(loaded!.id).toBe('p1');
      expect(loaded!.name).toBe('My Garden');
      expect(loaded!.zones).toEqual([]);
    });

    it('returns null for nonexistent project', async () => {
      const loaded = await projectRepo.loadProject('nonexistent');
      expect(loaded).toBeNull();
    });

    it('upserts on save (updates existing)', async () => {
      await projectRepo.saveProject(makeProjectData({ id: 'p1', name: 'V1' }));
      await projectRepo.saveProject(makeProjectData({ id: 'p1', name: 'V2' }));
      const loaded = await projectRepo.loadProject('p1');
      expect(loaded!.name).toBe('V2');
    });
  });

  describe('listProjects [LLD-03]', () => {
    it('returns all projects sorted by updatedAt descending', async () => {
      await projectRepo.saveProject(makeProjectData({ id: 'p1', name: 'Old', updatedAt: '2025-01-01T00:00:00.000Z' }));
      await projectRepo.saveProject(makeProjectData({ id: 'p2', name: 'New', updatedAt: '2025-06-01T00:00:00.000Z' }));
      const list = await projectRepo.listProjects();
      expect(list).toHaveLength(2);
      expect(list[0].id).toBe('p2');
      expect(list[1].id).toBe('p1');
    });

    it('returns empty array when no projects exist', async () => {
      const list = await projectRepo.listProjects();
      expect(list).toEqual([]);
    });

    it('omits full data from list items', async () => {
      await projectRepo.saveProject(makeProjectData({ id: 'p1' }));
      const list = await projectRepo.listProjects();
      expect(list[0]).toHaveProperty('id');
      expect(list[0]).toHaveProperty('name');
      expect(list[0]).not.toHaveProperty('data');
    });
  });

  describe('deleteProject [BEAM-SP-015]', () => {
    it('removes a project by id', async () => {
      await projectRepo.saveProject(makeProjectData({ id: 'p1' }));
      await projectRepo.deleteProject('p1');
      const loaded = await projectRepo.loadProject('p1');
      expect(loaded).toBeNull();
    });

    it('is a no-op for nonexistent id', async () => {
      await expect(projectRepo.deleteProject('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('lastProjectId [BEAM-SP-013]', () => {
    it('returns null when not set', async () => {
      const id = await projectRepo.getLastProjectId();
      expect(id).toBeNull();
    });

    it('saves and retrieves last project id', async () => {
      await projectRepo.setLastProjectId('p1');
      const id = await projectRepo.getLastProjectId();
      expect(id).toBe('p1');
    });

    it('overwrites previous value', async () => {
      await projectRepo.setLastProjectId('p1');
      await projectRepo.setLastProjectId('p2');
      const id = await projectRepo.getLastProjectId();
      expect(id).toBe('p2');
    });
  });
});
