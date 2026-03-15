import type { Point } from '../../types/garden';

export interface RectangleToolState {
  startWorld: Point | null;
  currentWorld: Point | null;
  isDragging: boolean;
}

export interface RectangleToolCallbacks {
  onComplete: (vertices: Point[]) => void;
  screenToWorld: (screen: Point) => Point;
}

/**
 * Rectangle drawing tool. Click-drag to create rectangular zones.
 */
export class RectangleTool {
  private _state: RectangleToolState = { startWorld: null, currentWorld: null, isDragging: false };
  private callbacks: RectangleToolCallbacks;

  constructor(callbacks: RectangleToolCallbacks) {
    this.callbacks = callbacks;
  }

  get state(): RectangleToolState {
    return this._state;
  }

  handleMouseDown(screenX: number, screenY: number): void {
    const worldPos = this.callbacks.screenToWorld({ x: screenX, y: screenY });
    this._state = {
      startWorld: worldPos,
      currentWorld: worldPos,
      isDragging: true,
    };
  }

  handleMouseMove(screenX: number, screenY: number): void {
    if (!this._state.isDragging) return;
    const worldPos = this.callbacks.screenToWorld({ x: screenX, y: screenY });
    this._state = {
      ...this._state,
      currentWorld: worldPos,
    };
  }

  handleMouseUp(): void {
    if (!this._state.isDragging || !this._state.startWorld || !this._state.currentWorld) {
      this.reset();
      return;
    }

    const { startWorld, currentWorld } = this._state;
    const minX = Math.min(startWorld.x, currentWorld.x);
    const maxX = Math.max(startWorld.x, currentWorld.x);
    const minY = Math.min(startWorld.y, currentWorld.y);
    const maxY = Math.max(startWorld.y, currentWorld.y);

    // Only create if rectangle has some minimum size (0.5 feet)
    if (maxX - minX > 0.5 && maxY - minY > 0.5) {
      const vertices: Point[] = [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY },
      ];
      this.callbacks.onComplete(vertices);
    }

    this.reset();
  }

  reset(): void {
    this._state = { startWorld: null, currentWorld: null, isDragging: false };
  }

  /** Get preview rectangle vertices (for rendering during drag) */
  getPreviewVertices(): Point[] | null {
    if (!this._state.isDragging || !this._state.startWorld || !this._state.currentWorld) {
      return null;
    }
    const { startWorld, currentWorld } = this._state;
    const minX = Math.min(startWorld.x, currentWorld.x);
    const maxX = Math.max(startWorld.x, currentWorld.x);
    const minY = Math.min(startWorld.y, currentWorld.y);
    const maxY = Math.max(startWorld.y, currentWorld.y);
    return [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ];
  }
}
