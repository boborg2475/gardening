import type { Point, Shape } from '../../types/garden';
import { CanvasEngine } from '../CanvasEngine';
import type { CanvasTransform } from '../CanvasEngine';

export interface SelectToolCallbacks {
  getShapes: () => Shape[];
  getTransform: () => CanvasTransform;
  screenToWorld: (screen: Point) => Point;
  onSelect: (shapeId: string | null) => void;
  onMove: (shapeId: string, dx: number, dy: number) => void;
  onDelete: (shapeId: string) => void;
}

/**
 * Select tool: click to select shapes, drag to move, Delete to remove.
 */
export class SelectTool {
  private callbacks: SelectToolCallbacks;
  private isDragging = false;
  private dragStartWorld: Point | null = null;
  private dragShapeId: string | null = null;

  constructor(callbacks: SelectToolCallbacks) {
    this.callbacks = callbacks;
  }

  handleMouseDown(screenX: number, screenY: number): void {
    const worldPos = this.callbacks.screenToWorld({ x: screenX, y: screenY });
    const shapes = this.callbacks.getShapes();

    // Find shape under cursor (reverse order = top shape first)
    const hitShape = this.findShapeAtPoint(worldPos, shapes);

    if (hitShape) {
      this.callbacks.onSelect(hitShape.id);
      this.isDragging = true;
      this.dragStartWorld = worldPos;
      this.dragShapeId = hitShape.id;
    } else {
      this.callbacks.onSelect(null);
      this.isDragging = false;
      this.dragStartWorld = null;
      this.dragShapeId = null;
    }
  }

  handleMouseMove(screenX: number, screenY: number): void {
    if (!this.isDragging || !this.dragStartWorld || !this.dragShapeId) return;

    const worldPos = this.callbacks.screenToWorld({ x: screenX, y: screenY });
    const dx = worldPos.x - this.dragStartWorld.x;
    const dy = worldPos.y - this.dragStartWorld.y;

    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
      this.callbacks.onMove(this.dragShapeId, dx, dy);
      this.dragStartWorld = worldPos;
    }
  }

  handleMouseUp(): void {
    this.isDragging = false;
    this.dragStartWorld = null;
    this.dragShapeId = null;
  }

  handleKeyDown(key: string, selectedId: string | null): void {
    if ((key === 'Delete' || key === 'Backspace') && selectedId) {
      this.callbacks.onDelete(selectedId);
      this.callbacks.onSelect(null);
    }
    if (key === 'Escape') {
      this.callbacks.onSelect(null);
    }
  }

  /**
   * Point-in-polygon test using ray casting algorithm.
   */
  private findShapeAtPoint(worldPoint: Point, shapes: Shape[]): Shape | null {
    // Check in reverse order (last drawn = on top)
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (this.isPointInPolygon(worldPoint, shapes[i].vertices)) {
        return shapes[i];
      }
    }
    return null;
  }

  private isPointInPolygon(point: Point, vertices: Point[]): boolean {
    if (vertices.length < 3) return false;

    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x, yi = vertices[i].y;
      const xj = vertices[j].x, yj = vertices[j].y;

      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  }
}

// Export for testing
export { CanvasEngine };
