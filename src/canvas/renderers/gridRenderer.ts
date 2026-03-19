import type { ViewTransform } from '../../types/garden';

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  view: ViewTransform,
  width: number,
  height: number,
) {
  const gridSpacing = 1; // 1 foot in world units
  const pixelSpacing = gridSpacing * view.scale;

  // Don't render grid if too dense or too sparse
  if (pixelSpacing < 4 || pixelSpacing > 400) return;

  const startX = Math.floor(-view.offsetX / view.scale / gridSpacing) * gridSpacing;
  const endX = Math.ceil((width - view.offsetX) / view.scale / gridSpacing) * gridSpacing;
  const startY = Math.floor(-view.offsetY / view.scale / gridSpacing) * gridSpacing;
  const endY = Math.ceil((height - view.offsetY) / view.scale / gridSpacing) * gridSpacing;

  ctx.beginPath();
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 0.5;

  for (let x = startX; x <= endX; x += gridSpacing) {
    const sx = x * view.scale + view.offsetX;
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, height);
  }

  for (let y = startY; y <= endY; y += gridSpacing) {
    const sy = y * view.scale + view.offsetY;
    ctx.moveTo(0, sy);
    ctx.lineTo(width, sy);
  }

  ctx.stroke();

  // Draw major grid lines every 5 feet
  const majorSpacing = 5;
  const majorPixelSpacing = majorSpacing * view.scale;
  if (majorPixelSpacing >= 20) {
    ctx.beginPath();
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 1;

    const majorStartX = Math.floor(startX / majorSpacing) * majorSpacing;
    const majorStartY = Math.floor(startY / majorSpacing) * majorSpacing;

    for (let x = majorStartX; x <= endX; x += majorSpacing) {
      const sx = x * view.scale + view.offsetX;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }

    for (let y = majorStartY; y <= endY; y += majorSpacing) {
      const sy = y * view.scale + view.offsetY;
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }

    ctx.stroke();
  }
}
