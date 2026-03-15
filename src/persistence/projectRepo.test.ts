import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from './db';
import { projectRepo } from './projectRepo';
import type { Project } from '../types/garden';

describe('projectRepo [BMAD-persistence]', () => {
  beforeEach(async () => {
    await db.projects.clear();
  });

  function makeProject(overrides: Partial<Project> = {}): Project {
    return {
      id: 'proj-1',
      name: 'Test Project',
      shapes: [],
      createdAt: 1000,
      updatedAt: 2000,
      ...overrides,
    };
  }

  describe('save', () => {
    it('should save a project to the database', async () => {
      const project = makeProject();
      await projectRepo.save(project);
      const stored = await db.projects.get('proj-1');
      expect(stored).toEqual(project);
    });

    it('should upsert an existing project', async () => {
      const project = makeProject();
      await projectRepo.save(project);
      await projectRepo.save({ ...project, name: 'Updated' });
      const stored = await db.projects.get('proj-1');
      expect(stored?.name).toBe('Updated');
      const count = await db.projects.count();
      expect(count).toBe(1);
    });
  });

  describe('load', () => {
    it('should load a project by id', async () => {
      const project = makeProject();
      await projectRepo.save(project);
      const loaded = await projectRepo.load('proj-1');
      expect(loaded).toEqual(project);
    });

    it('should return undefined for non-existent id', async () => {
      const loaded = await projectRepo.load('nope');
      expect(loaded).toBeUndefined();
    });
  });

  describe('loadLast', () => {
    it('should load the most recently updated project', async () => {
      await projectRepo.save(makeProject({ id: 'old', updatedAt: 1000 }));
      await projectRepo.save(makeProject({ id: 'new', updatedAt: 3000, name: 'Newest' }));

      const last = await projectRepo.loadLast();
      expect(last?.id).toBe('new');
      expect(last?.name).toBe('Newest');
    });

    it('should return undefined when no projects exist', async () => {
      const last = await projectRepo.loadLast();
      expect(last).toBeUndefined();
    });
  });
});
