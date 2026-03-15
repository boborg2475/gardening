import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PolygonTool } from './PolygonTool';
import { RectangleTool } from './RectangleTool';
import { SelectTool } from './SelectTool';
import type { Point, PropertyBoundary } from '../../types/garden';

// Simple identity transform for testing (1:1 world:screen mapping)
const identityScreenToWorld = (p: Point): Point => p;
const identityWorldToScreen = (p: Point): Point => p;

describe('PolygonTool [SPEC-01-F2]', () => {
  it('collects vertices on clicks', () => {
    const onComplete = vi.fn();
    const tool = new PolygonTool('property', {
      onComplete,
      screenToWorld: identityScreenToWorld,
      worldToScreen: identityWorldToScreen,
    });

    tool.handleClick(0, 0);
    tool.handleClick(10, 0);
    expect(tool.state.vertices).toHaveLength(2);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('completes polygon when clicking near first vertex', () => {
    const onComplete = vi.fn();
    const tool = new PolygonTool('property', {
      onComplete,
      screenToWorld: identityScreenToWorld,
      worldToScreen: identityWorldToScreen,
    });

    tool.handleClick(0, 0);
    tool.handleClick(100, 0);
    tool.handleClick(100, 100);
    // Click near first vertex (within 15px threshold)
    tool.handleClick(5, 5);

    expect(onComplete).toHaveBeenCalledTimes(1);
    const vertices = onComplete.mock.calls[0][0];
    expect(vertices).toHaveLength(3);
    expect(onComplete.mock.calls[0][1]).toBe('property');
  });

  it('does not close with fewer than 3 vertices', () => {
    const onComplete = vi.fn();
    const tool = new PolygonTool('house', {
      onComplete,
      screenToWorld: identityScreenToWorld,
      worldToScreen: identityWorldToScreen,
    });

    tool.handleClick(0, 0);
    tool.handleClick(5, 5); // Near first vertex but only 1 existing vertex
    expect(onComplete).not.toHaveBeenCalled();
    expect(tool.state.vertices).toHaveLength(2);
  });

  it('resets after completion', () => {
    const onComplete = vi.fn();
    const tool = new PolygonTool('zone', {
      onComplete,
      screenToWorld: identityScreenToWorld,
      worldToScreen: identityWorldToScreen,
    });

    tool.handleClick(0, 0);
    tool.handleClick(100, 0);
    tool.handleClick(100, 100);
    tool.handleClick(0, 0); // Close

    expect(tool.state.vertices).toHaveLength(0);
  });

  it('tracks cursor position on mouse move', () => {
    const tool = new PolygonTool('property', {
      onComplete: vi.fn(),
      screenToWorld: identityScreenToWorld,
      worldToScreen: identityWorldToScreen,
    });

    tool.handleMouseMove(50, 75);
    expect(tool.state.cursorWorldPos).toEqual({ x: 50, y: 75 });
  });
});

describe('RectangleTool [SPEC-01-F3]', () => {
  it('creates a rectangle on drag', () => {
    const onComplete = vi.fn();
    const tool = new RectangleTool({
      onComplete,
      screenToWorld: identityScreenToWorld,
    });

    tool.handleMouseDown(10, 10);
    tool.handleMouseMove(110, 110);
    tool.handleMouseUp();

    expect(onComplete).toHaveBeenCalledTimes(1);
    const vertices = onComplete.mock.calls[0][0] as Point[];
    expect(vertices).toHaveLength(4);
    expect(vertices[0]).toEqual({ x: 10, y: 10 });
    expect(vertices[2]).toEqual({ x: 110, y: 110 });
  });

  it('does not create rectangle if too small', () => {
    const onComplete = vi.fn();
    const tool = new RectangleTool({
      onComplete,
      screenToWorld: identityScreenToWorld,
    });

    tool.handleMouseDown(10, 10);
    tool.handleMouseMove(10.2, 10.2);
    tool.handleMouseUp();

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('provides preview vertices during drag', () => {
    const tool = new RectangleTool({
      onComplete: vi.fn(),
      screenToWorld: identityScreenToWorld,
    });

    expect(tool.getPreviewVertices()).toBeNull();

    tool.handleMouseDown(0, 0);
    tool.handleMouseMove(50, 30);

    const preview = tool.getPreviewVertices();
    expect(preview).toHaveLength(4);
    expect(preview![0]).toEqual({ x: 0, y: 0 });
    expect(preview![2]).toEqual({ x: 50, y: 30 });
  });

  it('resets after mouse up', () => {
    const tool = new RectangleTool({
      onComplete: vi.fn(),
      screenToWorld: identityScreenToWorld,
    });

    tool.handleMouseDown(0, 0);
    tool.handleMouseMove(50, 50);
    tool.handleMouseUp();

    expect(tool.state.isDragging).toBe(false);
    expect(tool.getPreviewVertices()).toBeNull();
  });
});

describe('SelectTool [SPEC-01-F4]', () => {
  const square: PropertyBoundary = {
    id: 'shape-1',
    layer: 'property',
    vertices: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ],
  };

  let onSelect: ReturnType<typeof vi.fn<(id: string | null) => void>>;
  let onMove: ReturnType<typeof vi.fn<(id: string, dx: number, dy: number) => void>>;
  let onDelete: ReturnType<typeof vi.fn<(id: string) => void>>;
  let tool: SelectTool;

  beforeEach(() => {
    onSelect = vi.fn<(id: string | null) => void>();
    onMove = vi.fn<(id: string, dx: number, dy: number) => void>();
    onDelete = vi.fn<(id: string) => void>();
    tool = new SelectTool({
      getShapes: () => [square],
      getTransform: () => ({ panOffset: { x: 0, y: 0 }, zoom: 1 }),
      screenToWorld: identityScreenToWorld,
      onSelect,
      onMove,
      onDelete,
    });
  });

  it('selects a shape when clicking inside it', () => {
    tool.handleMouseDown(50, 50);
    expect(onSelect).toHaveBeenCalledWith('shape-1');
  });

  it('deselects when clicking empty space', () => {
    tool.handleMouseDown(200, 200);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('moves a selected shape on drag', () => {
    tool.handleMouseDown(50, 50); // Select
    tool.handleMouseMove(60, 55); // Drag
    expect(onMove).toHaveBeenCalledWith('shape-1', 10, 5);
  });

  it('stops dragging on mouse up', () => {
    tool.handleMouseDown(50, 50);
    tool.handleMouseUp();
    tool.handleMouseMove(100, 100);
    // onMove should not be called after mouseUp
    expect(onMove).not.toHaveBeenCalled();
  });

  it('deletes selected shape on Delete key', () => {
    tool.handleKeyDown('Delete', 'shape-1');
    expect(onDelete).toHaveBeenCalledWith('shape-1');
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('deletes selected shape on Backspace key', () => {
    tool.handleKeyDown('Backspace', 'shape-1');
    expect(onDelete).toHaveBeenCalledWith('shape-1');
  });

  it('deselects on Escape key', () => {
    tool.handleKeyDown('Escape', 'shape-1');
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('does nothing on Delete when nothing selected', () => {
    tool.handleKeyDown('Delete', null);
    expect(onDelete).not.toHaveBeenCalled();
  });
});
