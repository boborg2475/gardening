import type { CanvasEngine } from '../CanvasEngine';
import type { Shape } from '../../types/garden';

const SELECTION_COLOR = '#2196F3';
const HANDLE_RADIUS = 5;

export function renderSelection(
  ctx: CanvasRenderingContext2D,
  engine: CanvasEngine,
  shape: Shape | undefined,
): void {
  if (!shape || shape.points.length < 2) return;

  // Draw dashed outline
  ctx.beginPath();
  const first = engine.worldToScreen(shape.points[0].x, shape.points[0].y);
  ctx.moveTo(first.x, first.y);

  for (let i = 1; i < shape.points.length; i++) {
    const p = engine.worldToScreen(shape.points[i].x, shape.points[i].y);
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();

  ctx.strokeStyle = SELECTION_COLOR;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw vertex handles
  for (const point of shape.points) {
    const screen = engine.worldToScreen(point.x, point.y);
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, HANDLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = SELECTION_COLOR;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
