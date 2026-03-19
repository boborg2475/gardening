import type { Point, ViewTransform, Project, Shape } from '../types/garden';
import { renderGrid } from './renderers/gridRenderer';
import { renderShapes } from './renderers/shapeRenderer';
import { renderSelection } from './renderers/selectionRenderer';

export type ToolEventHandler = {
  onPointerDown?(world: Point, e: PointerEvent): void;
  onPointerMove?(world: Point, e: PointerEvent): void;
  onPointerUp?(world: Point, e: PointerEvent): void;
  onDoubleClick?(world: Point, e: MouseEvent): void;
  renderPreview?(ctx: CanvasRenderingContext2D, view: ViewTransform): void;
};

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId = 0;
  private view: ViewTransform = { offsetX: 0, offsetY: 0, scale: 20 };
  private project: Project | null = null;
  private selectedId: string | null = null;
  private toolHandler: ToolEventHandler | null = null;
  private isPanning = false;
  private lastPan: Point = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.attachListeners();
    this.startLoop();
  }

  setView(v: ViewTransform) {
    this.view = v;
  }

  setProject(p: Project) {
    this.project = p;
  }

  setSelectedId(id: string | null) {
    this.selectedId = id;
  }

  setToolHandler(handler: ToolEventHandler | null) {
    this.toolHandler = handler;
  }

  screenToWorld(sx: number, sy: number): Point {
    return {
      x: (sx - this.view.offsetX) / this.view.scale,
      y: (sy - this.view.offsetY) / this.view.scale,
    };
  }

  worldToScreen(wx: number, wy: number): Point {
    return {
      x: wx * this.view.scale + this.view.offsetX,
      y: wy * this.view.scale + this.view.offsetY,
    };
  }

  resize() {
    const rect = this.canvas.parentElement!.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  destroy() {
    cancelAnimationFrame(this.animId);
    this.detachListeners();
  }

  private startLoop() {
    const render = () => {
      this.draw();
      this.animId = requestAnimationFrame(render);
    };
    this.animId = requestAnimationFrame(render);
  }

  private draw() {
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    this.ctx.clearRect(0, 0, w, h);

    renderGrid(this.ctx, this.view, w, h);

    if (this.project) {
      renderShapes(this.ctx, this.view, this.project);
    }

    if (this.selectedId && this.project) {
      const shape = this.findShape(this.selectedId);
      if (shape) {
        renderSelection(this.ctx, this.view, shape);
      }
    }

    this.toolHandler?.renderPreview?.(this.ctx, this.view);
  }

  private findShape(id: string): Shape | null {
    if (!this.project) return null;
    if (this.project.property?.id === id) return this.project.property;
    if (this.project.house?.id === id) return this.project.house;
    return this.project.zones.find((z) => z.id === id) ?? null;
  }

  findShapeAt(world: Point): Shape | null {
    if (!this.project) return null;
    const shapes: Shape[] = [
      ...this.project.zones.slice().reverse(),
      ...(this.project.house ? [this.project.house] : []),
      ...(this.project.property ? [this.project.property] : []),
    ];
    for (const shape of shapes) {
      if (pointInPolygon(world, shape.vertices)) return shape;
    }
    return null;
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(2, Math.min(200, this.view.scale * factor));

    const newOffsetX = mx - (mx - this.view.offsetX) * (newScale / this.view.scale);
    const newOffsetY = my - (my - this.view.offsetY) * (newScale / this.view.scale);

    this.view = { offsetX: newOffsetX, offsetY: newOffsetY, scale: newScale };
    this.onViewChange?.();
  };

  onViewChange?: () => void;

  private onPointerDown = (e: PointerEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      this.isPanning = true;
      this.lastPan = { x: e.clientX, y: e.clientY };
      this.canvas.setPointerCapture(e.pointerId);
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const world = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    this.toolHandler?.onPointerDown?.(world, e);
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.isPanning) {
      const dx = e.clientX - this.lastPan.x;
      const dy = e.clientY - this.lastPan.y;
      this.view = {
        ...this.view,
        offsetX: this.view.offsetX + dx,
        offsetY: this.view.offsetY + dy,
      };
      this.lastPan = { x: e.clientX, y: e.clientY };
      this.onViewChange?.();
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const world = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    this.toolHandler?.onPointerMove?.(world, e);
  };

  private onPointerUp = (e: PointerEvent) => {
    if (this.isPanning) {
      this.isPanning = false;
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const world = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    this.toolHandler?.onPointerUp?.(world, e);
  };

  private onDblClick = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const world = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    this.toolHandler?.onDoubleClick?.(world, e);
  };

  private attachListeners() {
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('dblclick', this.onDblClick);
  }

  private detachListeners() {
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('dblclick', this.onDblClick);
  }
}

function pointInPolygon(p: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
