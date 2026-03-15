import type { CanvasTransform } from '../CanvasEngine';
import { CanvasEngine } from '../CanvasEngine';
import type { Shape, Point } from '../../types/garden';

/** Color config by layer */
const LAYER_STYLES: Record<string, { fill: string; stroke: string; lineWidth: number }> = {
  property: { fill: 'rgba(33, 150, 243, 0.1)', stroke: '#1565C0', lineWidth: 2 },
  house: { fill: 'rgba(121, 85, 72, 0.3)', stroke: '#4E342E', lineWidth: 2 },
  zone: { fill: 'rgba(76, 175, 80, 0.2)', stroke: '#2E7D32', lineWidth: 1.5 },
};

function worldToScreen(point: Point, transform: CanvasTransform): Point {
  const scale = CanvasEngine.BASE_SCALE * transform.zoom;
  return {
    x: point.x * scale + transform.panOffset.x,
    y: point.y * scale + transform.panOffset.y,
  };
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  vertices: Point[],
  transform: CanvasTransform,
  style: { fill: string; stroke: string; lineWidth: number }
): void {
  if (vertices.length < 2) return;

  const screenVerts = vertices.map((v) => worldToScreen(v, transform));

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(screenVerts[0].x, screenVerts[0].y);
  for (let i = 1; i < screenVerts.length; i++) {
    ctx.lineTo(screenVerts[i].x, screenVerts[i].y);
  }
  ctx.closePath();

  ctx.fillStyle = style.fill;
  ctx.fill();

  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = style.lineWidth;
  ctx.stroke();

  ctx.restore();
}

function drawZoneLabel(
  ctx: CanvasRenderingContext2D,
  vertices: Point[],
  label: string,
  transform: CanvasTransform
): void {
  if (vertices.length < 3 || !label) return;

  // Calculate centroid
  let cx = 0;
  let cy = 0;
  for (const v of vertices) {
    cx += v.x;
    cy += v.y;
  }
  cx /= vertices.length;
  cy /= vertices.length;

  const screen = worldToScreen({ x: cx, y: cy }, transform);

  ctx.save();
  ctx.font = `${Math.max(10, 12 * transform.zoom)}px sans-serif`;
  ctx.fillStyle = '#1B5E20';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, screen.x, screen.y);
  ctx.restore();
}

/**
 * Renders all shapes on the canvas.
 */
export function renderShapes(
  ctx: CanvasRenderingContext2D,
  transform: CanvasTransform,
  shapes: Shape[]
): void {
  // Render in layer order: property, house, zones
  const layerOrder: string[] = ['property', 'house', 'zone'];

  for (const layer of layerOrder) {
    const layerShapes = shapes.filter((s) => s.layer === layer);
    for (const shape of layerShapes) {
      const style = shape.layer === 'zone' && 'metadata' in shape
        ? { ...LAYER_STYLES.zone, fill: hexToRgba(shape.metadata.color, 0.25), stroke: shape.metadata.color }
        : LAYER_STYLES[shape.layer] || LAYER_STYLES.property;

      drawPolygon(ctx, shape.vertices, transform, style);

      if (shape.layer === 'zone' && 'metadata' in shape) {
        drawZoneLabel(ctx, shape.vertices, shape.metadata.name, transform);
      }
    }
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(76, 175, 80, ${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Renders in-progress polygon vertices (during drawing).
 */
export function renderInProgressPolygon(
  ctx: CanvasRenderingContext2D,
  transform: CanvasTransform,
  vertices: Point[],
  cursorPos: Point | null
): void {
  if (vertices.length === 0) return;

  const screenVerts = vertices.map((v) => worldToScreen(v, transform));

  ctx.save();

  // Draw lines between placed vertices
  ctx.strokeStyle = '#FF9800';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);
  ctx.beginPath();
  ctx.moveTo(screenVerts[0].x, screenVerts[0].y);
  for (let i = 1; i < screenVerts.length; i++) {
    ctx.lineTo(screenVerts[i].x, screenVerts[i].y);
  }

  // Draw line to cursor
  if (cursorPos) {
    const screenCursor = worldToScreen(cursorPos, transform);
    ctx.lineTo(screenCursor.x, screenCursor.y);
  }

  ctx.stroke();
  ctx.setLineDash([]);

  // Draw vertex dots
  ctx.fillStyle = '#FF9800';
  for (const sv of screenVerts) {
    ctx.beginPath();
    ctx.arc(sv.x, sv.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Highlight first vertex (close target)
  if (screenVerts.length >= 3) {
    ctx.strokeStyle = '#F44336';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenVerts[0].x, screenVerts[0].y, 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}
