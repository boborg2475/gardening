import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from './db';
import { projectRepo } from './projectRepo';
import type { Project } from '../types/garden';

const makeProject = (id: string, name: string): Project => ({
  id,
  name,
  propertyBoundary: null,
  houseOutline: null,
  zones: [],
});

describe('projectRepo [R4]', () => {
  beforeEach(async () => {
    await db.projects.clear();
  });

  describe('saveProject [R4.2]', () => {
    it('saves a project to IndexedDB', async () => {
      const project = makeProject('p1', 'My Garden');
      await projectRepo.saveProject(project);

      const saved = await db.projects.get('p1');
      expect(saved).toBeTruthy();
      expect(saved!.name).toBe('My Garden');
      expect(saved!.data).toEqual(project);
      expect(saved!.updatedAt).toBeGreaterThan(0);
    });

    it('overwrites existing project on re-save', async () => {
      const project = makeProject('p1', 'V1');
      await projectRepo.saveProject(project);

      const updated = { ...project, name: 'V2' };
      await projectRepo.saveProject(updated);

      const all = await db.projects.toArray();
      expect(all).toHaveLength(1);
      expect(all[0].data.name).toBe('V2');
    });
  });

  describe('loadProject [R4.3]', () => {
    it('loads a project by id', async () => {
      const project = makeProject('p1', 'My Garden');
      await projectRepo.saveProject(project);

      const loaded = await projectRepo.loadProject('p1');
      expect(loaded).toEqual(project);
    });

    it('returns null for non-existent id', async () => {
      const loaded = await projectRepo.loadProject('nonexistent');
      expect(loaded).toBeNull();
    });
  });

  describe('listProjects [R4.4]', () => {
    it('returns all saved project summaries', async () => {
      await projectRepo.saveProject(makeProject('p1', 'Garden A'));
      await projectRepo.saveProject(makeProject('p2', 'Garden B'));

      const list = await projectRepo.listProjects();
      expect(list).toHaveLength(2);
      expect(list.map((p) => p.name)).toContain('Garden A');
      expect(list.map((p) => p.name)).toContain('Garden B');
    });
  });

  describe('deleteProject [R4.5]', () => {
    it('removes a project by id', async () => {
      await projectRepo.saveProject(makeProject('p1', 'Garden'));
      await projectRepo.deleteProject('p1');

      const remaining = await db.projects.toArray();
      expect(remaining).toHaveLength(0);
    });
  });
});
