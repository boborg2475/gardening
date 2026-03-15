import type { CanvasTransform } from '../CanvasEngine';
import { CanvasEngine } from '../CanvasEngine';

/**
 * Renders a background grid in world coordinates.
 * Grid lines are drawn every 1 foot, with major lines every 10 feet.
 */
export function renderGrid(
  ctx: CanvasRenderingContext2D,
  transform: CanvasTransform,
  width: number,
  height: number
): void {
  const scale = CanvasEngine.BASE_SCALE * transform.zoom;

  // Determine grid spacing in pixels
  let gridSpacing = 1; // 1 foot
  // If grid lines would be too dense, increase spacing
  while (gridSpacing * scale < 15) {
    gridSpacing *= 2;
  }
  const majorInterval = gridSpacing * 10;

  // Calculate visible range in world coordinates
  const topLeft = {
    x: -transform.panOffset.x / scale,
    y: -transform.panOffset.y / scale,
  };
  const bottomRight = {
    x: (width - transform.panOffset.x) / scale,
    y: (height - transform.panOffset.y) / scale,
  };

  // Snap to grid
  const startX = Math.floor(topLeft.x / gridSpacing) * gridSpacing;
  const endX = Math.ceil(bottomRight.x / gridSpacing) * gridSpacing;
  const startY = Math.floor(topLeft.y / gridSpacing) * gridSpacing;
  const endY = Math.ceil(bottomRight.y / gridSpacing) * gridSpacing;

  ctx.save();

  // Draw minor grid lines
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 0.5;
  ctx.beginPath();

  for (let x = startX; x <= endX; x += gridSpacing) {
    if (x % majorInterval === 0) continue;
    const sx = x * scale + transform.panOffset.x;
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, height);
  }

  for (let y = startY; y <= endY; y += gridSpacing) {
    if (y % majorInterval === 0) continue;
    const sy = y * scale + transform.panOffset.y;
    ctx.moveTo(0, sy);
    ctx.lineTo(width, sy);
  }

  ctx.stroke();

  // Draw major grid lines
  ctx.strokeStyle = '#bdbdbd';
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = startX; x <= endX; x += gridSpacing) {
    if (x % majorInterval !== 0) continue;
    const sx = x * scale + transform.panOffset.x;
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, height);
  }

  for (let y = startY; y <= endY; y += gridSpacing) {
    if (y % majorInterval !== 0) continue;
    const sy = y * scale + transform.panOffset.y;
    ctx.moveTo(0, sy);
    ctx.lineTo(width, sy);
  }

  ctx.stroke();

  // Draw origin crosshair
  const ox = transform.panOffset.x;
  const oy = transform.panOffset.y;
  ctx.strokeStyle = '#9e9e9e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ox, 0);
  ctx.lineTo(ox, height);
  ctx.moveTo(0, oy);
  ctx.lineTo(width, oy);
  ctx.stroke();

  ctx.restore();
}
