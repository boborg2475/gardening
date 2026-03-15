import type { Point } from '../../types/garden';
import type { CanvasEngine } from '../CanvasEngine';
import type { Tool } from './Tool';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';

export class RectangleTool implements Tool {
  private startPoint: Point | null = null;
  private currentPoint: Point | null = null;

  onMouseDown(worldPos: Point, _engine: CanvasEngine): void {
    this.startPoint = worldPos;
    this.currentPoint = worldPos;
  }

  onMouseMove(worldPos: Point, _engine: CanvasEngine): void {
    if (this.startPoint) {
      this.currentPoint = worldPos;
    }
  }

  onMouseUp(worldPos: Point, _engine: CanvasEngine): void {
    if (!this.startPoint) return;

    const start = this.startPoint;
    const end = worldPos;

    // Don't create zero-area rectangles
    if (start.x === end.x && start.y === end.y) {
      this.startPoint = null;
      this.currentPoint = null;
      return;
    }

    const vertices: Point[] = [
      { x: start.x, y: start.y },
      { x: end.x, y: start.y },
      { x: end.x, y: end.y },
      { x: start.x, y: end.y },
    ];

    useProjectStore.getState().addZone({
      name: 'New Zone',
      color: '#22c55e',
      sunExposure: 'full',
      soilType: 'loam',
      notes: '',
      vertices,
    });

    this.startPoint = null;
    this.currentPoint = null;
    useUIStore.getState().setActiveTool('select');
  }

  renderPreview(ctx: CanvasRenderingContext2D, engine: CanvasEngine): void {
    if (!this.startPoint || !this.currentPoint) return;

    const s = engine.worldToScreen(this.startPoint);
    const c = engine.worldToScreen(this.currentPoint);

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(s.x, s.y, c.x - s.x, c.y - s.y);
    ctx.setLineDash([]);
  }
}
