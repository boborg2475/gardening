import { describe, it, expect, vi } from 'vitest';
import { CanvasEngine } from './CanvasEngine';

describe('CanvasEngine [BMAD-canvas-engine]', () => {
  function createMockCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    // jsdom doesn't support canvas 2d context, so we mock it
    const mockCtx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      closePath: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      setTransform: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      arc: vi.fn(),
      setLineDash: vi.fn(),
      canvas,
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx);
    return canvas;
  }

  describe('coordinate transforms', () => {
    it('should convert world to screen at default pan/zoom', () => {
      const engine = new CanvasEngine(createMockCanvas());
      const screen = engine.worldToScreen(10, 20);
      expect(screen.x).toBeCloseTo(10);
      expect(screen.y).toBeCloseTo(20);
    });

    it('should apply zoom to world-to-screen conversion', () => {
      const engine = new CanvasEngine(createMockCanvas());
      engine.setCamera({ x: 0, y: 0 }, 2);
      const screen = engine.worldToScreen(10, 20);
      expect(screen.x).toBeCloseTo(20);
      expect(screen.y).toBeCloseTo(40);
    });

    it('should apply pan to world-to-screen conversion', () => {
      const engine = new CanvasEngine(createMockCanvas());
      engine.setCamera({ x: 100, y: 50 }, 1);
      const screen = engine.worldToScreen(10, 20);
      expect(screen.x).toBeCloseTo(110);
      expect(screen.y).toBeCloseTo(70);
    });

    it('should round-trip world to screen to world', () => {
      const engine = new CanvasEngine(createMockCanvas());
      engine.setCamera({ x: 150, y: -30 }, 2.5);
      const screen = engine.worldToScreen(42, 77);
      const world = engine.screenToWorld(screen.x, screen.y);
      expect(world.x).toBeCloseTo(42);
      expect(world.y).toBeCloseTo(77);
    });

    it('should convert screen to world correctly', () => {
      const engine = new CanvasEngine(createMockCanvas());
      engine.setCamera({ x: 100, y: 50 }, 2);
      const world = engine.screenToWorld(120, 90);
      expect(world.x).toBeCloseTo(10);
      expect(world.y).toBeCloseTo(20);
    });
  });

  describe('camera', () => {
    it('should store camera state', () => {
      const engine = new CanvasEngine(createMockCanvas());
      engine.setCamera({ x: 50, y: 75 }, 3);
      const camera = engine.getCamera();
      expect(camera.pan).toEqual({ x: 50, y: 75 });
      expect(camera.zoom).toBe(3);
    });
  });
});
