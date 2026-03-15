import type { CanvasEngine } from '../CanvasEngine';
import type { Point, Zone } from '../../types/garden';
import { pointInPolygon } from '../renderers/shapeRenderer';

export interface SelectToolCallbacks {
  getZones: () => Zone[];
  getPropertyBoundary: () => Point[] | null;
  getHouseOutline: () => Point[] | null;
  onSelect: (id: string) => void;
  onDeselect: () => void;
  onMove: (id: string, dx: number, dy: number) => void;
  onDelete: (id: string) => void;
}

export class SelectTool {
  private engine: CanvasEngine;
  private callbacks: SelectToolCallbacks;
  private dragStart: Point | null = null;
  private selectedAtMouseDown: string | null = null;
  private isDragging = false;

  constructor(engine: CanvasEngine, callbacks: SelectToolCallbacks) {
    this.engine = engine;
    this.callbacks = callbacks;
  }

  onMouseDown(sx: number, sy: number): void {
    const world = this.engine.screenToWorld(sx, sy);
    this.dragStart = world;
    this.isDragging = false;

    // Hit test zones (reverse order for topmost first)
    const zones = this.callbacks.getZones();
    for (let i = zones.length - 1; i >= 0; i--) {
      if (zones[i].points.length >= 3 && pointInPolygon(world, zones[i].points)) {
        this.selectedAtMouseDown = zones[i].id;
        this.callbacks.onSelect(zones[i].id);
        return;
      }
    }

    this.selectedAtMouseDown = null;
    this.callbacks.onDeselect();
  }

  onMouseMove(sx: number, sy: number): void {
    if (!this.dragStart || !this.selectedAtMouseDown) return;
    this.isDragging = true;
    // Visual feedback could go here; actual move happens on mouseup
    void sx;
    void sy;
  }

  onMouseUp(sx: number, sy: number): void {
    if (this.isDragging && this.dragStart && this.selectedAtMouseDown) {
      const world = this.engine.screenToWorld(sx, sy);
      const dx = world.x - this.dragStart.x;
      const dy = world.y - this.dragStart.y;
      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
        this.callbacks.onMove(this.selectedAtMouseDown, dx, dy);
      }
    }
    this.dragStart = null;
    this.isDragging = false;
  }

  onDelete(): void {
    if (this.selectedAtMouseDown) {
      this.callbacks.onDelete(this.selectedAtMouseDown);
      this.selectedAtMouseDown = null;
    }
  }
}
