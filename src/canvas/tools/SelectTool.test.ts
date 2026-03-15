import { describe, it, expect, beforeEach } from 'vitest';
import { SelectTool } from './SelectTool';
import { CanvasEngine } from '../CanvasEngine';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import type { Point } from '../../types/garden';

const squareVertices: Point[] = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

describe('SelectTool [R11]', () => {
  let tool: SelectTool;
  let engine: CanvasEngine;

  beforeEach(() => {
    useProjectStore.getState().clearProject();
    useProjectStore.temporal.getState().clear();
    useUIStore.getState().setSelectedZoneId(null);
    tool = new SelectTool();
    engine = new CanvasEngine();
  });

  it('selects a zone by clicking inside it [R11.1]', () => {
    useProjectStore.getState().addZone({
      name: 'Test', color: '#ff0000', sunExposure: 'full', soilType: 'clay',
      notes: '', vertices: squareVertices,
    });

    tool.onMouseDown({ x: 5, y: 5 }, engine);
    tool.onMouseUp({ x: 5, y: 5 }, engine);

    expect(useUIStore.getState().selectedZoneId).toBeTruthy();
  });

  it('deselects when clicking empty space [R11.2]', () => {
    useProjectStore.getState().addZone({
      name: 'Test', color: '#ff0000', sunExposure: 'full', soilType: 'clay',
      notes: '', vertices: squareVertices,
    });
    const zoneId = useProjectStore.getState().project.zones[0].id;
    useUIStore.getState().setSelectedZoneId(zoneId);

    tool.onMouseDown({ x: 50, y: 50 }, engine);
    tool.onMouseUp({ x: 50, y: 50 }, engine);

    expect(useUIStore.getState().selectedZoneId).toBeNull();
  });

  it('moves selected zone on drag [R11.3]', () => {
    useProjectStore.getState().addZone({
      name: 'Test', color: '#ff0000', sunExposure: 'full', soilType: 'clay',
      notes: '', vertices: squareVertices,
    });
    const zoneId = useProjectStore.getState().project.zones[0].id;
    useUIStore.getState().setSelectedZoneId(zoneId);

    // Start drag inside the zone
    tool.onMouseDown({ x: 5, y: 5 }, engine);
    tool.onMouseMove({ x: 15, y: 15 }, engine);
    tool.onMouseUp({ x: 15, y: 15 }, engine);

    const movedZone = useProjectStore.getState().project.zones[0];
    // Original (0,0) should now be at (10,10)
    expect(movedZone.vertices[0]).toEqual({ x: 10, y: 10 });
  });

  it('deletes selected zone on Delete key [R11.4]', () => {
    useProjectStore.getState().addZone({
      name: 'Test', color: '#ff0000', sunExposure: 'full', soilType: 'clay',
      notes: '', vertices: squareVertices,
    });
    const zoneId = useProjectStore.getState().project.zones[0].id;
    useUIStore.getState().setSelectedZoneId(zoneId);

    tool.onKeyDown(new KeyboardEvent('keydown', { key: 'Delete' }));

    expect(useProjectStore.getState().project.zones).toHaveLength(0);
    expect(useUIStore.getState().selectedZoneId).toBeNull();
  });

  it('deselects on Escape key [R11.5]', () => {
    useProjectStore.getState().addZone({
      name: 'Test', color: '#ff0000', sunExposure: 'full', soilType: 'clay',
      notes: '', vertices: squareVertices,
    });
    const zoneId = useProjectStore.getState().project.zones[0].id;
    useUIStore.getState().setSelectedZoneId(zoneId);

    tool.onKeyDown(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(useUIStore.getState().selectedZoneId).toBeNull();
  });
});
