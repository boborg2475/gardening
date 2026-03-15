import type { CanvasEngine } from '../CanvasEngine';
import type { Shape } from '../../types/garden';
import { isZone } from '../../types/garden';

const SHAPE_STYLES: Record<string, { fillAlpha: number; strokeColor: string; strokeWidth: number }> = {
  property: { fillAlpha: 0.05, strokeColor: '#333333', strokeWidth: 2 },
  house: { fillAlpha: 0.3, strokeColor: '#555555', strokeWidth: 2 },
  zone: { fillAlpha: 0.25, strokeColor: '#000000', strokeWidth: 1.5 },
};

export function renderShapes(
  ctx: CanvasRenderingContext2D,
  engine: CanvasEngine,
  shapes: Shape[],
): void {
  for (const shape of shapes) {
    renderShape(ctx, engine, shape);
  }
}

function renderShape(
  ctx: CanvasRenderingContext2D,
  engine: CanvasEngine,
  shape: Shape,
): void {
  if (shape.points.length < 2) return;

  const style = SHAPE_STYLES[shape.type] ?? SHAPE_STYLES.zone;

  // Draw filled polygon
  ctx.beginPath();
  const first = engine.worldToScreen(shape.points[0].x, shape.points[0].y);
  ctx.moveTo(first.x, first.y);

  for (let i = 1; i < shape.points.length; i++) {
    const p = engine.worldToScreen(shape.points[i].x, shape.points[i].y);
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();

  // Fill
  ctx.globalAlpha = style.fillAlpha;
  ctx.fillStyle = shape.color;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Stroke
  ctx.strokeStyle = style.strokeColor;
  ctx.lineWidth = style.strokeWidth;
  ctx.stroke();

  // Label
  if (shape.name) {
    renderLabel(ctx, engine, shape);
  }
}

function renderLabel(
  ctx: CanvasRenderingContext2D,
  engine: CanvasEngine,
  shape: Shape,
): void {
  // Calculate centroid for label placement
  let cx = 0;
  let cy = 0;
  for (const p of shape.points) {
    cx += p.x;
    cy += p.y;
  }
  cx /= shape.points.length;
  cy /= shape.points.length;

  const screen = engine.worldToScreen(cx, cy);
  const fontSize = Math.max(10, Math.min(14, engine.getCamera().zoom * 4));

  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Background for readability
  const text = shape.name;
  const metrics = ctx.measureText(text);
  const padding = 3;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(
    screen.x - metrics.width / 2 - padding,
    screen.y - fontSize / 2 - padding,
    metrics.width + padding * 2,
    fontSize + padding * 2,
  );

  ctx.fillStyle = '#333';
  ctx.fillText(text, screen.x, screen.y);

  // Show sun exposure for zones
  if (isZone(shape) && shape.sunExposure) {
    const subText = shape.sunExposure;
    ctx.font = `${fontSize * 0.75}px sans-serif`;
    ctx.fillStyle = '#666';
    ctx.fillText(subText, screen.x, screen.y + fontSize);
  }
}
