import { describe, it, expect, beforeEach } from 'vitest';
import { PolygonTool } from './PolygonTool';
import { CanvasEngine } from '../CanvasEngine';
import type { Point } from '../../types/garden';

describe('PolygonTool [BEAD-010]', () => {
  let tool: PolygonTool;
  let engine: CanvasEngine;
  let createdPolygons: Point[][];

  beforeEach(() => {
    engine = new CanvasEngine();
    createdPolygons = [];
    tool = new PolygonTool(engine, (points) => {
      createdPolygons.push(points);
    });
  });

  it('should add vertices on click', () => {
    tool.onClick(0, 0);
    expect(tool.getVertices()).toHaveLength(1);

    tool.onClick(200, 0);
    expect(tool.getVertices()).toHaveLength(2);

    tool.onClick(200, 200);
    expect(tool.getVertices()).toHaveLength(3);
  });

  it('should complete polygon when clicking near first vertex', () => {
    // Place 3 vertices then close
    tool.onClick(0, 0);       // vertex 0 at world (0,0)
    tool.onClick(200, 0);     // vertex 1
    tool.onClick(200, 200);   // vertex 2
    tool.onClick(3, 3);       // close to first vertex (within threshold)

    expect(createdPolygons).toHaveLength(1);
    expect(createdPolygons[0]).toHaveLength(3);
  });

  it('should not complete with fewer than 3 vertices', () => {
    tool.onClick(0, 0);
    tool.onClick(200, 0);
    tool.onClick(3, 3); // close to first, but only 2 vertices — treated as new point

    expect(createdPolygons).toHaveLength(0);
    expect(tool.getVertices()).toHaveLength(3);
  });

  it('should reset after completion', () => {
    tool.onClick(0, 0);
    tool.onClick(200, 0);
    tool.onClick(200, 200);
    tool.onClick(3, 3); // close

    expect(tool.getVertices()).toHaveLength(0);
  });

  it('should cancel on escape', () => {
    tool.onClick(0, 0);
    tool.onClick(200, 0);
    tool.onCancel();

    expect(tool.getVertices()).toHaveLength(0);
    expect(createdPolygons).toHaveLength(0);
  });
});
