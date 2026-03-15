import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from './db';
import { projectRepo } from './projectRepo';
import type { Project } from '../types/garden';

describe('projectRepo [LLD-03]', () => {
  beforeEach(async () => {
    await db.projects.clear();
  });

  const makeProject = (overrides: Partial<Project> = {}): Project => ({
    id: 'proj-1',
    name: 'Test Project',
    shapes: [],
    createdAt: 1000,
    updatedAt: 2000,
    ...overrides,
  });

  it('should save and load a project', async () => {
    const project = makeProject();
    await projectRepo.saveProject(project);
    const loaded = await projectRepo.loadProject('proj-1');
    expect(loaded).toEqual(project);
  });

  it('should return undefined for nonexistent project', async () => {
    const loaded = await projectRepo.loadProject('nonexistent');
    expect(loaded).toBeUndefined();
  });

  it('should upsert on save', async () => {
    const project = makeProject();
    await projectRepo.saveProject(project);
    await projectRepo.saveProject({ ...project, name: 'Updated' });
    const loaded = await projectRepo.loadProject('proj-1');
    expect(loaded?.name).toBe('Updated');
  });

  it('should load the most recently updated project', async () => {
    await projectRepo.saveProject(makeProject({ id: 'p1', updatedAt: 1000 }));
    await projectRepo.saveProject(makeProject({ id: 'p2', updatedAt: 3000 }));
    await projectRepo.saveProject(makeProject({ id: 'p3', updatedAt: 2000 }));
    const last = await projectRepo.loadLastProject();
    expect(last?.id).toBe('p2');
  });

  it('should return undefined when no projects exist', async () => {
    const last = await projectRepo.loadLastProject();
    expect(last).toBeUndefined();
  });

  it('should delete a project', async () => {
    await projectRepo.saveProject(makeProject());
    await projectRepo.deleteProject('proj-1');
    const loaded = await projectRepo.loadProject('proj-1');
    expect(loaded).toBeUndefined();
  });

  it('should list all projects', async () => {
    await projectRepo.saveProject(makeProject({ id: 'p1' }));
    await projectRepo.saveProject(makeProject({ id: 'p2' }));
    const list = await projectRepo.listProjects();
    expect(list).toHaveLength(2);
  });
});
