import type { StoreApi } from 'zustand';
import type { ProjectState } from '../store/projectStore';
import type { UIState } from '../store/uiStore';
import type { Viewport } from './types';
import { renderGrid } from './renderers/grid';

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement;
  private projectStore: StoreApi<ProjectState>;
  private uiStore: StoreApi<UIState>;

  private animationFrameId: number | null = null;
  private needsRender = false;
  private mounted = false;
  private resizeObserver: ResizeObserver | null = null;
  private unsubscribeProject: (() => void) | null = null;
  private unsubscribeUI: (() => void) | null = null;

  constructor(
    container: HTMLElement,
    projectStore: StoreApi<ProjectState>,
    uiStore: StoreApi<UIState>,
  ) {
    this.container = container;
    this.projectStore = projectStore;
    this.uiStore = uiStore;
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    const ctx = this.canvas.getContext('2d');
    // In test environments (jsdom), getContext returns null.
    // Provide a no-op fallback so the engine can still be tested for logic.
    this.ctx = ctx ?? ({} as CanvasRenderingContext2D);
  }

  mount(): void {
    if (this.mounted) return;
    this.mounted = true;

    this.container.appendChild(this.canvas);
    this.resizeCanvas();

    this.unsubscribeProject = this.projectStore.subscribe(() => {
      this.needsRender = true;
    });
    this.unsubscribeUI = this.uiStore.subscribe(() => {
      this.needsRender = true;
    });

    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });
    this.resizeObserver.observe(this.container);

    this.needsRender = true;
    this.startLoop();
  }

  unmount(): void {
    if (!this.mounted) return;
    this.mounted = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.unsubscribeProject?.();
    this.unsubscribeUI?.();
    this.unsubscribeProject = null;
    this.unsubscribeUI = null;

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.canvas.parentElement) {
      this.canvas.remove();
    }
  }

  worldToScreen(x: number, y: number): { sx: number; sy: number } {
    const { panX, panY, zoom } = this.uiStore.getState();
    return {
      sx: (x - panX) * zoom,
      sy: (y - panY) * zoom,
    };
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    const { panX, panY, zoom } = this.uiStore.getState();
    return {
      x: sx / zoom + panX,
      y: sy / zoom + panY,
    };
  }

  setZoom(newZoom: number, focalPoint: { sx: number; sy: number }): void {
    const clamped = Math.min(10, Math.max(0.1, newZoom));
    const { panX, panY, zoom: oldZoom } = this.uiStore.getState();

    // World point under the cursor before zoom
    const wx = focalPoint.sx / oldZoom + panX;
    const wy = focalPoint.sy / oldZoom + panY;

    // Adjust pan so (wx, wy) stays at the same screen position
    const newPanX = wx - focalPoint.sx / clamped;
    const newPanY = wy - focalPoint.sy / clamped;

    this.uiStore.getState().setPan(newPanX, newPanY);
    this.uiStore.getState().setZoom(clamped);
  }

  pan(dxScreen: number, dyScreen: number): void {
    const { panX, panY, zoom } = this.uiStore.getState();
    this.uiStore.getState().setPan(
      panX - dxScreen / zoom,
      panY - dyScreen / zoom,
    );
  }

  getViewport(): Viewport {
    const { panX, panY, zoom } = this.uiStore.getState();
    const rect = this.container.getBoundingClientRect();
    return {
      panX,
      panY,
      zoom,
      canvasWidth: rect.width,
      canvasHeight: rect.height,
    };
  }

  render(): void {
    const viewport = this.getViewport();
    const uiState = this.uiStore.getState();

    this.ctx.clearRect(0, 0, viewport.canvasWidth, viewport.canvasHeight);

    if (uiState.layers.grid) {
      const projectState = this.projectStore.getState();
      renderGrid(this.ctx, viewport, {
        minorSpacing: 1,
        majorEvery: 5,
        units: projectState.units,
      });
    }
  }

  private startLoop(): void {
    const loop = () => {
      if (!this.mounted) return;
      this.animationFrameId = requestAnimationFrame(loop);
      if (!this.needsRender) return;
      this.needsRender = false;
      this.render();
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private resizeCanvas(): void {
    const rect = this.container.getBoundingClientRect();
    const dpr = this.getDevicePixelRatio();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.ctx.setTransform?.(dpr, 0, 0, dpr, 0, 0);

    this.needsRender = true;
  }

  private getDevicePixelRatio(): number {
    return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  }
}
