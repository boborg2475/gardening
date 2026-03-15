import type { CanvasEngine } from '../CanvasEngine';
import type { Shape } from '../../types/garden';

const SHAPE_STYLES: Record<string, { fillAlpha: number; strokeWidth: number }> = {
  property: { fillAlpha: 0.05, strokeWidth: 2 },
  house: { fillAlpha: 0.3, strokeWidth: 2 },
  zone: { fillAlpha: 0.2, strokeWidth: 1.5 },
};

export function renderShapes(engine: CanvasEngine, shapes: Shape[]): void {
  const { ctx } = engine;
  if (!ctx) return;

  for (const shape of shapes) {
    if (shape.points.length < 2) continue;

    const style = SHAPE_STYLES[shape.type] ?? SHAPE_STYLES.zone;
    const screenPoints = shape.points.map((p) => engine.worldToScreen(p));

    ctx.beginPath();
    ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
    for (let i = 1; i < screenPoints.length; i++) {
      ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
    }
    ctx.closePath();

    ctx.globalAlpha = style.fillAlpha;
    ctx.fillStyle = shape.color;
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = style.strokeWidth;
    ctx.stroke();

    // Draw label
    if (shape.name && screenPoints.length > 0) {
      const cx = screenPoints.reduce((s, p) => s + p.x, 0) / screenPoints.length;
      const cy = screenPoints.reduce((s, p) => s + p.y, 0) / screenPoints.length;
      ctx.fillStyle = '#333';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(shape.name, cx, cy);
    }
  }
}
