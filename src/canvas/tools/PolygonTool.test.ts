import { describe, it, expect, vi } from 'vitest';
import { createPolygonTool } from './PolygonTool';

describe('PolygonTool [LLD-04]', () => {
  const identity = (p: { x: number; y: number }) => p;

  it('should accumulate vertices on clicks', () => {
    const onComplete = vi.fn();
    const tool = createPolygonTool('property', '#000', 'Property', onComplete, identity);

    tool.onPointerDown!({
      worldPoint: { x: 0, y: 0 },
      screenPoint: { x: 0, y: 0 },
      shiftKey: false,
    });
    tool.onPointerDown!({
      worldPoint: { x: 10, y: 0 },
      screenPoint: { x: 10, y: 0 },
      shiftKey: false,
    });

    expect(tool.getVertices()).toHaveLength(2);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should complete polygon when clicking near first vertex', () => {
    const onComplete = vi.fn();
    const tool = createPolygonTool('property', '#000', 'Property', onComplete, identity);

    tool.onPointerDown!({ worldPoint: { x: 0, y: 0 }, screenPoint: { x: 0, y: 0 }, shiftKey: false });
    tool.onPointerDown!({ worldPoint: { x: 10, y: 0 }, screenPoint: { x: 10, y: 0 }, shiftKey: false });
    tool.onPointerDown!({ worldPoint: { x: 10, y: 10 }, screenPoint: { x: 10, y: 10 }, shiftKey: false });
    // Click near first point
    tool.onPointerDown!({ worldPoint: { x: 1, y: 1 }, screenPoint: { x: 1, y: 1 }, shiftKey: false });

    expect(onComplete).toHaveBeenCalledTimes(1);
    const args = onComplete.mock.calls[0];
    expect(args[0]).toHaveLength(3); // 3 vertices, not the closing click
  });

  it('should reset on Escape', () => {
    const onComplete = vi.fn();
    const tool = createPolygonTool('property', '#000', 'Property', onComplete, identity);

    tool.onPointerDown!({ worldPoint: { x: 0, y: 0 }, screenPoint: { x: 0, y: 0 }, shiftKey: false });
    tool.onPointerDown!({ worldPoint: { x: 10, y: 0 }, screenPoint: { x: 10, y: 0 }, shiftKey: false });
    tool.onKeyDown!({ key: 'Escape' } as KeyboardEvent);

    expect(tool.getVertices()).toHaveLength(0);
  });
});
