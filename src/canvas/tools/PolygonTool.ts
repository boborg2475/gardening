import type { Point, ViewTransform } from '../../types/garden';
import type { ToolEventHandler } from '../CanvasEngine';

export function createPolygonTool(
  onComplete: (vertices: Point[]) => void,
): ToolEventHandler {
  const vertices: Point[] = [];
  let cursor: Point | null = null;

  return {
    onPointerDown(world: Point, e: PointerEvent) {
      if (e.button !== 0) return;

      if (vertices.length >= 3) {
        // Check if clicking near the first vertex to close
        const first = vertices[0];
        const dx = world.x - first.x;
        const dy = world.y - first.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Use a world-space threshold (0.5 feet)
        if (dist < 0.5) {
          onComplete([...vertices]);
          vertices.length = 0;
          cursor = null;
          return;
        }
      }

      vertices.push({ ...world });
    },

    onPointerMove(world: Point) {
      cursor = { ...world };
    },

    onDoubleClick() {
      if (vertices.length >= 3) {
        onComplete([...vertices]);
        vertices.length = 0;
        cursor = null;
      }
    },

    renderPreview(ctx: CanvasRenderingContext2D, view: ViewTransform) {
      if (vertices.length === 0) return;

      ctx.beginPath();
      const first = vertices[0];
      ctx.moveTo(
        first.x * view.scale + view.offsetX,
        first.y * view.scale + view.offsetY,
      );

      for (let i = 1; i < vertices.length; i++) {
        const v = vertices[i];
        ctx.lineTo(v.x * view.scale + view.offsetX, v.y * view.scale + view.offsetY);
      }

      if (cursor) {
        ctx.lineTo(
          cursor.x * view.scale + view.offsetX,
          cursor.y * view.scale + view.offsetY,
        );
      }

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw vertices
      for (const v of vertices) {
        const sx = v.x * view.scale + view.offsetX;
        const sy = v.y * view.scale + view.offsetY;
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#1a73e8';
        ctx.fill();
      }

      // Highlight first vertex if closeable
      if (vertices.length >= 3 && cursor) {
        const dx = cursor.x - first.x;
        const dy = cursor.y - first.y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.5) {
          const sx = first.x * view.scale + view.offsetX;
          const sy = first.y * view.scale + view.offsetY;
          ctx.beginPath();
          ctx.arc(sx, sy, 8, 0, Math.PI * 2);
          ctx.strokeStyle = '#1a73e8';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    },
  };
}
