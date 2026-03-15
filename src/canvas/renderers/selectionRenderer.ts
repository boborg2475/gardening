import type { CanvasEngine } from '../CanvasEngine';
import type { Point } from '../../types/garden';

export function renderSelection(
  ctx: CanvasRenderingContext2D,
  engine: CanvasEngine,
  points: Point[]
): void {
  if (points.length < 2) return;

  ctx.save();

  // Draw highlight outline
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 3]);
  ctx.beginPath();

  const first = engine.worldToScreen(points[0].x, points[0].y);
  ctx.moveTo(first.x, first.y);

  for (let i = 1; i < points.length; i++) {
    const p = engine.worldToScreen(points[i].x, points[i].y);
    ctx.lineTo(p.x, p.y);
  }

  ctx.closePath();
  ctx.stroke();

  // Draw vertex handles
  ctx.fillStyle = '#2196F3';
  ctx.setLineDash([]);
  for (const point of points) {
    const sp = engine.worldToScreen(point.x, point.y);
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
