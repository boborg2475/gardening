import { describe, it, expect, beforeEach } from 'vitest';
import { SelectTool } from './SelectTool';
import { CanvasEngine } from '../CanvasEngine';
import type { Zone } from '../../types/garden';

describe('SelectTool [BEAD-011]', () => {
  let tool: SelectTool;
  let engine: CanvasEngine;
  let selectedId: string | null;
  let movedZone: { id: string; dx: number; dy: number } | null;
  let deletedId: string | null;

  const zones: Zone[] = [
    {
      id: 'z1',
      name: 'Zone 1',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
      color: '#FF0000',
      sunExposure: 'full',
      soilType: 'loam',
      notes: '',
    },
  ];

  beforeEach(() => {
    engine = new CanvasEngine();
    selectedId = null;
    movedZone = null;
    deletedId = null;

    tool = new SelectTool(engine, {
      getZones: () => zones,
      getPropertyBoundary: () => null,
      getHouseOutline: () => null,
      onSelect: (id) => { selectedId = id; },
      onDeselect: () => { selectedId = null; },
      onMove: (id, dx, dy) => { movedZone = { id, dx, dy }; },
      onDelete: (id) => { deletedId = id; },
    });
  });

  it('should select a zone when clicking inside it', () => {
    // world (5,5) is inside z1. screen = 5*20=100, 5*20=100
    tool.onMouseDown(100, 100);
    tool.onMouseUp(100, 100);
    expect(selectedId).toBe('z1');
  });

  it('should deselect when clicking outside all zones', () => {
    // First select
    tool.onMouseDown(100, 100);
    tool.onMouseUp(100, 100);
    expect(selectedId).toBe('z1');

    // Click outside
    tool.onMouseDown(500, 500);
    tool.onMouseUp(500, 500);
    expect(selectedId).toBeNull();
  });

  it('should move a selected zone on drag', () => {
    // Select first
    tool.onMouseDown(100, 100);
    tool.onMouseUp(100, 100);

    // Drag
    tool.onMouseDown(100, 100);
    tool.onMouseMove(140, 160);
    tool.onMouseUp(140, 160);

    expect(movedZone).toBeDefined();
    expect(movedZone!.id).toBe('z1');
    // dx = (140-100)/20 = 2, dy = (160-100)/20 = 3
    expect(movedZone!.dx).toBeCloseTo(2);
    expect(movedZone!.dy).toBeCloseTo(3);
  });

  it('should delete selected zone on delete key', () => {
    tool.onMouseDown(100, 100);
    tool.onMouseUp(100, 100);
    tool.onDelete();
    expect(deletedId).toBe('z1');
  });

  it('should not delete when nothing is selected', () => {
    tool.onDelete();
    expect(deletedId).toBeNull();
  });
});
