import { describe, it, expect, beforeEach } from 'vitest';
import { PolygonTool } from './PolygonTool';
import { CanvasEngine } from '../CanvasEngine';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';

describe('PolygonTool [R10]', () => {
  let engine: CanvasEngine;

  beforeEach(() => {
    useProjectStore.getState().clearProject();
    useProjectStore.temporal.getState().clear();
    engine = new CanvasEngine();
  });

  describe('polygon_zone mode', () => {
    let tool: PolygonTool;

    beforeEach(() => {
      useUIStore.getState().setActiveTool('polygon_zone');
      tool = new PolygonTool('polygon_zone');
    });

    it('adds vertices on click [R10.1]', () => {
      tool.onMouseDown({ x: 0, y: 0 }, engine);
      tool.onMouseDown({ x: 10, y: 0 }, engine);
      expect(tool.getVertices()).toHaveLength(2);
    });

    it('closes polygon when clicking near first vertex [R10.2]', () => {
      tool.onMouseDown({ x: 0, y: 0 }, engine);
      tool.onMouseDown({ x: 10, y: 0 }, engine);
      tool.onMouseDown({ x: 10, y: 10 }, engine);
      // Click near first vertex to close (within threshold)
      tool.onMouseDown({ x: 0.3, y: 0.3 }, engine);

      const zones = useProjectStore.getState().project.zones;
      expect(zones).toHaveLength(1);
      expect(zones[0].vertices).toHaveLength(3);
    });

    it('adds zone to store on close [R10.5]', () => {
      tool.onMouseDown({ x: 0, y: 0 }, engine);
      tool.onMouseDown({ x: 10, y: 0 }, engine);
      tool.onMouseDown({ x: 10, y: 10 }, engine);
      tool.onMouseDown({ x: 0.3, y: 0.3 }, engine);

      expect(useProjectStore.getState().project.zones).toHaveLength(1);
    });
  });

  describe('property_boundary mode [R10.4]', () => {
    it('sets property boundary on close', () => {
      useUIStore.getState().setActiveTool('property_boundary');
      const tool = new PolygonTool('property_boundary');

      tool.onMouseDown({ x: 0, y: 0 }, engine);
      tool.onMouseDown({ x: 100, y: 0 }, engine);
      tool.onMouseDown({ x: 100, y: 80 }, engine);
      tool.onMouseDown({ x: 0.3, y: 0.3 }, engine);

      expect(useProjectStore.getState().project.propertyBoundary).not.toBeNull();
      expect(useProjectStore.getState().project.propertyBoundary!.vertices).toHaveLength(3);
    });
  });

  describe('house_outline mode [R10.4]', () => {
    it('sets house outline on close', () => {
      useUIStore.getState().setActiveTool('house_outline');
      const tool = new PolygonTool('house_outline');

      tool.onMouseDown({ x: 20, y: 20 }, engine);
      tool.onMouseDown({ x: 60, y: 20 }, engine);
      tool.onMouseDown({ x: 60, y: 50 }, engine);
      tool.onMouseDown({ x: 20.3, y: 20.3 }, engine);

      expect(useProjectStore.getState().project.houseOutline).not.toBeNull();
    });
  });
});
