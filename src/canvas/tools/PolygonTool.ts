import { nanoid } from 'nanoid';
import type { Point, ShapeType } from '../../types/garden';
import type { Tool, ToolEvent } from './types';

const CLOSE_THRESHOLD = 10; // pixels

export function createPolygonTool(
  shapeType: ShapeType,
  defaultColor: string,
  defaultName: string,
  onComplete: (points: Point[], shapeType: ShapeType, color: string, name: string) => void,
  worldToScreen: (p: Point) => Point
): Tool & { getVertices: () => Point[] } {
  let vertices: Point[] = [];

  function distScreen(a: Point, b: Point): number {
    const sa = worldToScreen(a);
    const sb = worldToScreen(b);
    return Math.sqrt((sa.x - sb.x) ** 2 + (sa.y - sb.y) ** 2);
  }

  return {
    getVertices: () => [...vertices],

    getPreviewPoints: () => [...vertices],

    onPointerDown(e: ToolEvent) {
      if (vertices.length >= 3 && distScreen(e.worldPoint, vertices[0]) < CLOSE_THRESHOLD) {
        // Close the polygon
        const pts = [...vertices];
        vertices = [];
        onComplete(pts, shapeType, defaultColor, `${defaultName} ${nanoid(4)}`);
        return;
      }
      vertices.push(e.worldPoint);
    },

    onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        vertices = [];
      }
    },

    reset() {
      vertices = [];
    },
  };
}
