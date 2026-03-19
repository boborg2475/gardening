import type { ViewTransform, Shape } from '../../types/garden';

export function renderSelection(
  ctx: CanvasRenderingContext2D,
  view: ViewTransform,
  shape: Shape,
) {
  if (shape.vertices.length < 2) return;

  // Draw selection outline
  ctx.beginPath();
  const first = shape.vertices[0];
  ctx.moveTo(first.x * view.scale + view.offsetX, first.y * view.scale + view.offsetY);
  for (let i = 1; i < shape.vertices.length; i++) {
    const v = shape.vertices[i];
    ctx.lineTo(v.x * view.scale + view.offsetX, v.y * view.scale + view.offsetY);
  }
  ctx.closePath();

  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#1a73e8';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw vertex handles
  for (const v of shape.vertices) {
    const sx = v.x * view.scale + view.offsetX;
    const sy = v.y * view.scale + view.offsetY;

    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#1a73e8';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
