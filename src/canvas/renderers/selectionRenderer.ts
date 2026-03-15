import type { CanvasTransform } from '../CanvasEngine';
import { CanvasEngine } from '../CanvasEngine';
import type { Shape, Point } from '../../types/garden';

function worldToScreen(point: Point, transform: CanvasTransform): Point {
  const scale = CanvasEngine.BASE_SCALE * transform.zoom;
  return {
    x: point.x * scale + transform.panOffset.x,
    y: point.y * scale + transform.panOffset.y,
  };
}

/**
 * Renders selection highlight around the selected shape.
 */
export function renderSelection(
  ctx: CanvasRenderingContext2D,
  transform: CanvasTransform,
  shape: Shape | undefined
): void {
  if (!shape || shape.vertices.length < 2) return;

  const screenVerts = shape.vertices.map((v) => worldToScreen(v, transform));

  ctx.save();

  // Draw highlight outline
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(screenVerts[0].x, screenVerts[0].y);
  for (let i = 1; i < screenVerts.length; i++) {
    ctx.lineTo(screenVerts[i].x, screenVerts[i].y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw vertex handles
  ctx.fillStyle = '#2196F3';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  for (const sv of screenVerts) {
    ctx.beginPath();
    ctx.arc(sv.x, sv.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
