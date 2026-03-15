import type { CanvasEngine } from '../CanvasEngine';

const GRID_SPACING = 1; // 1 foot

export function renderGrid(engine: CanvasEngine): void {
  const { ctx } = engine;
  if (!ctx) return;

  const topLeft = engine.screenToWorld({ x: 0, y: 0 });
  const bottomRight = engine.screenToWorld({ x: engine.width, y: engine.height });

  const startX = Math.floor(topLeft.x / GRID_SPACING) * GRID_SPACING;
  const startY = Math.floor(topLeft.y / GRID_SPACING) * GRID_SPACING;
  const endX = Math.ceil(bottomRight.x / GRID_SPACING) * GRID_SPACING;
  const endY = Math.ceil(bottomRight.y / GRID_SPACING) * GRID_SPACING;

  ctx.fillStyle = '#ccc';
  const dotSize = Math.max(1, engine.zoom * 0.5);

  for (let wx = startX; wx <= endX; wx += GRID_SPACING) {
    for (let wy = startY; wy <= endY; wy += GRID_SPACING) {
      const screen = engine.worldToScreen({ x: wx, y: wy });
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
