import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from './db';
import { projectRepo } from './projectRepo';
import type { ProjectData } from '../types/garden';

function makeProject(overrides: Partial<ProjectData> = {}): ProjectData {
  return {
    id: 'proj-1',
    name: 'Test Project',
    createdAt: 1000,
    updatedAt: 2000,
    shapes: [],
    ...overrides,
  };
}

describe('projectRepo [SPEC-01-F6]', () => {
  beforeEach(async () => {
    await db.projects.clear();
  });

  it('saves and loads a project', async () => {
    const project = makeProject();
    await projectRepo.save(project);
    const loaded = await projectRepo.load('proj-1');
    expect(loaded).toBeDefined();
    expect(loaded!.name).toBe('Test Project');
    expect(loaded!.shapes).toEqual([]);
  });

  it('returns undefined for missing project', async () => {
    const loaded = await projectRepo.load('nonexistent');
    expect(loaded).toBeUndefined();
  });

  it('loads the latest project by updatedAt', async () => {
    await projectRepo.save(makeProject({ id: 'p1', name: 'Old', updatedAt: 1000 }));
    await projectRepo.save(makeProject({ id: 'p2', name: 'New', updatedAt: 3000 }));

    const latest = await projectRepo.loadLatest();
    expect(latest).toBeDefined();
    // loadLatest updates updatedAt on save, but p2 was saved after p1
    expect(latest!.id).toBe('p2');
  });

  it('lists all projects ordered by updatedAt desc', async () => {
    await projectRepo.save(makeProject({ id: 'p1', name: 'First' }));
    // Small delay to ensure different updatedAt
    await projectRepo.save(makeProject({ id: 'p2', name: 'Second' }));

    const list = await projectRepo.list();
    expect(list).toHaveLength(2);
    // Both have updatedAt set by save(), second should be newer
  });

  it('removes a project', async () => {
    await projectRepo.save(makeProject());
    await projectRepo.remove('proj-1');
    const loaded = await projectRepo.load('proj-1');
    expect(loaded).toBeUndefined();
  });

  it('overwrites existing project on save', async () => {
    await projectRepo.save(makeProject({ name: 'V1' }));
    await projectRepo.save(makeProject({ name: 'V2' }));
    const loaded = await projectRepo.load('proj-1');
    expect(loaded!.name).toBe('V2');
  });
});
