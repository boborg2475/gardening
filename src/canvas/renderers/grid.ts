import type { Viewport, GridConfig } from '../types';

const MIN_SCREEN_PIXELS = 10;

export function getAdaptiveSpacing(baseSpacing: number, zoom: number): number {
  let spacing = baseSpacing;
  while (spacing * zoom < MIN_SCREEN_PIXELS) {
    spacing *= 2;
  }
  return spacing;
}

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  config: GridConfig,
): void {
  const { panX, panY, zoom, canvasWidth, canvasHeight } = viewport;
  const spacing = getAdaptiveSpacing(config.minorSpacing, zoom);
  const majorSpacing = spacing * config.majorEvery;

  // Visible world bounds
  const worldLeft = panX;
  const worldTop = panY;
  const worldRight = panX + canvasWidth / zoom;
  const worldBottom = panY + canvasHeight / zoom;

  // First grid line at or before visible bounds
  const startX = Math.floor(worldLeft / spacing) * spacing;
  const startY = Math.floor(worldTop / spacing) * spacing;

  ctx.save();

  // Minor lines
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.4)';
  ctx.lineWidth = 1 / zoom;

  for (let wx = startX; wx <= worldRight; wx += spacing) {
    const sx = (wx - panX) * zoom;
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, canvasHeight);
  }
  for (let wy = startY; wy <= worldBottom; wy += spacing) {
    const sy = (wy - panY) * zoom;
    ctx.moveTo(0, sy);
    ctx.lineTo(canvasWidth, sy);
  }
  ctx.stroke();

  // Major lines
  const majorStartX = Math.floor(worldLeft / majorSpacing) * majorSpacing;
  const majorStartY = Math.floor(worldTop / majorSpacing) * majorSpacing;

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(160, 160, 160, 0.6)';
  ctx.lineWidth = 1.5 / zoom;

  for (let wx = majorStartX; wx <= worldRight; wx += majorSpacing) {
    const sx = (wx - panX) * zoom;
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, canvasHeight);
  }
  for (let wy = majorStartY; wy <= worldBottom; wy += majorSpacing) {
    const sy = (wy - panY) * zoom;
    ctx.moveTo(0, sy);
    ctx.lineTo(canvasWidth, sy);
  }
  ctx.stroke();

  ctx.restore();
}
