import type { Point, Shape } from '../../types/garden';
import type { Tool, ToolEvent } from './types';

/** Point-in-polygon test using ray casting */
export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function createSelectTool(
  getShapes: () => Shape[],
  getSelectedId: () => string | null,
  onSelect: (id: string | null) => void,
  onMove: (id: string, dx: number, dy: number) => void,
  onDelete: (id: string) => void
): Tool {
  let isDragging = false;
  let lastWorld: Point | null = null;

  return {
    onPointerDown(e: ToolEvent) {
      const shapes = getShapes();
      // Test shapes in reverse order (top-most first)
      for (let i = shapes.length - 1; i >= 0; i--) {
        if (pointInPolygon(e.worldPoint, shapes[i].points)) {
          onSelect(shapes[i].id);
          isDragging = true;
          lastWorld = e.worldPoint;
          return;
        }
      }
      onSelect(null);
      isDragging = false;
      lastWorld = null;
    },

    onPointerMove(e: ToolEvent) {
      if (isDragging && lastWorld && getSelectedId()) {
        const dx = e.worldPoint.x - lastWorld.x;
        const dy = e.worldPoint.y - lastWorld.y;
        onMove(getSelectedId()!, dx, dy);
        lastWorld = e.worldPoint;
      }
    },

    onPointerUp() {
      isDragging = false;
      lastWorld = null;
    },

    onKeyDown(e: KeyboardEvent) {
      if ((e.key === 'Delete' || e.key === 'Backspace') && getSelectedId()) {
        onDelete(getSelectedId()!);
        onSelect(null);
      }
    },

    reset() {
      isDragging = false;
      lastWorld = null;
    },
  };
}
