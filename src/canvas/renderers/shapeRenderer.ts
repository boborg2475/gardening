import type { ViewTransform, Project, Shape, Point } from '../../types/garden';

export function renderShapes(
  ctx: CanvasRenderingContext2D,
  view: ViewTransform,
  project: Project,
) {
  if (project.property) {
    drawPolygon(ctx, view, project.property.vertices, {
      fill: 'rgba(144, 238, 144, 0.15)',
      stroke: '#2d5a2d',
      lineWidth: 2,
      dash: [8, 4],
    });
  }

  if (project.house) {
    drawPolygon(ctx, view, project.house.vertices, {
      fill: 'rgba(160, 140, 120, 0.6)',
      stroke: '#5c4033',
      lineWidth: 2,
    });
  }

  for (const zone of project.zones) {
    drawPolygon(ctx, view, zone.vertices, {
      fill: hexToRgba(zone.color, 0.3),
      stroke: zone.color,
      lineWidth: 1.5,
    });

    // Draw zone name label
    if (zone.vertices.length >= 3) {
      const center = centroid(zone.vertices);
      const sx = center.x * view.scale + view.offsetX;
      const sy = center.y * view.scale + view.offsetY;
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(zone.name, sx, sy);
    }
  }
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  view: ViewTransform,
  vertices: Point[],
  style: { fill: string; stroke: string; lineWidth: number; dash?: number[] },
) {
  if (vertices.length < 2) return;

  ctx.beginPath();
  const first = vertices[0];
  ctx.moveTo(first.x * view.scale + view.offsetX, first.y * view.scale + view.offsetY);
  for (let i = 1; i < vertices.length; i++) {
    const v = vertices[i];
    ctx.lineTo(v.x * view.scale + view.offsetX, v.y * view.scale + view.offsetY);
  }
  ctx.closePath();

  ctx.fillStyle = style.fill;
  ctx.fill();

  ctx.setLineDash(style.dash ?? []);
  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = style.lineWidth;
  ctx.stroke();
  ctx.setLineDash([]);
}

function centroid(vertices: Point[]): Point {
  let cx = 0, cy = 0;
  for (const v of vertices) {
    cx += v.x;
    cy += v.y;
  }
  return { x: cx / vertices.length, y: cy / vertices.length };
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function renderShape(
  ctx: CanvasRenderingContext2D,
  view: ViewTransform,
  shape: Shape,
) {
  const styles: Record<string, { fill: string; stroke: string; lineWidth: number; dash?: number[] }> = {
    property: { fill: 'rgba(144, 238, 144, 0.15)', stroke: '#2d5a2d', lineWidth: 2, dash: [8, 4] },
    house: { fill: 'rgba(160, 140, 120, 0.6)', stroke: '#5c4033', lineWidth: 2 },
    zone: { fill: 'rgba(100, 200, 100, 0.3)', stroke: '#4a7c4a', lineWidth: 1.5 },
  };
  drawPolygon(ctx, view, shape.vertices, styles[shape.kind] ?? styles.zone);
}
