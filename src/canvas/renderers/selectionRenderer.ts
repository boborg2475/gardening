import type { CanvasEngine } from '../CanvasEngine';
import type { Shape } from '../../types/garden';

const HANDLE_RADIUS = 4;

export function renderSelection(engine: CanvasEngine, shape: Shape | undefined): void {
  const { ctx } = engine;
  if (!ctx || !shape || shape.points.length < 2) return;

  const screenPoints = shape.points.map((p) => engine.worldToScreen(p));

  // Dashed outline
  ctx.beginPath();
  ctx.setLineDash([6, 3]);
  ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
  for (let i = 1; i < screenPoints.length; i++) {
    ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
  }
  ctx.closePath();
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);

  // Vertex handles
  for (const p of screenPoints) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, HANDLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
