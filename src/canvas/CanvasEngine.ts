import type { Point } from '../types/garden';

export interface Camera {
  pan: Point;
  zoom: number;
}

export type RenderCallback = (ctx: CanvasRenderingContext2D, engine: CanvasEngine) => void;

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pan: Point = { x: 0, y: 0 };
  private zoom = 1;
  private renderers: RenderCallback[] = [];
  private animFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2d context');
    this.ctx = ctx;
  }

  setCamera(pan: Point, zoom: number): void {
    this.pan = pan;
    this.zoom = zoom;
  }

  getCamera(): Camera {
    return { pan: { ...this.pan }, zoom: this.zoom };
  }

  /** Convert world coordinates to screen (pixel) coordinates */
  worldToScreen(wx: number, wy: number): Point {
    return {
      x: wx * this.zoom + this.pan.x,
      y: wy * this.zoom + this.pan.y,
    };
  }

  /** Convert screen (pixel) coordinates to world coordinates */
  screenToWorld(sx: number, sy: number): Point {
    return {
      x: (sx - this.pan.x) / this.zoom,
      y: (sy - this.pan.y) / this.zoom,
    };
  }

  getCanvasSize(): { width: number; height: number } {
    return { width: this.canvas.width, height: this.canvas.height };
  }

  addRenderer(renderer: RenderCallback): void {
    this.renderers.push(renderer);
  }

  clearRenderers(): void {
    this.renderers = [];
  }

  /** Single render pass */
  render(): void {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    for (const renderer of this.renderers) {
      renderer(this.ctx, this);
    }
  }

  /** Start the animation loop */
  start(): void {
    const loop = () => {
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  /** Stop the animation loop */
  stop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /** Resize canvas to match its display size */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
