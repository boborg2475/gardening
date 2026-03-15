import { describe, it, expect, vi } from 'vitest';
import { createRectangleTool } from './RectangleTool';

describe('RectangleTool [LLD-04]', () => {
  it('should create a rectangle on drag', () => {
    const onComplete = vi.fn();
    const tool = createRectangleTool(onComplete);

    tool.onPointerDown!({ worldPoint: { x: 0, y: 0 }, screenPoint: { x: 0, y: 0 }, shiftKey: false });
    tool.onPointerMove!({ worldPoint: { x: 10, y: 5 }, screenPoint: { x: 10, y: 5 }, shiftKey: false });
    tool.onPointerUp!({ worldPoint: { x: 10, y: 5 }, screenPoint: { x: 10, y: 5 }, shiftKey: false });

    expect(onComplete).toHaveBeenCalledTimes(1);
    const points = onComplete.mock.calls[0][0];
    expect(points).toHaveLength(4);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[2]).toEqual({ x: 10, y: 5 });
  });

  it('should not create rectangle for tiny drags', () => {
    const onComplete = vi.fn();
    const tool = createRectangleTool(onComplete);

    tool.onPointerDown!({ worldPoint: { x: 0, y: 0 }, screenPoint: { x: 0, y: 0 }, shiftKey: false });
    tool.onPointerMove!({ worldPoint: { x: 0.1, y: 0.1 }, screenPoint: { x: 0.1, y: 0.1 }, shiftKey: false });
    tool.onPointerUp!({ worldPoint: { x: 0.1, y: 0.1 }, screenPoint: { x: 0.1, y: 0.1 }, shiftKey: false });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should provide preview points during drag', () => {
    const tool = createRectangleTool(vi.fn());

    tool.onPointerDown!({ worldPoint: { x: 0, y: 0 }, screenPoint: { x: 0, y: 0 }, shiftKey: false });
    tool.onPointerMove!({ worldPoint: { x: 5, y: 3 }, screenPoint: { x: 5, y: 3 }, shiftKey: false });

    const preview = tool.getPreviewPoints!();
    expect(preview).toHaveLength(4);
  });

  it('should reset on Escape', () => {
    const tool = createRectangleTool(vi.fn());

    tool.onPointerDown!({ worldPoint: { x: 0, y: 0 }, screenPoint: { x: 0, y: 0 }, shiftKey: false });
    tool.onKeyDown!({ key: 'Escape' } as KeyboardEvent);

    expect(tool.getPreviewPoints!()).toHaveLength(0);
  });
});
