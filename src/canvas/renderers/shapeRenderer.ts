import type { Point } from '../../types/garden';
import type { CanvasEngine, Renderer } from '../CanvasEngine';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  engine: CanvasEngine,
  vertices: Point[],
  fillStyle: string,
  strokeStyle: string,
  lineWidth: number
): void {
  if (vertices.length < 2) return;
  ctx.beginPath();
  const first = engine.worldToScreen(vertices[0]);
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < vertices.length; i++) {
    const p = engine.worldToScreen(vertices[i]);
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();

  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  engine: CanvasEngine,
  vertices: Point[],
  label: string
): void {
  if (vertices.length < 3) return;
  // Compute centroid
  let cx = 0, cy = 0;
  for (const v of vertices) {
    cx += v.x;
    cy += v.y;
  }
  cx /= vertices.length;
  cy /= vertices.length;

  const screen = engine.worldToScreen({ x: cx, y: cy });
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, screen.x, screen.y);
}

export function createShapeRenderer(): Renderer {
  return {
    render(ctx: CanvasRenderingContext2D, engine: CanvasEngine) {
      const { project } = useProjectStore.getState();
      const { layerVisibility } = useUIStore.getState();

      // Property boundary
      if (layerVisibility.property && project.propertyBoundary) {
        drawPolygon(
          ctx, engine, project.propertyBoundary.vertices,
          '', '#374151', 2
        );
      }

      // House outline
      if (layerVisibility.house && project.houseOutline) {
        drawPolygon(
          ctx, engine, project.houseOutline.vertices,
          'rgba(107,114,128,0.4)', '#4b5563', 2
        );
      }

      // Zones
      if (layerVisibility.zones) {
        for (const zone of project.zones) {
          drawPolygon(
            ctx, engine, zone.vertices,
            hexToRgba(zone.color, 0.3), zone.color, 2
          );
          drawLabel(ctx, engine, zone.vertices, zone.name);
        }
      }
    },
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Export for testing
export { drawPolygon, hexToRgba };
