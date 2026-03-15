import type { Point } from '../types/garden';

export interface CanvasTransform {
  panOffset: Point;
  zoom: number;
}

/**
 * Core canvas engine that manages the render loop and coordinate transforms.
 * Coordinates are stored in world units (feet) and transformed to screen pixels.
 */
export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private renderCallbacks: Array<(ctx: CanvasRenderingContext2D, transform: CanvasTransform) => void> = [];
  private _transform: CanvasTransform = { panOffset: { x: 0, y: 0 }, zoom: 1 };

  /** Pixels per world unit at zoom=1 */
  static readonly BASE_SCALE = 20;
  static readonly MIN_ZOOM = 0.1;
  static readonly MAX_ZOOM = 10;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2d context');
    this.ctx = ctx;
  }

  get transform(): CanvasTransform {
    return this._transform;
  }

  setTransform(t: Partial<CanvasTransform>): void {
    if (t.panOffset !== undefined) this._transform.panOffset = t.panOffset;
    if (t.zoom !== undefined) {
      this._transform.zoom = Math.max(CanvasEngine.MIN_ZOOM, Math.min(CanvasEngine.MAX_ZOOM, t.zoom));
    }
  }

  /** Convert world coordinates to screen pixels */
  worldToScreen(point: Point): Point {
    const scale = CanvasEngine.BASE_SCALE * this._transform.zoom;
    return {
      x: point.x * scale + this._transform.panOffset.x,
      y: point.y * scale + this._transform.panOffset.y,
    };
  }

  /** Convert screen pixels to world coordinates */
  screenToWorld(point: Point): Point {
    const scale = CanvasEngine.BASE_SCALE * this._transform.zoom;
    return {
      x: (point.x - this._transform.panOffset.x) / scale,
      y: (point.y - this._transform.panOffset.y) / scale,
    };
  }

  /** Register a render callback */
  onRender(callback: (ctx: CanvasRenderingContext2D, transform: CanvasTransform) => void): void {
    this.renderCallbacks.push(callback);
  }

  /** Clear all render callbacks */
  clearRenderCallbacks(): void {
    this.renderCallbacks = [];
  }

  /** Resize canvas to fill its container */
  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Single render frame */
  render(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
    for (const cb of this.renderCallbacks) {
      cb(this.ctx, this._transform);
    }
  }

  /** Start the render loop */
  start(): void {
    if (this.animationFrameId !== null) return;
    const loop = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  /** Stop the render loop */
  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /** Get canvas width in CSS pixels */
  get width(): number {
    return this.canvas.getBoundingClientRect().width;
  }

  /** Get canvas height in CSS pixels */
  get height(): number {
    return this.canvas.getBoundingClientRect().height;
  }
}
