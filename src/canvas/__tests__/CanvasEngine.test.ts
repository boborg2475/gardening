import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CanvasEngine } from '../CanvasEngine';
import { createProjectStore } from '../../store/projectStore';
import { createUIStore } from '../../store/uiStore';

// Mock ResizeObserver for jsdom
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

function createMockContainer() {
  const container = document.createElement('div');
  // Mock getBoundingClientRect for resize logic
  container.getBoundingClientRect = () => ({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    bottom: 600,
    right: 800,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  document.body.appendChild(container);
  return container;
}

describe('CanvasEngine [LLD-01, BEAM-CE-001]', () => {
  let engine: CanvasEngine;
  let container: HTMLElement;
  let projectStore: ReturnType<typeof createProjectStore>;
  let uiStore: ReturnType<typeof createUIStore>;

  beforeEach(() => {
    vi.useFakeTimers();
    container = createMockContainer();
    projectStore = createProjectStore();
    uiStore = createUIStore();
    engine = new CanvasEngine(container, projectStore, uiStore);
  });

  afterEach(() => {
    engine.unmount();
    container.remove();
    vi.useRealTimers();
  });

  describe('worldToScreen [BEAM-CE-002]', () => {
    it('converts world coords to screen with default viewport (pan=0, zoom=1)', () => {
      const result = engine.worldToScreen(10, 20);
      expect(result).toEqual({ sx: 10, sy: 20 });
    });

    it('applies zoom factor', () => {
      uiStore.getState().setZoom(2);
      const result = engine.worldToScreen(10, 20);
      expect(result).toEqual({ sx: 20, sy: 40 });
    });

    it('applies pan offset', () => {
      uiStore.getState().setPan(5, 10);
      const result = engine.worldToScreen(10, 20);
      expect(result).toEqual({ sx: 5, sy: 10 });
    });

    it('applies both pan and zoom', () => {
      uiStore.getState().setPan(5, 10);
      uiStore.getState().setZoom(2);
      // sx = (10 - 5) * 2 = 10, sy = (20 - 10) * 2 = 20
      const result = engine.worldToScreen(10, 20);
      expect(result).toEqual({ sx: 10, sy: 20 });
    });
  });

  describe('screenToWorld [BEAM-CE-003]', () => {
    it('converts screen coords to world with default viewport', () => {
      const result = engine.screenToWorld(10, 20);
      expect(result).toEqual({ x: 10, y: 20 });
    });

    it('applies zoom factor', () => {
      uiStore.getState().setZoom(2);
      const result = engine.screenToWorld(20, 40);
      expect(result).toEqual({ x: 10, y: 20 });
    });

    it('applies pan offset', () => {
      uiStore.getState().setPan(5, 10);
      const result = engine.screenToWorld(5, 10);
      expect(result).toEqual({ x: 10, y: 20 });
    });

    it('is the inverse of worldToScreen', () => {
      uiStore.getState().setPan(3, 7);
      uiStore.getState().setZoom(2.5);
      const screen = engine.worldToScreen(15, 25);
      const world = engine.screenToWorld(screen.sx, screen.sy);
      expect(world.x).toBeCloseTo(15);
      expect(world.y).toBeCloseTo(25);
    });
  });

  describe('setZoom [BEAM-CE-004, BEAM-CE-005]', () => {
    it('zooms centered on focal point — world point under cursor stays fixed', () => {
      // At zoom=1, pan=(0,0), screen (100,100) maps to world (100,100)
      engine.setZoom(2, { sx: 100, sy: 100 });

      const state = uiStore.getState();
      expect(state.zoom).toBe(2);

      // World point (100,100) should still map to screen (100,100)
      const screen = engine.worldToScreen(100, 100);
      expect(screen.sx).toBeCloseTo(100);
      expect(screen.sy).toBeCloseTo(100);
    });

    it('clamps zoom to minimum 0.1', () => {
      engine.setZoom(0.01, { sx: 0, sy: 0 });
      expect(uiStore.getState().zoom).toBe(0.1);
    });

    it('clamps zoom to maximum 10', () => {
      engine.setZoom(20, { sx: 0, sy: 0 });
      expect(uiStore.getState().zoom).toBe(10);
    });
  });

  describe('pan [BEAM-CE-006]', () => {
    it('adjusts pan by screen delta converted to world units', () => {
      // At zoom=1, dragging 10px right should pan world left by 10
      engine.pan(10, 5);
      const state = uiStore.getState();
      expect(state.panX).toBe(-10);
      expect(state.panY).toBe(-5);
    });

    it('scales delta by zoom level', () => {
      uiStore.getState().setZoom(2);
      engine.pan(10, 10);
      const state = uiStore.getState();
      expect(state.panX).toBe(-5);
      expect(state.panY).toBe(-5);
    });
  });

  describe('mount / unmount [BEAM-CE-001]', () => {
    it('appends a canvas element to the container on mount', () => {
      engine.mount();
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();
    });

    it('removes the canvas element on unmount', () => {
      engine.mount();
      engine.unmount();
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeFalsy();
    });

    it('is safe to call unmount without mount', () => {
      expect(() => engine.unmount()).not.toThrow();
    });

    it('is safe to call unmount twice', () => {
      engine.mount();
      engine.unmount();
      expect(() => engine.unmount()).not.toThrow();
    });
  });

  describe('getViewport [LLD-01]', () => {
    it('returns current viewport state', () => {
      engine.mount();
      const viewport = engine.getViewport();
      expect(viewport.panX).toBe(0);
      expect(viewport.panY).toBe(0);
      expect(viewport.zoom).toBe(1);
      expect(viewport.canvasWidth).toBe(800);
      expect(viewport.canvasHeight).toBe(600);
    });
  });
});
