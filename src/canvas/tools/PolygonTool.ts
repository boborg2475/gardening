import type { CanvasEngine } from '../CanvasEngine';
import type { Point } from '../../types/garden';

const CLOSE_THRESHOLD_PX = 15;

export class PolygonTool {
  private engine: CanvasEngine;
  private onCreate: (points: Point[]) => void;
  private vertices: Point[] = [];
  private mousePos: Point | null = null;

  constructor(engine: CanvasEngine, onCreate: (points: Point[]) => void) {
    this.engine = engine;
    this.onCreate = onCreate;
  }

  onClick(sx: number, sy: number): void {
    const world = this.engine.screenToWorld(sx, sy);

    // Check if closing the polygon
    if (this.vertices.length >= 3) {
      const firstScreen = this.engine.worldToScreen(this.vertices[0].x, this.vertices[0].y);
      const dist = Math.hypot(sx - firstScreen.x, sy - firstScreen.y);
      if (dist < CLOSE_THRESHOLD_PX) {
        this.onCreate([...this.vertices]);
        this.vertices = [];
        return;
      }
    }

    this.vertices.push(world);
  }

  onMouseMove(sx: number, sy: number): void {
    this.mousePos = this.engine.screenToWorld(sx, sy);
  }

  getVertices(): Point[] {
    return [...this.vertices];
  }

  getMousePos(): Point | null {
    return this.mousePos;
  }

  onCancel(): void {
    this.vertices = [];
    this.mousePos = null;
  }
}
