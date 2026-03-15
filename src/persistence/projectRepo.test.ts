import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from './db';
import { projectRepo } from './projectRepo';
import { createDefaultProject } from '../types/garden';

describe('projectRepo [BEAD-004]', () => {
  beforeEach(async () => {
    await db.projects.clear();
  });

  it('should save and load a project', async () => {
    const project = createDefaultProject('p1', 'Test Garden');
    await projectRepo.save(project);

    const loaded = await projectRepo.load('p1');
    expect(loaded).toBeDefined();
    expect(loaded!.id).toBe('p1');
    expect(loaded!.name).toBe('Test Garden');
  });

  it('should list projects ordered by updatedAt descending', async () => {
    const p1 = { ...createDefaultProject('p1', 'Old'), updatedAt: 1000 };
    const p2 = { ...createDefaultProject('p2', 'New'), updatedAt: 2000 };
    await projectRepo.save(p1);
    await projectRepo.save(p2);

    const list = await projectRepo.list();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe('p2');
    expect(list[1].id).toBe('p1');
  });

  it('should remove a project', async () => {
    const project = createDefaultProject('p1', 'To Delete');
    await projectRepo.save(project);
    await projectRepo.remove('p1');

    const loaded = await projectRepo.load('p1');
    expect(loaded).toBeUndefined();
  });

  it('should load the latest project', async () => {
    const p1 = { ...createDefaultProject('p1', 'Old'), updatedAt: 1000 };
    const p2 = { ...createDefaultProject('p2', 'Newest'), updatedAt: 3000 };
    const p3 = { ...createDefaultProject('p3', 'Middle'), updatedAt: 2000 };
    await projectRepo.save(p1);
    await projectRepo.save(p2);
    await projectRepo.save(p3);

    const latest = await projectRepo.loadLatest();
    expect(latest).toBeDefined();
    expect(latest!.id).toBe('p2');
  });

  it('should return undefined when loading non-existent project', async () => {
    const loaded = await projectRepo.load('nonexistent');
    expect(loaded).toBeUndefined();
  });

  it('should update an existing project on save', async () => {
    const project = createDefaultProject('p1', 'Original');
    await projectRepo.save(project);
    await projectRepo.save({ ...project, name: 'Updated' });

    const loaded = await projectRepo.load('p1');
    expect(loaded!.name).toBe('Updated');

    const list = await projectRepo.list();
    expect(list).toHaveLength(1);
  });
});
