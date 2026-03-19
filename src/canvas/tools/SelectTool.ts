import type { Point } from '../../types/garden';
import type { CanvasEngine, ToolEventHandler } from '../CanvasEngine';

export function createSelectTool(
  engine: CanvasEngine,
  callbacks: {
    onSelect: (id: string | null) => void;
    onMove: (id: string, dx: number, dy: number) => void;
  },
): ToolEventHandler {
  let dragging = false;
  let dragId: string | null = null;
  let lastWorld: Point | null = null;

  return {
    onPointerDown(world: Point, e: PointerEvent) {
      if (e.button !== 0) return;

      const shape = engine.findShapeAt(world);
      if (shape) {
        callbacks.onSelect(shape.id);
        dragging = true;
        dragId = shape.id;
        lastWorld = { ...world };
      } else {
        callbacks.onSelect(null);
        dragging = false;
        dragId = null;
      }
    },

    onPointerMove(world: Point) {
      if (dragging && dragId && lastWorld) {
        const dx = world.x - lastWorld.x;
        const dy = world.y - lastWorld.y;
        callbacks.onMove(dragId, dx, dy);
        lastWorld = { ...world };
      }
    },

    onPointerUp() {
      dragging = false;
      dragId = null;
      lastWorld = null;
    },
  };
}
