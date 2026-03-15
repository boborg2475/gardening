import type { Point } from '../../types/garden';
import type { Tool, ToolEvent } from './types';

export function createRectangleTool(
  onComplete: (points: Point[]) => void
): Tool & { getStartPoint: () => Point | null; getCurrentPoint: () => Point | null } {
  let startPoint: Point | null = null;
  let currentPoint: Point | null = null;

  function makeRectPoints(a: Point, b: Point): Point[] {
    return [
      { x: a.x, y: a.y },
      { x: b.x, y: a.y },
      { x: b.x, y: b.y },
      { x: a.x, y: b.y },
    ];
  }

  return {
    getStartPoint: () => startPoint,
    getCurrentPoint: () => currentPoint,

    getPreviewPoints() {
      if (!startPoint || !currentPoint) return [];
      return makeRectPoints(startPoint, currentPoint);
    },

    onPointerDown(e: ToolEvent) {
      startPoint = e.worldPoint;
      currentPoint = e.worldPoint;
    },

    onPointerMove(e: ToolEvent) {
      if (startPoint) {
        currentPoint = e.worldPoint;
      }
    },

    onPointerUp() {
      if (startPoint && currentPoint) {
        const dx = Math.abs(currentPoint.x - startPoint.x);
        const dy = Math.abs(currentPoint.y - startPoint.y);
        if (dx > 0.5 && dy > 0.5) {
          onComplete(makeRectPoints(startPoint, currentPoint));
        }
      }
      startPoint = null;
      currentPoint = null;
    },

    onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        startPoint = null;
        currentPoint = null;
      }
    },

    reset() {
      startPoint = null;
      currentPoint = null;
    },
  };
}
