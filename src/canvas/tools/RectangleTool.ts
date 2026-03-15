import type { CanvasEngine } from '../CanvasEngine';
import type { Point } from '../../types/garden';

export class RectangleTool {
  private engine: CanvasEngine;
  private onCreate: (points: Point[]) => void;
  private startScreen: Point | null = null;
  private currentScreen: Point | null = null;
  private dragging = false;

  constructor(engine: CanvasEngine, onCreate: (points: Point[]) => void) {
    this.engine = engine;
    this.onCreate = onCreate;
  }

  onMouseDown(sx: number, sy: number): void {
    this.startScreen = { x: sx, y: sy };
    this.currentScreen = { x: sx, y: sy };
    this.dragging = true;
  }

  onMouseMove(sx: number, sy: number): void {
    if (!this.dragging) return;
    this.currentScreen = { x: sx, y: sy };
  }

  onMouseUp(sx: number, sy: number): void {
    if (!this.dragging || !this.startScreen) {
      this.reset();
      return;
    }

    const start = this.engine.screenToWorld(this.startScreen.x, this.startScreen.y);
    const end = this.engine.screenToWorld(sx, sy);

    // Require minimum size
    if (Math.abs(end.x - start.x) < 0.1 && Math.abs(end.y - start.y) < 0.1) {
      this.reset();
      return;
    }

    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    const points: Point[] = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ];

    this.onCreate(points);
    this.reset();
  }

  getPreviewPoints(): Point[] {
    if (!this.dragging || !this.startScreen || !this.currentScreen) return [];

    const start = this.engine.screenToWorld(this.startScreen.x, this.startScreen.y);
    const end = this.engine.screenToWorld(this.currentScreen.x, this.currentScreen.y);

    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    return [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ];
  }

  private reset(): void {
    this.startScreen = null;
    this.currentScreen = null;
    this.dragging = false;
  }
}
