import { describe, it, expect } from 'vitest';
import type { Point, Zone, Project, SunExposure, SoilType, ToolType } from './garden';
import { createDefaultProject } from './garden';

describe('Domain Types [BEAD-001]', () => {
  it('should create a Point with x and y', () => {
    const p: Point = { x: 10, y: 20 };
    expect(p.x).toBe(10);
    expect(p.y).toBe(20);
  });

  it('should accept valid SunExposure values', () => {
    const values: SunExposure[] = ['full', 'partial', 'shade'];
    expect(values).toHaveLength(3);
  });

  it('should accept valid SoilType values', () => {
    const values: SoilType[] = ['clay', 'sandy', 'loam', 'silt', 'peat', 'chalk'];
    expect(values).toHaveLength(6);
  });

  it('should accept valid ToolType values', () => {
    const values: ToolType[] = [
      'select',
      'property-boundary',
      'house-outline',
      'zone-rectangle',
      'zone-polygon',
    ];
    expect(values).toHaveLength(5);
  });

  it('should create a Zone with all required fields', () => {
    const zone: Zone = {
      id: 'z1',
      name: 'Veggie Bed',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 5 },
        { x: 0, y: 5 },
      ],
      color: '#4CAF50',
      sunExposure: 'full',
      soilType: 'loam',
      notes: 'Raised bed with compost',
    };
    expect(zone.id).toBe('z1');
    expect(zone.points).toHaveLength(4);
  });

  it('should create a default project', () => {
    const project: Project = createDefaultProject('p1', 'My Garden');
    expect(project.id).toBe('p1');
    expect(project.name).toBe('My Garden');
    expect(project.propertyBoundary).toBeNull();
    expect(project.houseOutline).toBeNull();
    expect(project.zones).toEqual([]);
    expect(project.createdAt).toBeGreaterThan(0);
    expect(project.updatedAt).toBeGreaterThan(0);
  });
});
