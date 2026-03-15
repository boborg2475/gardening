import type { CanvasEngine } from '../CanvasEngine';

const GRID_COLOR = '#e0e0e0';
const GRID_COLOR_MAJOR = '#c0c0c0';
const GRID_SPACING = 1; // 1 foot in world coords

export function renderGrid(ctx: CanvasRenderingContext2D, engine: CanvasEngine): void {
  const { width, height } = engine.getCanvasSize();
  const camera = engine.getCamera();

  // Determine grid spacing based on zoom level
  let spacing = GRID_SPACING;
  const pixelsPerUnit = camera.zoom;

  // Scale grid spacing so lines aren't too dense or sparse
  if (pixelsPerUnit < 5) spacing = 20;
  else if (pixelsPerUnit < 10) spacing = 10;
  else if (pixelsPerUnit < 25) spacing = 5;
  else spacing = 1;

  const majorInterval = spacing * 5;

  // Calculate visible world bounds
  const topLeft = engine.screenToWorld(0, 0);
  const bottomRight = engine.screenToWorld(width, height);

  const startX = Math.floor(topLeft.x / spacing) * spacing;
  const endX = Math.ceil(bottomRight.x / spacing) * spacing;
  const startY = Math.floor(topLeft.y / spacing) * spacing;
  const endY = Math.ceil(bottomRight.y / spacing) * spacing;

  ctx.lineWidth = 1;

  // Draw vertical lines
  for (let wx = startX; wx <= endX; wx += spacing) {
    const isMajor = Math.abs(wx % majorInterval) < 0.001;
    ctx.strokeStyle = isMajor ? GRID_COLOR_MAJOR : GRID_COLOR;
    ctx.lineWidth = isMajor ? 1 : 0.5;

    const screenX = engine.worldToScreen(wx, 0).x;
    ctx.beginPath();
    ctx.moveTo(screenX, 0);
    ctx.lineTo(screenX, height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let wy = startY; wy <= endY; wy += spacing) {
    const isMajor = Math.abs(wy % majorInterval) < 0.001;
    ctx.strokeStyle = isMajor ? GRID_COLOR_MAJOR : GRID_COLOR;
    ctx.lineWidth = isMajor ? 1 : 0.5;

    const screenY = engine.worldToScreen(0, wy).y;
    ctx.beginPath();
    ctx.moveTo(0, screenY);
    ctx.lineTo(width, screenY);
    ctx.stroke();
  }
}
