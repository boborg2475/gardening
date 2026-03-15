import type { CanvasEngine } from '../CanvasEngine';

export function renderGrid(ctx: CanvasRenderingContext2D, engine: CanvasEngine, width: number, height: number): void {
  const zoom = engine.getZoom();
  const ppf = engine.getPixelsPerFoot();
  const gridSpacing = ppf * zoom; // 1 foot in screen pixels

  // Skip rendering if grid too small to see
  if (gridSpacing < 4) return;

  const pan = engine.getPan();

  // Calculate visible range
  const startX = pan.x % gridSpacing;
  const startY = pan.y % gridSpacing;

  ctx.save();
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 0.5;

  // Vertical lines
  for (let x = startX; x < width; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = startY; y < height; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Major grid lines every 5 feet
  const majorSpacing = gridSpacing * 5;
  if (majorSpacing >= 20) {
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 1;

    const majorStartX = pan.x % majorSpacing;
    const majorStartY = pan.y % majorSpacing;

    for (let x = majorStartX; x < width; x += majorSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = majorStartY; y < height; y += majorSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  ctx.restore();
}
