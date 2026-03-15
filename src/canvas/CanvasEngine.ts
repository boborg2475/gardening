import type { Point } from '../types/garden';

export class CanvasEngine {
  private pixelsPerFoot: number;
  private panX = 0;
  private panY = 0;
  private zoom = 1;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId = 0;
  private renderCallbacks: Array<(ctx: CanvasRenderingContext2D, engine: CanvasEngine) => void> = [];

  constructor(pixelsPerFoot = 20) {
    this.pixelsPerFoot = pixelsPerFoot;
  }

  worldToScreen(wx: number, wy: number): Point {
    return {
      x: wx * this.pixelsPerFoot * this.zoom + this.panX,
      y: wy * this.pixelsPerFoot * this.zoom + this.panY,
    };
  }

  screenToWorld(sx: number, sy: number): Point {
    return {
      x: (sx - this.panX) / (this.pixelsPerFoot * this.zoom),
      y: (sy - this.panY) / (this.pixelsPerFoot * this.zoom),
    };
  }

  setPan(x: number, y: number): void {
    this.panX = x;
    this.panY = y;
  }

  getPan(): Point {
    return { x: this.panX, y: this.panY };
  }

  setZoom(z: number): void {
    this.zoom = z;
  }

  getZoom(): number {
    return this.zoom;
  }

  getPixelsPerFoot(): number {
    return this.pixelsPerFoot;
  }

  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.startRenderLoop();
  }

  detach(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
    this.canvas = null;
    this.ctx = null;
  }

  onRender(callback: (ctx: CanvasRenderingContext2D, engine: CanvasEngine) => void): void {
    this.renderCallbacks.push(callback);
  }

  clearRenderCallbacks(): void {
    this.renderCallbacks = [];
  }

  private startRenderLoop(): void {
    const render = () => {
      if (!this.ctx || !this.canvas) return;
      const { width, height } = this.canvas;
      this.ctx.clearRect(0, 0, width, height);

      for (const cb of this.renderCallbacks) {
        cb(this.ctx, this);
      }

      this.animFrameId = requestAnimationFrame(render);
    };
    this.animFrameId = requestAnimationFrame(render);
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D | null {
    return this.ctx;
  }
}
