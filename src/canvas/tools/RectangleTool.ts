import type { Point, ViewTransform } from '../../types/garden';
import type { ToolEventHandler } from '../CanvasEngine';

export function createRectangleTool(
  onComplete: (vertices: Point[]) => void,
): ToolEventHandler {
  let start: Point | null = null;
  let current: Point | null = null;

  return {
    onPointerDown(world: Point, e: PointerEvent) {
      if (e.button !== 0) return;
      start = { ...world };
      current = { ...world };
    },

    onPointerMove(world: Point) {
      if (start) {
        current = { ...world };
      }
    },

    onPointerUp() {
      if (start && current) {
        const minX = Math.min(start.x, current.x);
        const maxX = Math.max(start.x, current.x);
        const minY = Math.min(start.y, current.y);
        const maxY = Math.max(start.y, current.y);

        // Only create if it has some size
        if (maxX - minX > 0.2 && maxY - minY > 0.2) {
          onComplete([
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY },
          ]);
        }
      }
      start = null;
      current = null;
    },

    renderPreview(ctx: CanvasRenderingContext2D, view: ViewTransform) {
      if (!start || !current) return;

      const sx1 = start.x * view.scale + view.offsetX;
      const sy1 = start.y * view.scale + view.offsetY;
      const sx2 = current.x * view.scale + view.offsetX;
      const sy2 = current.y * view.scale + view.offsetY;

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        Math.min(sx1, sx2),
        Math.min(sy1, sy2),
        Math.abs(sx2 - sx1),
        Math.abs(sy2 - sy1),
      );
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(100, 200, 100, 0.15)';
      ctx.fillRect(
        Math.min(sx1, sx2),
        Math.min(sy1, sy2),
        Math.abs(sx2 - sx1),
        Math.abs(sy2 - sy1),
      );
    },
  };
}
