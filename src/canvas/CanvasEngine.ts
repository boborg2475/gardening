import type { Point } from '../types/garden';

export interface Renderer {
  render: (ctx: CanvasRenderingContext2D, engine: CanvasEngine) => void;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 20;

export class CanvasEngine {
  private pan: Point = { x: 0, y: 0 };
  private zoom = 1;
  private renderers: Array<{ name: string; renderer: Renderer }> = [];
  private canvas: HTMLCanvasElement | null = null;
  private animFrameId: number | null = null;

  // ── Coordinate transforms ───────────────────────────
  worldToScreen(p: Point): Point {
    return {
      x: p.x * this.zoom + this.pan.x,
      y: p.y * this.zoom + this.pan.y,
    };
  }

  screenToWorld(p: Point): Point {
    return {
      x: (p.x - this.pan.x) / this.zoom,
      y: (p.y - this.pan.y) / this.zoom,
    };
  }

  // ── Pan / Zoom ──────────────────────────────────────
  setPan(offset: Point): void {
    this.pan = offset;
  }

  getPan(): Point {
    return { ...this.pan };
  }

  setZoom(level: number): void {
    this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, level));
  }

  getZoom(): number {
    return this.zoom;
  }

  // ── Renderers ───────────────────────────────────────
  addRenderer(name: string, renderer: Renderer): void {
    this.renderers.push({ name, renderer });
  }

  getRenderers(): Renderer[] {
    return this.renderers.map((r) => r.renderer);
  }

  // ── Canvas lifecycle ────────────────────────────────
  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.startLoop();
  }

  detach(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.canvas = null;
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  private startLoop(): void {
    const frame = () => {
      this.renderFrame();
      this.animFrameId = requestAnimationFrame(frame);
    };
    this.animFrameId = requestAnimationFrame(frame);
  }

  private renderFrame(): void {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = this.canvas;
    ctx.clearRect(0, 0, width, height);

    for (const { renderer } of this.renderers) {
      ctx.save();
      renderer.render(ctx, this);
      ctx.restore();
    }
  }
}
