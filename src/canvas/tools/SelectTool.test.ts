import { describe, it, expect, vi } from 'vitest';
import { pointInPolygon, createSelectTool } from './SelectTool';
import type { Shape } from '../../types/garden';

describe('pointInPolygon [LLD-04]', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ];

  it('should return true for point inside', () => {
    expect(pointInPolygon({ x: 5, y: 5 }, square)).toBe(true);
  });

  it('should return false for point outside', () => {
    expect(pointInPolygon({ x: 15, y: 5 }, square)).toBe(false);
  });

  it('should return false for point far away', () => {
    expect(pointInPolygon({ x: -5, y: -5 }, square)).toBe(false);
  });
});

describe('SelectTool [LLD-04]', () => {
  const makeShape = (id: string, points: { x: number; y: number }[]): Shape => ({
    id,
    type: 'zone',
    points,
    name: 'Test',
    color: '#ff0000',
  });

  it('should select a shape when clicking inside it', () => {
    const shape = makeShape('s1', [
      { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 },
    ]);
    const onSelect = vi.fn();
    const tool = createSelectTool(
      () => [shape],
      () => null,
      onSelect,
      vi.fn(),
      vi.fn()
    );
    tool.onPointerDown!({
      worldPoint: { x: 5, y: 5 },
      screenPoint: { x: 5, y: 5 },
      shiftKey: false,
    });
    expect(onSelect).toHaveBeenCalledWith('s1');
  });

  it('should deselect when clicking empty space', () => {
    const shape = makeShape('s1', [
      { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 },
    ]);
    const onSelect = vi.fn();
    const tool = createSelectTool(
      () => [shape],
      () => 's1',
      onSelect,
      vi.fn(),
      vi.fn()
    );
    tool.onPointerDown!({
      worldPoint: { x: 50, y: 50 },
      screenPoint: { x: 50, y: 50 },
      shiftKey: false,
    });
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('should call onDelete when Delete key is pressed with selection', () => {
    const onDelete = vi.fn();
    const onSelect = vi.fn();
    const tool = createSelectTool(
      () => [],
      () => 's1',
      onSelect,
      vi.fn(),
      onDelete
    );
    tool.onKeyDown!({ key: 'Delete' } as KeyboardEvent);
    expect(onDelete).toHaveBeenCalledWith('s1');
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
