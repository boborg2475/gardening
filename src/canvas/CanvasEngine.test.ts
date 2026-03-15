import { describe, it, expect } from 'vitest';
import { CanvasEngine } from './CanvasEngine';

describe('CanvasEngine [R5]', () => {
  describe('worldToScreen [R5.2]', () => {
    it('applies pan and zoom to convert world to screen coords', () => {
      const engine = new CanvasEngine();
      engine.setPan({ x: 100, y: 50 });
      engine.setZoom(2);

      const screen = engine.worldToScreen({ x: 10, y: 20 });
      // screen = world * zoom + pan
      expect(screen.x).toBe(10 * 2 + 100);
      expect(screen.y).toBe(20 * 2 + 50);
    });

    it('returns world coords directly when pan=0 zoom=1', () => {
      const engine = new CanvasEngine();
      const screen = engine.worldToScreen({ x: 5, y: 10 });
      expect(screen).toEqual({ x: 5, y: 10 });
    });
  });

  describe('screenToWorld [R5.3]', () => {
    it('inverts screen coords to world coords', () => {
      const engine = new CanvasEngine();
      engine.setPan({ x: 100, y: 50 });
      engine.setZoom(2);

      const world = engine.screenToWorld({ x: 120, y: 90 });
      // world = (screen - pan) / zoom
      expect(world.x).toBe((120 - 100) / 2);
      expect(world.y).toBe((90 - 50) / 2);
    });

    it('is the inverse of worldToScreen', () => {
      const engine = new CanvasEngine();
      engine.setPan({ x: -30, y: 75 });
      engine.setZoom(1.5);

      const original = { x: 42, y: 17 };
      const roundTrip = engine.screenToWorld(engine.worldToScreen(original));
      expect(roundTrip.x).toBeCloseTo(original.x);
      expect(roundTrip.y).toBeCloseTo(original.y);
    });
  });

  describe('renderer registration [R5.4]', () => {
    it('registers and retrieves renderers', () => {
      const engine = new CanvasEngine();
      const renderer = { render: () => {} };
      engine.addRenderer('test', renderer);
      expect(engine.getRenderers()).toContain(renderer);
    });

    it('maintains renderer order', () => {
      const engine = new CanvasEngine();
      const r1 = { render: () => {} };
      const r2 = { render: () => {} };
      engine.addRenderer('first', r1);
      engine.addRenderer('second', r2);
      const renderers = engine.getRenderers();
      expect(renderers[0]).toBe(r1);
      expect(renderers[1]).toBe(r2);
    });
  });

  describe('pan and zoom [R5.5, R5.6]', () => {
    it('stores pan offset', () => {
      const engine = new CanvasEngine();
      engine.setPan({ x: 50, y: -25 });
      expect(engine.getPan()).toEqual({ x: 50, y: -25 });
    });

    it('stores zoom level', () => {
      const engine = new CanvasEngine();
      engine.setZoom(3);
      expect(engine.getZoom()).toBe(3);
    });

    it('clamps zoom to minimum', () => {
      const engine = new CanvasEngine();
      engine.setZoom(0.01);
      expect(engine.getZoom()).toBeGreaterThanOrEqual(0.1);
    });

    it('clamps zoom to maximum', () => {
      const engine = new CanvasEngine();
      engine.setZoom(100);
      expect(engine.getZoom()).toBeLessThanOrEqual(20);
    });
  });
});
