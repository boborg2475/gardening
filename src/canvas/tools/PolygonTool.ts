import type { Point, ShapeLayer } from '../../types/garden';

const CLOSE_THRESHOLD_PX = 15; // pixels

export interface PolygonToolState {
  vertices: Point[];
  cursorWorldPos: Point | null;
}

export interface PolygonToolCallbacks {
  onComplete: (vertices: Point[], layer: ShapeLayer) => void;
  screenToWorld: (screen: Point) => Point;
  worldToScreen: (world: Point) => Point;
}

/**
 * Polygon drawing tool. Click to place vertices, click near first vertex to close.
 * Used for property boundary, house outline, and polygon zones.
 */
export class PolygonTool {
  private _state: PolygonToolState = { vertices: [], cursorWorldPos: null };
  private callbacks: PolygonToolCallbacks;
  private layer: ShapeLayer;

  constructor(layer: ShapeLayer, callbacks: PolygonToolCallbacks) {
    this.layer = layer;
    this.callbacks = callbacks;
  }

  get state(): PolygonToolState {
    return this._state;
  }

  handleClick(screenX: number, screenY: number): void {
    const worldPos = this.callbacks.screenToWorld({ x: screenX, y: screenY });

    // Check if closing the polygon
    if (this._state.vertices.length >= 3) {
      const firstVertex = this._state.vertices[0];
      const firstScreen = this.callbacks.worldToScreen(firstVertex);
      const dist = Math.hypot(screenX - firstScreen.x, screenY - firstScreen.y);

      if (dist < CLOSE_THRESHOLD_PX) {
        this.callbacks.onComplete([...this._state.vertices], this.layer);
        this.reset();
        return;
      }
    }

    this._state = {
      ...this._state,
      vertices: [...this._state.vertices, worldPos],
    };
  }

  handleMouseMove(screenX: number, screenY: number): void {
    const worldPos = this.callbacks.screenToWorld({ x: screenX, y: screenY });
    this._state = {
      ...this._state,
      cursorWorldPos: worldPos,
    };
  }

  reset(): void {
    this._state = { vertices: [], cursorWorldPos: null };
  }

  /** Check if a point is close to the first vertex (for UI feedback) */
  isNearFirstVertex(screenX: number, screenY: number): boolean {
    if (this._state.vertices.length < 3) return false;
    const firstScreen = this.callbacks.worldToScreen(this._state.vertices[0]);
    return Math.hypot(screenX - firstScreen.x, screenY - firstScreen.y) < CLOSE_THRESHOLD_PX;
  }
}
