import type { Point } from '../../types/garden';
import type { CanvasEngine, Renderer } from '../CanvasEngine';

export interface GridLine {
  worldPos: number;
  isMajor: boolean;
}

export interface GridLines {
  verticals: GridLine[];
  horizontals: GridLine[];
  spacing: number;
}

/**
 * Compute grid line positions in world coordinates for the visible area.
 */
export function computeGridLines(
  canvasWidth: number,
  canvasHeight: number,
  pan: Point,
  zoom: number
): GridLines {
  // Determine spacing: at low zoom use larger intervals
  let spacing = 1; // 1 foot
  if (zoom < 5) spacing = 10; // every 10 feet
  if (zoom < 1) spacing = 50; // every 50 feet

  // Visible world bounds
  const worldMinX = -pan.x / zoom;
  const worldMinY = -pan.y / zoom;
  const worldMaxX = (canvasWidth - pan.x) / zoom;
  const worldMaxY = (canvasHeight - pan.y) / zoom;

  const startX = Math.floor(worldMinX / spacing) * spacing;
  const startY = Math.floor(worldMinY / spacing) * spacing;

  const verticals: GridLine[] = [];
  for (let x = startX; x <= worldMaxX; x += spacing) {
    verticals.push({ worldPos: x, isMajor: x % (spacing * 10) === 0 });
  }

  const horizontals: GridLine[] = [];
  for (let y = startY; y <= worldMaxY; y += spacing) {
    horizontals.push({ worldPos: y, isMajor: y % (spacing * 10) === 0 });
  }

  return { verticals, horizontals, spacing };
}

export function createGridRenderer(): Renderer {
  return {
    render(ctx: CanvasRenderingContext2D, engine: CanvasEngine) {
      const canvas = engine.getCanvas();
      if (!canvas) return;

      const { width, height } = canvas;
      const pan = engine.getPan();
      const zoom = engine.getZoom();
      const { verticals, horizontals } = computeGridLines(width, height, pan, zoom);

      ctx.lineWidth = 1;

      for (const line of verticals) {
        const screenX = line.worldPos * zoom + pan.x;
        ctx.strokeStyle = line.isMajor ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.07)';
        ctx.beginPath();
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, height);
        ctx.stroke();
      }

      for (const line of horizontals) {
        const screenY = line.worldPos * zoom + pan.y;
        ctx.strokeStyle = line.isMajor ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.07)';
        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(width, screenY);
        ctx.stroke();
      }
    },
  };
}
