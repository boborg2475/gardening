import { describe, it, expect } from 'vitest';
import { CanvasEngine } from './CanvasEngine';

describe('CanvasEngine [LLD-04]', () => {
  const makeEngine = (zoom = 1, panX = 0, panY = 0) => {
    const engine = new CanvasEngine();
    engine.zoom = zoom;
    engine.panOffset = { x: panX, y: panY };
    return engine;
  };

  describe('worldToScreen', () => {
    it('should return identity at zoom=1 pan=0', () => {
      const engine = makeEngine();
      const screen = engine.worldToScreen({ x: 10, y: 20 });
      expect(screen.x).toBeCloseTo(10);
      expect(screen.y).toBeCloseTo(20);
    });

    it('should apply zoom', () => {
      const engine = makeEngine(2);
      const screen = engine.worldToScreen({ x: 10, y: 20 });
      expect(screen.x).toBeCloseTo(20);
      expect(screen.y).toBeCloseTo(40);
    });

    it('should apply pan offset', () => {
      const engine = makeEngine(1, 50, 100);
      const screen = engine.worldToScreen({ x: 10, y: 20 });
      expect(screen.x).toBeCloseTo(60);
      expect(screen.y).toBeCloseTo(120);
    });

    it('should apply both zoom and pan', () => {
      const engine = makeEngine(2, 50, 100);
      const screen = engine.worldToScreen({ x: 10, y: 20 });
      expect(screen.x).toBeCloseTo(120);
      expect(screen.y).toBeCloseTo(240);
    });
  });

  describe('screenToWorld', () => {
    it('should return identity at zoom=1 pan=0', () => {
      const engine = makeEngine();
      const world = engine.screenToWorld({ x: 10, y: 20 });
      expect(world.x).toBeCloseTo(10);
      expect(world.y).toBeCloseTo(20);
    });

    it('should be inverse of worldToScreen', () => {
      const engine = makeEngine(2.5, 30, -40);
      const original = { x: 15, y: 25 };
      const screen = engine.worldToScreen(original);
      const back = engine.screenToWorld(screen);
      expect(back.x).toBeCloseTo(original.x);
      expect(back.y).toBeCloseTo(original.y);
    });
  });
});
