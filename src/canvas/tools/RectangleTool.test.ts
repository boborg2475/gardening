import { describe, it, expect, beforeEach } from 'vitest';
import { RectangleTool } from './RectangleTool';
import { CanvasEngine } from '../CanvasEngine';
import type { Point } from '../../types/garden';

describe('RectangleTool [BEAD-009]', () => {
  let tool: RectangleTool;
  let engine: CanvasEngine;
  let createdRects: Point[][];

  beforeEach(() => {
    engine = new CanvasEngine();
    createdRects = [];
    tool = new RectangleTool(engine, (points) => {
      createdRects.push(points);
    });
  });

  it('should not create rectangle on just mousedown', () => {
    tool.onMouseDown(100, 100);
    expect(createdRects).toHaveLength(0);
  });

  it('should create rectangle on mousedown + mouseup', () => {
    tool.onMouseDown(0, 0);
    tool.onMouseMove(200, 100);
    tool.onMouseUp(200, 100);

    expect(createdRects).toHaveLength(1);
    const rect = createdRects[0];
    expect(rect).toHaveLength(4);
  });

  it('should produce rectangle with correct world coordinates', () => {
    // With default 20 px/ft, screen (0,0)-(200,100) = world (0,0)-(10,5)
    tool.onMouseDown(0, 0);
    tool.onMouseMove(200, 100);
    tool.onMouseUp(200, 100);

    const rect = createdRects[0];
    expect(rect[0]).toEqual({ x: 0, y: 0 });
    expect(rect[1]).toEqual({ x: 10, y: 0 });
    expect(rect[2]).toEqual({ x: 10, y: 5 });
    expect(rect[3]).toEqual({ x: 0, y: 5 });
  });

  it('should not create rectangle if no movement', () => {
    tool.onMouseDown(100, 100);
    tool.onMouseUp(100, 100);
    expect(createdRects).toHaveLength(0);
  });

  it('should provide preview points during drag', () => {
    tool.onMouseDown(0, 0);
    tool.onMouseMove(200, 100);
    const preview = tool.getPreviewPoints();
    expect(preview).toHaveLength(4);
  });

  it('should clear preview after mouseup', () => {
    tool.onMouseDown(0, 0);
    tool.onMouseMove(200, 100);
    tool.onMouseUp(200, 100);
    expect(tool.getPreviewPoints()).toHaveLength(0);
  });
});
