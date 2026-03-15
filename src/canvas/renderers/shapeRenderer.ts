import type { CanvasEngine } from '../CanvasEngine';
import type { Point, Zone } from '../../types/garden';

export function renderPolygon(
  ctx: CanvasRenderingContext2D,
  engine: CanvasEngine,
  points: Point[],
  strokeColor: string,
  fillColor: string | null,
  lineWidth = 2
): void {
  if (points.length < 2) return;

  ctx.save();
  ctx.beginPath();
  const first = engine.worldToScreen(points[0].x, points[0].y);
  ctx.moveTo(first.x, first.y);

  for (let i = 1; i < points.length; i++) {
    const p = engine.worldToScreen(points[i].x, points[i].y);
    ctx.lineTo(p.x, p.y);
  }

  ctx.closePath();

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

export function renderPropertyBoundary(
  ctx: CanvasRenderingContext2D,
  engine: CanvasEngine,
  points: Point[]
): void {
  renderPolygon(ctx, engine, points, '#333333', null, 2);
  // Draw dashed boundary
  if (points.length < 2) return;
  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const first = engine.worldToScreen(points[0].x, points[0].y);
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < points.length; i++) {
    const p = engine.worldToScreen(points[i].x, points[i].y);
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export function renderHouseOutline(
  ctx: CanvasRenderingContext2D,
  engine: CanvasEngine,
  points: Point[]
): void {
  renderPolygon(ctx, engine, points, '#555555', '#d4c5a9', 2);
}

export function renderZone(
  ctx: CanvasRenderingContext2D,
  engine: CanvasEngine,
  zone: Zone
): void {
  // Semi-transparent fill
  const fillColor = zone.color + '40'; // 25% opacity
  renderPolygon(ctx, engine, zone.points, zone.color, fillColor, 2);

  // Draw label
  if (zone.points.length >= 3) {
    const center = getPolygonCenter(zone.points);
    const screenCenter = engine.worldToScreen(center.x, center.y);
    ctx.save();
    ctx.fillStyle = '#333333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(zone.name, screenCenter.x, screenCenter.y);
    ctx.restore();
  }
}

export function renderPolygonPreview(
  ctx: CanvasRenderingContext2D,
  engine: CanvasEngine,
  points: Point[],
  color: string
): void {
  if (points.length === 0) return;

  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  const first = engine.worldToScreen(points[0].x, points[0].y);
  ctx.moveTo(first.x, first.y);

  for (let i = 1; i < points.length; i++) {
    const p = engine.worldToScreen(points[i].x, points[i].y);
    ctx.lineTo(p.x, p.y);
  }

  ctx.stroke();

  // Draw vertices
  ctx.fillStyle = color;
  for (const point of points) {
    const sp = engine.worldToScreen(point.x, point.y);
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function getPolygonCenter(points: Point[]): Point {
  let cx = 0;
  let cy = 0;
  for (const p of points) {
    cx += p.x;
    cy += p.y;
  }
  return { x: cx / points.length, y: cy / points.length };
}

export function pointInPolygon(test: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > test.y !== yj > test.y &&
      test.x < ((xj - xi) * (test.y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}
