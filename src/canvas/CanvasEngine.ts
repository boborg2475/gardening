import type { Point } from '../types/garden';

export class CanvasEngine {
  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  zoom = 1;
  panOffset: Point = { x: 0, y: 0 };
  width = 0;
  height = 0;
  private animFrameId = 0;
  private renderCallback: (() => void) | null = null;

  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
  }

  detach(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
    this.canvas = null;
    this.ctx = null;
  }

  resize(): void {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx?.scale(dpr, dpr);
  }

  worldToScreen(p: Point): Point {
    return {
      x: (p.x + this.panOffset.x) * this.zoom,
      y: (p.y + this.panOffset.y) * this.zoom,
    };
  }

  screenToWorld(p: Point): Point {
    return {
      x: p.x / this.zoom - this.panOffset.x,
      y: p.y / this.zoom - this.panOffset.y,
    };
  }

  startRenderLoop(callback: () => void): void {
    this.renderCallback = callback;
    const loop = () => {
      this.renderCallback?.();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  clear(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
